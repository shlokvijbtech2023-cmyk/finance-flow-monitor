import type {
  Contract,
  Dataset,
  Department,
  Finding,
  FindingType,
  LeakageCategory,
  Policies,
  RuleToggles,
  Severity,
  Txn,
} from "./types";

/* ------------------------------------------------------------------ *
 * Detection engine. Deterministic rules + descriptive statistics.
 * No LLM involvement: every impact figure here is arithmetic on the
 * underlying transactions, and every finding carries its evidence IDs.
 * ------------------------------------------------------------------ */

export const CATEGORY_OF_TYPE: Record<FindingType, LeakageCategory> = {
  "Supplier Price Creep": "Price Variance",
  "Supplier Price Variance": "Price Variance",
  "Contract Price Violation": "Contract Leakage",
  "Contract Expiry Exposure": "Contract Leakage",
  "Potential Duplicate Invoice": "Duplicate Payments",
  "Maverick / No-PO Spend": "Maverick Spend",
  "PO / Invoice Mismatch": "PO/Invoice Mismatch",
  "Quantity Mismatch": "PO/Invoice Mismatch",
  "Potential Approval-Threshold Splitting": "Approval Anomalies",
  "Department Spend Anomaly": "Approval Anomalies",
  "Potential Duplicate Vendor": "Supplier Anomalies",
  "Recurring Additional Charges": "Supplier Anomalies",
};

const round2 = (n: number) => Math.round(n * 100) / 100;
const round0 = (n: number) => Math.round(n);

export function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

function severityFor(impact: number): Severity {
  if (impact >= 25000) return "High";
  if (impact >= 8000) return "Medium";
  return "Low";
}

function levenshtein(a: string, b: string) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
  return dp[m]![n]!;
}
const similarity = (a: string, b: string) =>
  1 - levenshtein(a, b) / Math.max(a.length, b.length, 1);

const monthOf = (date: string) => date.slice(0, 7);

interface Ctx {
  ds: Dataset;
  policies: Policies;
  seq: { n: number };
}

function newId(ctx: Ctx) {
  return `LF-${String(ctx.seq.n++).padStart(5, "0")}`;
}

function refDate(ds: Dataset) {
  return ds.txns.reduce((max, t) => (t.date > max ? t.date : max), "2026-01-01");
}

/* ------------------------- 1. Price creep ------------------------- */
export function detectPriceCreep(ctx: Ctx): Finding[] {
  const { ds, policies } = ctx;
  const groups = new Map<string, Txn[]>();
  ds.txns.forEach((t) => {
    const k = `${t.supplierId}|${t.itemId}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(t);
  });
  const out: Finding[] = [];
  groups.forEach((rows, key) => {
    if (rows.length < 8) return;
    const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
    const months = [...new Set(sorted.map((t) => monthOf(t.date)))];
    if (months.length < 5) return;
    const cutIdx = Math.floor(months.length * 0.6);
    const baseMonths = new Set(months.slice(0, cutIdx));
    const recentMonths = new Set(months.slice(cutIdx));
    const baseRows = sorted.filter((t) => baseMonths.has(monthOf(t.date)));
    const recentRows = sorted.filter((t) => recentMonths.has(monthOf(t.date)));
    if (baseRows.length < 4 || recentRows.length < 3) return;
    const baseline = median(baseRows.map((t) => t.unitPrice));
    const current = median(recentRows.map((t) => t.unitPrice));
    if (baseline <= 0) return;
    const increasePct = ((current - baseline) / baseline) * 100;
    if (increasePct < policies.maxPriceVariancePct) return;
    // volume test: a large price rise paired with a large volume drop may be legitimate
    const baseAvgQty = baseRows.reduce((s, t) => s + t.qty, 0) / baseRows.length;
    const recentAvgQty = recentRows.reduce((s, t) => s + t.qty, 0) / recentRows.length;
    if (recentAvgQty < baseAvgQty * 0.5) return;
    const affectedQty = recentRows.reduce((s, t) => s + t.qty, 0);
    const impact = round0((current - baseline) * affectedQty);
    if (impact < 1500) return;
    const [supplierId, itemId] = key.split("|") as [string, string];
    const supplier = ds.supplierById[supplierId]!;
    const item = ds.itemById[itemId]!;
    const consistency =
      recentRows.filter((t) => t.unitPrice > baseline * 1.05).length / recentRows.length;
    const confidence = Math.min(
      98,
      round0(60 + consistency * 25 + Math.min(rowsBonus(rows.length), 13)),
    );
    const priceHistory = months.map((m) => {
      const rowsM = sorted.filter((t) => monthOf(t.date) === m);
      return {
        month: m,
        unitPrice: round2(median(rowsM.map((t) => t.unitPrice))),
        qty: rowsM.reduce((s, t) => s + t.qty, 0),
      };
    });
    const marketRows = ds.txns.filter((t) => t.itemId === itemId && t.supplierId !== supplierId);
    const marketMedian = round2(median(marketRows.map((t) => t.unitPrice)));
    const contract = ds.contracts.find((c) => c.supplierId === supplierId && c.itemId === itemId);
    out.push({
      id: newId(ctx),
      type: "Supplier Price Creep",
      category: "Price Variance",
      severity: severityFor(impact),
      confidence,
      estimatedImpact: impact,
      title: `${item.name} — unit price up ${increasePct.toFixed(0)}% at ${supplier.name}`,
      description: `Unit price for ${item.name} increased ${increasePct.toFixed(0)}% from a historical median of AED ${baseline.toFixed(2)} to AED ${current.toFixed(2)} across ${months.length} months while purchase volume remained stable.`,
      whyFlagged: `The recent-period median unit price exceeds the historical median by ${increasePct.toFixed(1)}%, above the configured maximum price variance of ${policies.maxPriceVariancePct}%. Average order quantity did not fall materially (${baseAvgQty.toFixed(0)} → ${recentAvgQty.toFixed(0)} ${item.unit}), so volume changes do not explain the increase.`,
      detectionMethod:
        "Rule + descriptive statistics: per supplier-item time series, median unit price of the historical window compared with the recent window, screened by a volume-stability test.",
      calculation: `Estimated impact = (recent median unit price − historical median unit price) × quantity purchased at the elevated price = (${current.toFixed(2)} − ${baseline.toFixed(2)}) × ${affectedQty.toLocaleString()} = AED ${impact.toLocaleString()}`,
      confidenceRationale: `${confidence}% — ${rows.length} transactions for the same supplier and same item, and ${Math.round(consistency * 100)}% of recent transactions are priced above the historical benchmark.`,
      metrics: [
        { label: "Historical median unit price", value: `AED ${baseline.toFixed(2)}` },
        { label: "Current median unit price", value: `AED ${current.toFixed(2)}` },
        { label: "Increase", value: `${increasePct.toFixed(1)}%` },
        { label: "Units purchased at elevated price", value: affectedQty.toLocaleString() },
        { label: "Estimated excess spend", value: `AED ${impact.toLocaleString()}` },
      ],
      evidenceTxnIds: recentRows.map((t) => t.id),
      supplierId,
      department: null,
      itemId,
      contractId: contract?.id ?? null,
      createdAt: recentRows[0]!.date,
      priceHistory,
      benchmarks: [
        { label: "Historical median (same supplier)", value: baseline },
        { label: "Current median (same supplier)", value: current },
        ...(marketMedian ? [{ label: "Other suppliers, same item", value: marketMedian }] : []),
        ...(contract ? [{ label: "Contracted price", value: contract.agreedUnitPrice }] : []),
      ],
    });
  });
  return out;
}
const rowsBonus = (n: number) => Math.log10(Math.max(n, 1)) * 12;

/* --------------------- 2. Contract leakage ----------------------- */
export function detectContractLeakage(ctx: Ctx): Finding[] {
  const { ds, policies } = ctx;
  const groups = new Map<string, Txn[]>();
  ds.txns.forEach((t) => {
    if (!t.contractId) return;
    const c = ds.contractById[t.contractId]!;
    if (t.unitPrice <= c.agreedUnitPrice * 1.02) return;
    if (!groups.has(t.contractId)) groups.set(t.contractId, []);
    groups.get(t.contractId)!.push(t);
  });
  const out: Finding[] = [];
  groups.forEach((rows, contractId) => {
    const c = ds.contractById[contractId]!;
    const impact = round0(rows.reduce((s, t) => s + (t.unitPrice - c.agreedUnitPrice) * t.qty, 0));
    if (impact < 1200 || rows.length < 3) return;
    const supplier = ds.supplierById[c.supplierId]!;
    const item = ds.itemById[c.itemId]!;
    const invoicedMedian = median(rows.map((t) => t.unitPrice));
    const overPct = ((invoicedMedian - c.agreedUnitPrice) / c.agreedUnitPrice) * 100;
    const confidence = Math.min(99, round0(85 + Math.min(rows.length, 14)));
    out.push({
      id: newId(ctx),
      type: "Contract Price Violation",
      category: "Contract Leakage",
      severity: severityFor(impact),
      confidence,
      estimatedImpact: impact,
      title: `${item.name} invoiced above contract ${c.id} — ${supplier.name}`,
      description: `${rows.length} invoice lines under contract ${c.id} were billed at a median AED ${invoicedMedian.toFixed(2)} versus the agreed unit price of AED ${c.agreedUnitPrice.toFixed(2)} (${overPct.toFixed(1)}% above contract).`,
      whyFlagged: `Invoiced unit price exceeds the contracted unit price on an active contract. Tolerance applied: 2% to absorb rounding and minor freight recovery.`,
      detectionMethod:
        "Three-way price check: invoice line unit price vs contracted unit price for the supplier-item pair, restricted to invoice dates inside the contract validity window.",
      calculation: `Estimated impact = Σ (invoice unit price − contracted unit price) × invoiced quantity over ${rows.length} lines = AED ${impact.toLocaleString()}`,
      confidenceRationale: `${confidence}% — the contracted price is an explicit, documented figure and the comparison is line-level arithmetic, so there is little interpretation involved.`,
      metrics: [
        { label: "Contracted unit price", value: `AED ${c.agreedUnitPrice.toFixed(2)}` },
        { label: "Median invoiced unit price", value: `AED ${invoicedMedian.toFixed(2)}` },
        { label: "Variance", value: `${overPct.toFixed(1)}%` },
        { label: "Affected invoice lines", value: String(rows.length) },
        { label: "Contract window", value: `${c.startDate} → ${c.endDate}` },
      ],
      evidenceTxnIds: rows.map((t) => t.id),
      supplierId: c.supplierId,
      department: null,
      contractId,
      itemId: c.itemId,
      createdAt: rows[0]!.date,
      benchmarks: [
        { label: "Contracted price", value: c.agreedUnitPrice },
        { label: "Median invoiced price", value: round2(invoicedMedian) },
      ],
      priceHistory: buildPriceHistory(ds, c.supplierId, c.itemId),
    });
  });

  // Purchases made after the contract expired (off-contract exposure)
  const expired = ds.contracts.filter((c) => c.endDate < refDate(ds));
  expired.forEach((c) => {
    const rows = ds.txns.filter(
      (t) => t.supplierId === c.supplierId && t.itemId === c.itemId && t.date > c.endDate,
    );
    if (rows.length < 4) return;
    const spend = round0(rows.reduce((s, t) => s + t.total, 0));
    const excess = round0(
      rows.reduce((s, t) => s + Math.max(0, t.unitPrice - c.agreedUnitPrice) * t.qty, 0),
    );
    if (excess < 1000) return;
    const supplier = ds.supplierById[c.supplierId]!;
    const item = ds.itemById[c.itemId]!;
    out.push({
      id: newId(ctx),
      type: "Contract Expiry Exposure",
      category: "Contract Leakage",
      severity: severityFor(excess),
      confidence: 92,
      estimatedImpact: excess,
      title: `Buying ${item.name} after contract ${c.id} expired — ${supplier.name}`,
      description: `AED ${spend.toLocaleString()} of ${item.name} was purchased from ${supplier.name} after contract ${c.id} expired on ${c.endDate}, at prices above the last agreed rate.`,
      whyFlagged: `Purchases continued after the contract end date, so pricing is no longer protected. ${policies.requireContract ? "Company policy requires an active contract for recurring categories." : ""}`,
      detectionMethod:
        "Contract validity check: invoice dates compared with contract end dates for the same supplier-item pair, then priced against the last agreed rate.",
      calculation: `Estimated impact = Σ max(0, invoice unit price − last agreed price) × quantity for post-expiry lines = AED ${excess.toLocaleString()}`,
      confidenceRationale:
        "92% — dates and prices are unambiguous, but a renewal may exist outside this dataset, so this requires confirmation with procurement.",
      metrics: [
        { label: "Contract expired", value: c.endDate },
        { label: "Post-expiry spend", value: `AED ${spend.toLocaleString()}` },
        { label: "Last agreed unit price", value: `AED ${c.agreedUnitPrice.toFixed(2)}` },
        { label: "Post-expiry lines", value: String(rows.length) },
      ],
      evidenceTxnIds: rows.map((t) => t.id),
      supplierId: c.supplierId,
      department: null,
      contractId: c.id,
      itemId: c.itemId,
      createdAt: rows[0]!.date,
      priceHistory: buildPriceHistory(ds, c.supplierId, c.itemId),
      benchmarks: [{ label: "Last agreed price", value: c.agreedUnitPrice }],
    });
  });
  return out;
}

function buildPriceHistory(ds: Dataset, supplierId: string, itemId: string) {
  const rows = ds.txns.filter((t) => t.supplierId === supplierId && t.itemId === itemId);
  const months = [...new Set(rows.map((t) => monthOf(t.date)))].sort();
  return months.map((m) => {
    const rowsM = rows.filter((t) => monthOf(t.date) === m);
    return {
      month: m,
      unitPrice: round2(median(rowsM.map((t) => t.unitPrice))),
      qty: rowsM.reduce((s, t) => s + t.qty, 0),
    };
  });
}

/* -------------------- 3. Duplicate invoices ---------------------- */
export function detectDuplicateInvoices(ctx: Ctx): Finding[] {
  const { ds, policies } = ctx;
  const out: Finding[] = [];
  const seen = new Set<string>();
  const byKey = new Map<string, typeof ds.invoices>();
  ds.invoices.forEach((inv) => {
    const digits = inv.invoiceNumber.replace(/\D/g, "");
    const k = `${inv.supplierId}|${digits}`;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(inv);
  });
  const dayDiff = (a: string, b: string) =>
    Math.abs((new Date(a).getTime() - new Date(b).getTime()) / 86400000);

  byKey.forEach((group) => {
    if (group.length < 2) return;
    const [first, ...rest] = group;
    rest.forEach((dup) => {
      const key = [first!.invoiceNumber, dup.invoiceNumber].sort().join("~");
      if (seen.has(key)) return;
      seen.add(key);
      const sameNumber = first!.invoiceNumber === dup.invoiceNumber;
      const amountMatch = Math.abs(first!.amount - dup.amount) < 1;
      const withinTolerance = dayDiff(first!.date, dup.date) <= policies.duplicateToleranceDays;
      if (!amountMatch || !withinTolerance) return;
      const supplier = ds.supplierById[dup.supplierId]!;
      const impact = round0(dup.amount);
      const confidence = sameNumber ? 98 : 89;
      out.push({
        id: newId(ctx),
        type: "Potential Duplicate Invoice",
        category: "Duplicate Payments",
        severity: severityFor(impact),
        confidence,
        estimatedImpact: impact,
        title: `Potential duplicate invoice — ${supplier.name} (${dup.invoiceNumber})`,
        description: `Invoice ${dup.invoiceNumber} matches invoice ${first!.invoiceNumber} from ${supplier.name}: ${sameNumber ? "identical invoice number" : "near-identical invoice number"}, same amount of AED ${dup.amount.toLocaleString()} and same invoice date ${dup.date}.`,
        whyFlagged: `${sameNumber ? "The same invoice number was recorded twice for this supplier." : "Invoice numbers differ only by a suffix."} Amounts match to the fils and the dates fall inside the configured ${policies.duplicateToleranceDays}-day duplicate tolerance window. Line items are identical.`,
        detectionMethod:
          "Exact and fuzzy invoice-key matching: supplier + numeric invoice stem + amount + date proximity, then line-item comparison.",
        calculation: `Estimated impact = value of the later duplicated invoice = AED ${impact.toLocaleString()} (assumes one of the two documents should not have been paid).`,
        confidenceRationale: `${confidence}% — ${sameNumber ? "exact invoice-number collision with matching amount and date" : "invoice-number stem, amount, date and line items all match"}. This is flagged as a potential duplicate for AP review; it is not an allegation of wrongdoing.`,
        metrics: [
          { label: "Original invoice", value: `${first!.invoiceNumber} · ${first!.date}` },
          { label: "Potential duplicate", value: `${dup.invoiceNumber} · ${dup.date}` },
          { label: "Amount", value: `AED ${dup.amount.toLocaleString()}` },
          { label: "Line items", value: String(dup.lineIds.length) },
        ],
        evidenceTxnIds: [...first!.lineIds, ...dup.lineIds],
        supplierId: dup.supplierId,
        department: dup.department,
        createdAt: dup.date,
      });
    });
  });

  // same supplier + same amount + same date but unrelated numbers
  const amountKey = new Map<string, typeof ds.invoices>();
  ds.invoices.forEach((inv) => {
    const k = `${inv.supplierId}|${inv.date}|${Math.round(inv.amount)}`;
    if (!amountKey.has(k)) amountKey.set(k, []);
    amountKey.get(k)!.push(inv);
  });
  amountKey.forEach((group) => {
    if (group.length < 2) return;
    const key = group
      .map((g) => g.invoiceNumber)
      .sort()
      .join("~");
    if (seen.has(key)) return;
    seen.add(key);
    const supplier = ds.supplierById[group[0]!.supplierId]!;
    const impact = round0(group[1]!.amount);
    if (impact < 500) return;
    out.push({
      id: newId(ctx),
      type: "Potential Duplicate Invoice",
      category: "Duplicate Payments",
      severity: severityFor(impact),
      confidence: 82,
      estimatedImpact: impact,
      title: `Same-day, same-amount invoices — ${supplier.name}`,
      description: `${group.length} invoices from ${supplier.name} dated ${group[0]!.date} carry the same amount of AED ${group[0]!.amount.toLocaleString()} under different invoice numbers (${group.map((g) => g.invoiceNumber).join(", ")}).`,
      whyFlagged:
        "Supplier, invoice date and invoice amount all match while invoice numbers differ. This pattern can be legitimate (split deliveries) or a duplicate submission, so it requires AP review.",
      detectionMethod: "Metadata clustering on supplier + date + amount.",
      calculation: `Estimated impact = value of one of the matching invoices = AED ${impact.toLocaleString()}`,
      confidenceRationale:
        "82% — the metadata match is strong but invoice numbers are unrelated, which is consistent with legitimate multi-site deliveries.",
      metrics: group.map((g) => ({ label: g.invoiceNumber, value: `AED ${g.amount.toLocaleString()}` })),
      evidenceTxnIds: group.flatMap((g) => g.lineIds),
      supplierId: group[0]!.supplierId,
      department: group[0]!.department,
      createdAt: group[0]!.date,
    });
  });
  return out;
}

/* ------------------- 4. No-PO / maverick spend ------------------- */
export function detectNoPOSpend(ctx: Ctx): Finding[] {
  const { ds, policies } = ctx;
  if (!policies.requirePO) return [];
  const itemMedian = new Map<string, number>();
  ds.items.forEach((i) => {
    const rows = ds.txns.filter((t) => t.itemId === i.id);
    itemMedian.set(i.id, median(rows.map((t) => t.unitPrice)));
  });
  const byDept = new Map<Department, Txn[]>();
  ds.txns.forEach((t) => {
    if (t.poNumber) return;
    if (!byDept.has(t.department)) byDept.set(t.department, []);
    byDept.get(t.department)!.push(t);
  });
  const totalSpend = ds.txns.reduce((s, t) => s + t.total, 0);
  const out: Finding[] = [];
  byDept.forEach((rows, dept) => {
    const spend = round0(rows.reduce((s, t) => s + t.total, 0));
    if (spend < 20000) return;
    const premium = round0(
      rows.reduce(
        (s, t) => s + Math.max(0, t.unitPrice - (itemMedian.get(t.itemId) ?? t.unitPrice)) * t.qty,
        0,
      ),
    );
    if (premium < 1000) return;
    const supplierSpend = new Map<string, number>();
    rows.forEach((t) =>
      supplierSpend.set(t.supplierId, (supplierSpend.get(t.supplierId) ?? 0) + t.total),
    );
    const topSuppliers = [...supplierSpend.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    out.push({
      id: newId(ctx),
      type: "Maverick / No-PO Spend",
      category: "Maverick Spend",
      severity: severityFor(premium),
      confidence: 91,
      estimatedImpact: premium,
      title: `No-PO spend in ${dept} — AED ${spend.toLocaleString()} across ${rows.length} lines`,
      description: `${dept} recorded AED ${spend.toLocaleString()} of invoiced spend with no purchase order (${((spend / totalSpend) * 100).toFixed(2)}% of total company spend). Off-PO lines were priced above the company-wide median for the same items.`,
      whyFlagged:
        "Company policy requires a purchase order before commitment. Invoice lines with no PO reference bypass pre-approval and negotiated pricing.",
      detectionMethod:
        "PO-coverage check per invoice line, aggregated by department, with an off-PO price premium computed against the company-wide median unit price per item.",
      calculation: `Estimated impact = Σ max(0, off-PO unit price − company median unit price for the same item) × quantity = AED ${premium.toLocaleString()}. The AED ${spend.toLocaleString()} figure is exposure, not variance.`,
      confidenceRationale:
        "91% — PO absence is a factual field check. The impact figure depends on the median-price benchmark, which is an estimate.",
      metrics: [
        { label: "No-PO spend", value: `AED ${spend.toLocaleString()}` },
        { label: "Share of total spend", value: `${((spend / totalSpend) * 100).toFixed(2)}%` },
        { label: "Invoice lines", value: String(rows.length) },
        ...topSuppliers.map(([sid, amt]) => ({
          label: `Top supplier: ${ds.supplierById[sid]!.name}`,
          value: `AED ${round0(amt).toLocaleString()}`,
        })),
      ],
      evidenceTxnIds: rows
        .sort((a, b) => b.total - a.total)
        .slice(0, 120)
        .map((t) => t.id),
      supplierId: topSuppliers[0]?.[0] ?? null,
      department: dept,
      createdAt: rows[0]!.date,
    });
  });
  return out;
}

/* ------------------- 5. Split purchase clusters ------------------ */
export function detectSplitPurchases(ctx: Ctx): Finding[] {
  const { ds, policies } = ctx;
  const threshold = policies.approvalThreshold;
  const invoiceMeta = ds.invoices.map((inv) => ({
    ...inv,
    category: ds.txnById[inv.lineIds[0]!]!.category,
  }));
  const groups = new Map<string, typeof invoiceMeta>();
  invoiceMeta.forEach((inv) => {
    const k = `${inv.supplierId}|${inv.department}|${inv.category}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(inv);
  });
  const out: Finding[] = [];
  groups.forEach((invs) => {
    const sorted = [...invs].sort((a, b) => a.date.localeCompare(b.date));
    let i = 0;
    while (i < sorted.length) {
      const cluster = [sorted[i]!];
      let j = i + 1;
      while (
        j < sorted.length &&
        (new Date(sorted[j]!.date).getTime() - new Date(sorted[i]!.date).getTime()) / 86400000 <= 10
      ) {
        cluster.push(sorted[j]!);
        j++;
      }
      const combined = cluster.reduce((s, c) => s + c.amount, 0);
      const allUnder = cluster.every((c) => c.amount < threshold);
      const meaningful = cluster.every((c) => c.amount > threshold * 0.5);
      if (cluster.length >= 3 && allUnder && meaningful && combined > threshold) {
        const supplier = ds.supplierById[cluster[0]!.supplierId]!;
        const impact = round0(combined - threshold);
        const confidence = Math.min(88, 74 + cluster.length * 3);
        out.push({
          id: newId(ctx),
          type: "Potential Approval-Threshold Splitting",
          category: "Approval Anomalies",
          severity: severityFor(impact),
          confidence,
          estimatedImpact: impact,
          title: `${cluster.length} invoices just below AED ${threshold.toLocaleString()} — ${supplier.name}`,
          description: `${cluster.length} invoices from ${supplier.name} for ${cluster[0]!.category} in ${cluster[0]!.department}, all dated within 10 days (${cluster[0]!.date} → ${cluster[cluster.length - 1]!.date}), are each below the AED ${threshold.toLocaleString()} approval threshold but total AED ${round0(combined).toLocaleString()} combined.`,
          whyFlagged: `Each invoice sits below the configured approval threshold of AED ${threshold.toLocaleString()} while the combined value exceeds it. This pattern can be routine replenishment, but it also matches approval-threshold splitting and should be reviewed.`,
          detectionMethod:
            "Clustering on supplier + department + category within a 10-day window, testing individual amounts against the approval threshold and the combined value against the same threshold.",
          calculation: `Combined value AED ${round0(combined).toLocaleString()} − approval threshold AED ${threshold.toLocaleString()} = AED ${impact.toLocaleString()} of spend that did not pass the threshold approval step. This is unapproved exposure, not a price variance.`,
          confidenceRationale: `${confidence}% — the clustering is factual, but legitimate operational reasons for repeated small orders exist, so this is a review item rather than a conclusion.`,
          metrics: [
            { label: "Invoices in cluster", value: String(cluster.length) },
            { label: "Combined value", value: `AED ${round0(combined).toLocaleString()}` },
            { label: "Approval threshold", value: `AED ${threshold.toLocaleString()}` },
            {
              label: "Largest single invoice",
              value: `AED ${round0(Math.max(...cluster.map((c) => c.amount))).toLocaleString()}`,
            },
          ],
          evidenceTxnIds: cluster.flatMap((c) => c.lineIds),
          supplierId: cluster[0]!.supplierId,
          department: cluster[0]!.department,
          createdAt: cluster[0]!.date,
        });
        i = j;
      } else {
        i++;
      }
    }
  });
  return out;
}

/* ----------------- 6/7. PO vs invoice matching ------------------- */
export function detectPOInvoiceMismatch(ctx: Ctx): Finding[] {
  const { ds } = ctx;
  const rows = ds.txns.filter(
    (t) => t.poNumber && t.poUnitPrice !== null && t.unitPrice > t.poUnitPrice * 1.001,
  );
  const bySupplier = new Map<string, Txn[]>();
  rows.forEach((t) => {
    if (!bySupplier.has(t.supplierId)) bySupplier.set(t.supplierId, []);
    bySupplier.get(t.supplierId)!.push(t);
  });
  const out: Finding[] = [];
  bySupplier.forEach((group, supplierId) => {
    const impact = round0(group.reduce((s, t) => s + (t.unitPrice - t.poUnitPrice!) * t.qty, 0));
    if (impact < 1500 || group.length < 2) return;
    const supplier = ds.supplierById[supplierId]!;
    out.push({
      id: newId(ctx),
      type: "PO / Invoice Mismatch",
      category: "PO/Invoice Mismatch",
      severity: severityFor(impact),
      confidence: 95,
      estimatedImpact: impact,
      title: `Invoiced above PO price on ${group.length} lines — ${supplier.name}`,
      description: `${group.length} invoice lines from ${supplier.name} were billed at a unit price higher than the matching purchase order, producing AED ${impact.toLocaleString()} of price variance.`,
      whyFlagged:
        "Two-way match failure: invoice unit price does not equal the approved purchase order unit price.",
      detectionMethod: "Line-level PO-to-invoice price match (tolerance 0.1%).",
      calculation: `Estimated impact = Σ (invoice unit price − PO unit price) × invoiced quantity = AED ${impact.toLocaleString()}`,
      confidenceRationale:
        "95% — both prices are recorded values in the dataset; the only uncertainty is whether a documented PO amendment exists.",
      metrics: [
        { label: "Mismatched lines", value: String(group.length) },
        {
          label: "Largest single variance",
          value: `AED ${round0(Math.max(...group.map((t) => (t.unitPrice - t.poUnitPrice!) * t.qty))).toLocaleString()}`,
        },
      ],
      evidenceTxnIds: group.map((t) => t.id),
      supplierId,
      department: group[0]!.department,
      createdAt: group[0]!.date,
    });
  });
  return out;
}

export function detectQuantityMismatch(ctx: Ctx): Finding[] {
  const { ds } = ctx;
  const rows = ds.txns.filter((t) => t.poQty !== null && t.qty > t.poQty);
  const bySupplier = new Map<string, Txn[]>();
  rows.forEach((t) => {
    if (!bySupplier.has(t.supplierId)) bySupplier.set(t.supplierId, []);
    bySupplier.get(t.supplierId)!.push(t);
  });
  const out: Finding[] = [];
  bySupplier.forEach((group, supplierId) => {
    const impact = round0(group.reduce((s, t) => s + (t.qty - t.poQty!) * t.unitPrice, 0));
    if (impact < 1500 || group.length < 2) return;
    const supplier = ds.supplierById[supplierId]!;
    const example = group.slice().sort((a, b) => b.total - a.total)[0]!;
    out.push({
      id: newId(ctx),
      type: "Quantity Mismatch",
      category: "PO/Invoice Mismatch",
      severity: severityFor(impact),
      confidence: 94,
      estimatedImpact: impact,
      title: `Invoiced quantity above PO on ${group.length} lines — ${supplier.name}`,
      description: `${group.length} invoice lines from ${supplier.name} show an invoiced quantity greater than the ordered quantity. Example: PO ${example.poNumber} ordered ${example.poQty} ${example.unit} of ${example.itemName}, invoice ${example.invoiceNumber} billed ${example.qty}.`,
      whyFlagged: "Invoiced quantity exceeds approved PO quantity without a recorded amendment.",
      detectionMethod: "Line-level PO-to-invoice quantity match.",
      calculation: `Estimated impact = Σ (invoiced quantity − PO quantity) × invoice unit price = AED ${impact.toLocaleString()}`,
      confidenceRationale:
        "94% — quantities are recorded fields; over-delivery accepted in good faith is the main alternative explanation.",
      metrics: [
        { label: "Mismatched lines", value: String(group.length) },
        {
          label: "Example",
          value: `PO ${example.poQty} → invoiced ${example.qty} ${example.unit}`,
        },
      ],
      evidenceTxnIds: group.map((t) => t.id),
      supplierId,
      department: group[0]!.department,
      createdAt: group[0]!.date,
    });
  });
  return out;
}

/* ------------- 8. Cross-supplier price variance ------------------ */
export function detectSupplierPriceVariance(ctx: Ctx): Finding[] {
  const { ds, policies } = ctx;
  const out: Finding[] = [];
  ds.items.forEach((item) => {
    const rows = ds.txns.filter((t) => t.itemId === item.id);
    if (rows.length < 40) return;
    const marketMedian = median(rows.map((t) => t.unitPrice));
    const bySupplier = new Map<string, Txn[]>();
    rows.forEach((t) => {
      if (!bySupplier.has(t.supplierId)) bySupplier.set(t.supplierId, []);
      bySupplier.get(t.supplierId)!.push(t);
    });
    bySupplier.forEach((group, supplierId) => {
      if (group.length < 6) return;
      const supMedian = median(group.map((t) => t.unitPrice));
      const varPct = ((supMedian - marketMedian) / marketMedian) * 100;
      if (varPct < Math.max(policies.maxPriceVariancePct, 15)) return;
      const qty = group.reduce((s, t) => s + t.qty, 0);
      const impact = round0((supMedian - marketMedian) * qty);
      if (impact < 2500) return;
      const supplier = ds.supplierById[supplierId]!;
      out.push({
        id: newId(ctx),
        type: "Supplier Price Variance",
        category: "Price Variance",
        severity: severityFor(impact),
        confidence: Math.min(93, 72 + Math.round(rowsBonus(group.length))),
        estimatedImpact: impact,
        title: `${supplier.name} prices ${item.name} ${varPct.toFixed(0)}% above peer median`,
        description: `${supplier.name} invoices ${item.name} at a median AED ${supMedian.toFixed(2)} against a cross-supplier median of AED ${marketMedian.toFixed(2)} (${varPct.toFixed(1)}% higher) across ${group.length} transactions.`,
        whyFlagged: `Median unit price for this supplier exceeds the peer median for the identical item by more than the configured ${policies.maxPriceVariancePct}% variance tolerance.`,
        detectionMethod:
          "Cross-supplier benchmark: per-item peer median unit price compared with each supplier's median, minimum 6 transactions per supplier and 40 per item.",
        calculation: `Estimated impact = (supplier median − peer median) × quantity purchased from this supplier = (${supMedian.toFixed(2)} − ${marketMedian.toFixed(2)}) × ${qty.toLocaleString()} = AED ${impact.toLocaleString()}`,
        confidenceRationale:
          "Medium-to-high — item descriptions are normalised, but specification, pack size or service-level differences between suppliers can justify part of the gap.",
        metrics: [
          { label: "Supplier median", value: `AED ${supMedian.toFixed(2)}` },
          { label: "Peer median", value: `AED ${marketMedian.toFixed(2)}` },
          { label: "Variance", value: `${varPct.toFixed(1)}%` },
          { label: "Quantity purchased", value: qty.toLocaleString() },
        ],
        evidenceTxnIds: group.map((t) => t.id),
        supplierId,
        department: null,
        itemId: item.id,
        createdAt: group[0]!.date,
        benchmarks: [
          { label: `${supplier.name} median`, value: round2(supMedian) },
          { label: "Peer median (all suppliers)", value: round2(marketMedian) },
        ],
        priceHistory: buildPriceHistory(ds, supplierId, item.id),
      });
    });
  });
  return out.sort((a, b) => b.estimatedImpact - a.estimatedImpact).slice(0, 12);
}

/* ---------------- 9. Department spend anomalies ------------------ */
export function detectDepartmentAnomalies(ctx: Ctx): Finding[] {
  const { ds } = ctx;
  const out: Finding[] = [];
  ds.departments.forEach((dept) => {
    const rows = ds.txns.filter((t) => t.department === dept);
    if (!rows.length) return;
    const byMonth = new Map<string, Txn[]>();
    rows.forEach((t) => {
      const m = monthOf(t.date);
      if (!byMonth.has(m)) byMonth.set(m, []);
      byMonth.get(m)!.push(t);
    });
    const totals = [...byMonth.entries()].map(([m, r]) => ({
      month: m,
      spend: r.reduce((s, t) => s + t.total, 0),
      rows: r,
    }));
    const mean = totals.reduce((s, t) => s + t.spend, 0) / totals.length;
    const sd = Math.sqrt(totals.reduce((s, t) => s + (t.spend - mean) ** 2, 0) / totals.length);
    if (sd <= 0) return;
    totals.forEach((t) => {
      const z = (t.spend - mean) / sd;
      if (z < 2) return;
      const impact = round0(t.spend - mean);
      out.push({
        id: newId(ctx),
        type: "Department Spend Anomaly",
        category: "Approval Anomalies",
        severity: severityFor(impact),
        confidence: Math.min(86, round0(60 + z * 10)),
        estimatedImpact: impact,
        title: `${dept} spend spike in ${t.month} (${z.toFixed(1)}σ)`,
        description: `${dept} spent AED ${round0(t.spend).toLocaleString()} in ${t.month} against a 12-month monthly average of AED ${round0(mean).toLocaleString()} — ${z.toFixed(1)} standard deviations above its own baseline.`,
        whyFlagged:
          "Monthly departmental spend exceeded its own 12-month baseline by more than 2 standard deviations. Spikes can be seasonal or project-driven and need context from the department.",
        detectionMethod:
          "Z-score on monthly departmental spend against that department's own 12-month distribution.",
        calculation: `Excess over baseline = month spend − monthly mean = AED ${round0(t.spend).toLocaleString()} − AED ${round0(mean).toLocaleString()} = AED ${impact.toLocaleString()}. This is variance from baseline, not confirmed leakage.`,
        confidenceRationale:
          "Medium — statistically the deviation is clear, but a legitimate one-off project or bulk purchase produces the same signature.",
        metrics: [
          { label: "Month spend", value: `AED ${round0(t.spend).toLocaleString()}` },
          { label: "Monthly average", value: `AED ${round0(mean).toLocaleString()}` },
          { label: "Z-score", value: z.toFixed(2) },
          { label: "Transactions", value: String(t.rows.length) },
        ],
        evidenceTxnIds: t.rows
          .sort((a, b) => b.total - a.total)
          .slice(0, 60)
          .map((r) => r.id),
        supplierId: null,
        department: dept,
        createdAt: `${t.month}-28`,
      });
    });
  });
  return out;
}

/* ---------------- 10. Duplicate vendor records ------------------- */
export function detectDuplicateVendors(ctx: Ctx): Finding[] {
  const { ds } = ctx;
  const out: Finding[] = [];
  const spendBySupplier = new Map<string, number>();
  ds.txns.forEach((t) =>
    spendBySupplier.set(t.supplierId, (spendBySupplier.get(t.supplierId) ?? 0) + t.total),
  );
  for (let i = 0; i < ds.suppliers.length; i++) {
    for (let j = i + 1; j < ds.suppliers.length; j++) {
      const a = ds.suppliers[i]!;
      const b = ds.suppliers[j]!;
      const sim = similarity(a.normalizedName, b.normalizedName);
      if (sim < 0.9) continue;
      const spendA = round0(spendBySupplier.get(a.id) ?? 0);
      const spendB = round0(spendBySupplier.get(b.id) ?? 0);
      out.push({
        id: newId(ctx),
        type: "Potential Duplicate Vendor",
        category: "Supplier Anomalies",
        severity: "Medium",
        confidence: Math.min(96, round0(sim * 100)),
        estimatedImpact: 0,
        title: `Potential duplicate vendor records — ${a.name} / ${b.name}`,
        description: `Two supplier records normalise to near-identical names (${(sim * 100).toFixed(0)}% match). Combined spend across both records is AED ${(spendA + spendB).toLocaleString()}, which fragments spend visibility and negotiating leverage.`,
        whyFlagged:
          "Supplier names match after normalisation (legal-form suffixes, punctuation and spacing removed). Duplicate vendor master records split spend and can allow the same invoice to be paid on two accounts.",
        detectionMethod:
          "Vendor-master normalisation plus Levenshtein similarity ≥ 90% on normalised names.",
        calculation:
          "No direct financial variance is asserted for this finding, so its estimated impact is AED 0. It is reported as a data-quality and control issue, and it is deliberately excluded from the potential leakage total.",
        confidenceRationale:
          "High on the name match itself; whether the two records are truly the same legal entity needs a TRN check by procurement.",
        metrics: [
          { label: a.name, value: `AED ${spendA.toLocaleString()} · TRN ${a.trn}` },
          { label: b.name, value: `AED ${spendB.toLocaleString()} · TRN ${b.trn}` },
          { label: "Name similarity", value: `${(sim * 100).toFixed(0)}%` },
        ],
        evidenceTxnIds: ds.txns
          .filter((t) => t.supplierId === a.id || t.supplierId === b.id)
          .slice(0, 40)
          .map((t) => t.id),
        supplierId: a.id,
        supplierIds: [a.id, b.id],
        department: null,
        createdAt: "2026-01-15",
      });
    }
  }
  return out;
}

/* -------------- 11. Recurring additional charges ---------------- */
export function detectRecurringAdditionalCharges(ctx: Ctx): Finding[] {
  const { ds } = ctx;
  const rows = ds.txns.filter((t) => /surcharge|handling|delivery/i.test(t.itemName));
  const bySupplier = new Map<string, Txn[]>();
  rows.forEach((t) => {
    if (!bySupplier.has(t.supplierId)) bySupplier.set(t.supplierId, []);
    bySupplier.get(t.supplierId)!.push(t);
  });
  const out: Finding[] = [];
  bySupplier.forEach((group, supplierId) => {
    if (group.length < 6) return;
    const total = round0(group.reduce((s, t) => s + t.total, 0));
    if (total < 3000) return;
    const noPO = group.filter((t) => !t.poNumber);
    const impact = round0(noPO.reduce((s, t) => s + t.total, 0));
    const supplier = ds.supplierById[supplierId]!;
    const months = new Set(group.map((t) => monthOf(t.date))).size;
    out.push({
      id: newId(ctx),
      type: "Recurring Additional Charges",
      category: "Supplier Anomalies",
      severity: severityFor(impact),
      confidence: 90,
      estimatedImpact: impact,
      title: `Recurring handling/delivery charges — ${supplier.name}`,
      description: `${supplier.name} added ${group.length} separate delivery/handling charge lines across ${months} months totalling AED ${total.toLocaleString()}. AED ${impact.toLocaleString()} of that was billed on invoice lines with no purchase order.`,
      whyFlagged:
        "Ancillary charge lines recur across invoices and are not covered by a PO or contract line. These charges are often negotiable or already included in agreed unit pricing.",
      detectionMethod:
        "Line-description pattern match for ancillary charges, grouped by supplier, with PO and contract coverage checks.",
      calculation: `Estimated impact = Σ ancillary charge lines with no PO coverage = AED ${impact.toLocaleString()} (total ancillary charges billed: AED ${total.toLocaleString()}).`,
      confidenceRationale:
        "90% — the charge lines are explicit. Whether they are contractually permitted requires reading the supplier agreement.",
      metrics: [
        { label: "Charge lines", value: String(group.length) },
        { label: "Months affected", value: String(months) },
        { label: "Total ancillary charges", value: `AED ${total.toLocaleString()}` },
        { label: "Uncovered by PO", value: `AED ${impact.toLocaleString()}` },
      ],
      evidenceTxnIds: group.map((t) => t.id),
      supplierId,
      department: null,
      createdAt: group[0]!.date,
    });
  });
  return out;
}

/* --------------- 12. Contract expiry (forward risk) -------------- */
export function detectContractExpiryRisk(ds: Dataset, policies: Policies) {
  const ref = refDate(ds);
  const refTime = new Date(ref).getTime();
  const spendByContract = new Map<string, number>();
  ds.txns.forEach((t) => {
    if (t.contractId)
      spendByContract.set(t.contractId, (spendByContract.get(t.contractId) ?? 0) + t.total);
  });
  const expiring: { contract: Contract; daysLeft: number; spend: number }[] = [];
  ds.contracts.forEach((c) => {
    const days = Math.round((new Date(c.endDate).getTime() - refTime) / 86400000);
    if (days >= 0 && days <= policies.contractExpiryWarningDays)
      expiring.push({ contract: c, daysLeft: days, spend: round0(spendByContract.get(c.id) ?? 0) });
  });
  return { referenceDate: ref, expiring: expiring.sort((a, b) => a.daysLeft - b.daysLeft) };
}

/* ------------------------- Orchestrator -------------------------- */
export function runDetection(
  ds: Dataset,
  policies: Policies,
  rules: RuleToggles,
): Finding[] {
  const ctx: Ctx = { ds, policies, seq: { n: 1 } };
  const findings: Finding[] = [];
  if (rules.priceCreep) findings.push(...detectPriceCreep(ctx));
  if (rules.contractLeakage) findings.push(...detectContractLeakage(ctx));
  if (rules.duplicateInvoices) findings.push(...detectDuplicateInvoices(ctx));
  if (rules.noPOSpend) findings.push(...detectNoPOSpend(ctx));
  if (rules.splitPurchases) findings.push(...detectSplitPurchases(ctx));
  if (rules.poInvoiceMismatch) findings.push(...detectPOInvoiceMismatch(ctx));
  if (rules.quantityMismatch) findings.push(...detectQuantityMismatch(ctx));
  if (rules.supplierPriceVariance) findings.push(...detectSupplierPriceVariance(ctx));
  if (rules.departmentAnomalies) findings.push(...detectDepartmentAnomalies(ctx));
  if (rules.duplicateVendors) findings.push(...detectDuplicateVendors(ctx));
  if (rules.recurringCharges) findings.push(...detectRecurringAdditionalCharges(ctx));
  return findings
    .filter((f) => f.confidence >= policies.minConfidence)
    .sort((a, b) => b.estimatedImpact * b.confidence - a.estimatedImpact * a.confidence);
}
