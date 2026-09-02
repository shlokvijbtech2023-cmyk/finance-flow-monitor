import type {
  Category,
  Contract,
  Dataset,
  Department,
  Invoice,
  Item,
  Supplier,
  Txn,
} from "./types";

/* ------------------------------------------------------------------ *
 * Deterministic synthetic dataset for Atlas Facilities & Services LLC
 * Every number in the app is computed from this dataset. Fictional data.
 * ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(20260902);
const rint = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!;
const rfloat = (min: number, max: number) => min + rnd() * (max - min);
const round2 = (n: number) => Math.round(n * 100) / 100;

export const DEPARTMENTS: Department[] = [
  "Operations",
  "Maintenance",
  "Procurement",
  "Admin",
  "Sales",
  "IT",
  "HR",
];

const DEPT_WEIGHTS: [Department, number][] = [
  ["Operations", 30],
  ["Maintenance", 24],
  ["Procurement", 14],
  ["Admin", 11],
  ["Sales", 7],
  ["IT", 9],
  ["HR", 5],
];

export const CATEGORIES: Category[] = [
  "Office Supplies",
  "Cleaning & Hygiene",
  "Electrical & MEP",
  "HVAC Parts",
  "Safety & PPE",
  "IT Hardware",
  "Vehicle & Fuel",
  "Facility Consumables",
];

const ITEM_DEFS: [string, Category, string, number][] = [
  ["A4 Copy Paper 80 GSM", "Office Supplies", "ream", 18],
  ["Toner Cartridge Black 26A", "Office Supplies", "unit", 240],
  ["Whiteboard Marker Pack", "Office Supplies", "pack", 22],
  ["Box File Foolscap", "Office Supplies", "unit", 9.5],
  ["Desk Stapler Heavy Duty", "Office Supplies", "unit", 35],
  ["Floor Cleaner Concentrate 5L", "Cleaning & Hygiene", "can", 46],
  ["Hand Soap Refill 5L", "Cleaning & Hygiene", "can", 38],
  ["Garbage Bags 30x40 (50s)", "Cleaning & Hygiene", "pack", 27],
  ["Microfibre Cloth Pack", "Cleaning & Hygiene", "pack", 31],
  ["Glass Cleaner 1L", "Cleaning & Hygiene", "bottle", 14],
  ["Disinfectant Wipes Tub", "Cleaning & Hygiene", "tub", 25],
  ["LED Tube Light 18W", "Electrical & MEP", "unit", 21],
  ["MCB 32A Single Pole", "Electrical & MEP", "unit", 44],
  ["Copper Cable 2.5mm (100m)", "Electrical & MEP", "roll", 310],
  ["Conduit Pipe 25mm", "Electrical & MEP", "unit", 12.5],
  ["Emergency Exit Light", "Electrical & MEP", "unit", 128],
  ["HVAC Air Filter 20x20", "HVAC Parts", "unit", 58],
  ["Fan Coil Motor 1/4 HP", "HVAC Parts", "unit", 420],
  ["Refrigerant R410A 11.3kg", "HVAC Parts", "cylinder", 690],
  ["Thermostat Digital", "HVAC Parts", "unit", 175],
  ["Duct Insulation Roll", "HVAC Parts", "roll", 240],
  ["Safety Helmet White", "Safety & PPE", "unit", 32],
  ["Nitrile Gloves (100s)", "Safety & PPE", "box", 29],
  ["Safety Shoes S3", "Safety & PPE", "pair", 145],
  ["Hi-Vis Vest Class 2", "Safety & PPE", "unit", 26],
  ["Fire Extinguisher 6kg", "Safety & PPE", "unit", 185],
  ["Laptop Docking Station", "IT Hardware", "unit", 520],
  ["Wireless Mouse", "IT Hardware", "unit", 68],
  ["24in Monitor", "IT Hardware", "unit", 640],
  ["Cat6 Patch Cable 3m", "IT Hardware", "unit", 17],
  ["Network Switch 24-Port", "IT Hardware", "unit", 1180],
  ["Diesel Fuel (litre)", "Vehicle & Fuel", "litre", 3.05],
  ["Engine Oil 5W-30 4L", "Vehicle & Fuel", "unit", 92],
  ["Tyre 215/65 R16", "Vehicle & Fuel", "unit", 385],
  ["Wiper Blade Pair", "Vehicle & Fuel", "pair", 54],
  ["Paper Towel Roll (6s)", "Facility Consumables", "pack", 33],
  ["Air Freshener Refill", "Facility Consumables", "unit", 19],
  ["Water Bottle 5 Gallon", "Facility Consumables", "unit", 12],
  ["Pest Control Bait Station", "Facility Consumables", "unit", 41],
  ["Floor Mat 90x150", "Facility Consumables", "unit", 165],
];

const SUP_PREFIX = [
  "Al Noor",
  "Gulf",
  "Emirates",
  "Prime",
  "Dubai",
  "Al Wathba",
  "Desert Rose",
  "Marina",
  "Falcon",
  "Al Bahar",
  "Oasis",
  "Jumeirah",
  "Sharjah",
  "Al Reem",
  "Horizon",
  "Silver Sands",
  "Al Fanar",
  "Arabian",
  "Zenith",
  "Al Karama",
  "Deira",
  "Nakheel",
  "Al Mizan",
  "Crescent",
  "Sahara",
];
const SUP_MID = [
  "Technical Supplies",
  "Facility Supplies",
  "Industrial Products",
  "Trading",
  "Office Solutions",
  "Maintenance Materials",
  "Electricals",
  "Cleaning Solutions",
  "Safety Equipment",
  "IT Distribution",
  "General Trading",
  "Building Materials",
  "Hygiene Products",
  "Auto Spares",
];
const CITIES = ["Dubai", "Sharjah", "Abu Dhabi", "Ajman", "Ras Al Khaimah"];
const TERMS = ["Net 30", "Net 45", "Net 60", "Net 15"];

export const MONTHS = [
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
  "2026-10",
  "2026-11",
  "2026-12",
];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/l\.?l\.?c\.?/g, "llc")
    .replace(/\b(co|company|est|establishment|gen|general)\b/g, "")
    .replace(/[^a-z0-9]/g, "");

function buildItems(): Item[] {
  return ITEM_DEFS.map(([name, category, unit, basePrice], i) => ({
    id: `ITM-${String(i + 1).padStart(3, "0")}`,
    name,
    normalizedName: normalize(name),
    category,
    unit,
    basePrice,
  }));
}

function buildSuppliers(): Supplier[] {
  const list: Supplier[] = [];
  const used = new Set<string>();
  // Named anchors used throughout the demo narrative
  const anchors = [
    "ABC Trading LLC",
    "Gulf Facility Supplies LLC",
    "Emirates Industrial Products LLC",
    "Al Noor Technical Supplies LLC",
    "Prime Maintenance Materials LLC",
    "Dubai Office Solutions LLC",
    "XYZ Supplies LLC",
  ];
  const names = [...anchors];
  while (names.length < 136) {
    const n = `${pick(SUP_PREFIX)} ${pick(SUP_MID)} LLC`;
    if (!used.has(n)) {
      used.add(n);
      names.push(n);
    }
  }
  // deliberate near-duplicate vendor records
  names.push("ABC Trading L.L.C.");
  names.push("Gulf Facility Supplies Co LLC");
  names.push("Al Noor Technical Supplies");
  names.push("Prime Maintainance Materials LLC");

  names.forEach((name, i) => {
    const cats: Category[] = [];
    const count = rint(1, 3);
    while (cats.length < count) {
      const c = pick(CATEGORIES);
      if (!cats.includes(c)) cats.push(c);
    }
    list.push({
      id: `SUP-${String(i + 1).padStart(3, "0")}`,
      name,
      normalizedName: normalize(name),
      trn: `100${rint(100000000, 999999999)}`,
      city: pick(CITIES),
      paymentTerms: pick(TERMS),
      categories: cats,
      onboarded: `202${rint(0, 5)}-${String(rint(1, 12)).padStart(2, "0")}-${String(rint(1, 28)).padStart(2, "0")}`,
    });
  });
  return list;
}

function weightedDept(): Department {
  const total = DEPT_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let r = rnd() * total;
  for (const [d, w] of DEPT_WEIGHTS) {
    r -= w;
    if (r <= 0) return d;
  }
  return "Operations";
}

function dayInMonth(month: string) {
  const day = rint(1, 28);
  return `${month}-${String(day).padStart(2, "0")}`;
}

export function buildDataset(): Dataset {
  const items = buildItems();
  const suppliers = buildSuppliers();
  const itemById: Record<string, Item> = {};
  items.forEach((i) => (itemById[i.id] = i));
  const supplierById: Record<string, Supplier> = {};
  suppliers.forEach((s) => (supplierById[s.id] = s));

  // supplier-level pricing personality
  const supFactor: Record<string, number> = {};
  suppliers.forEach((s) => (supFactor[s.id] = rfloat(0.94, 1.12)));

  // items each supplier can sell
  const supplierItems: Record<string, Item[]> = {};
  suppliers.forEach((s) => {
    const pool = items.filter((i) => s.categories.includes(i.category));
    supplierItems[s.id] = pool.length ? pool : [pick(items)];
  });

  /* ---------------- Contracts ---------------- */
  const contracts: Contract[] = [];
  const contractKey: Record<string, Contract> = {}; // supplierId|itemId
  let cSeq = 1;
  suppliers.forEach((s, idx) => {
    if (idx % 5 === 4) return; // ~20% of suppliers have no contract at all
    const pool = supplierItems[s.id]!;
    const n = Math.min(pool.length, rint(2, 5));
    const chosen: Item[] = [];
    for (let k = 0; k < n; k++) {
      const it = pool[(k * 3 + idx) % pool.length]!;
      if (!chosen.includes(it)) chosen.push(it);
    }
    chosen.forEach((it) => {
      // expiry mix: most active, some expiring soon, a few expired
      const roll = rnd();
      let start = "2026-01-01";
      let end = "2026-12-31";
      if (roll < 0.08) {
        start = "2025-04-01";
        end = `2026-0${rint(3, 8)}-${String(rint(10, 28)).padStart(2, "0")}`; // expired mid-year
      } else if (roll < 0.2) {
        start = "2025-10-01";
        end = `2027-0${rint(1, 2)}-${String(rint(1, 28)).padStart(2, "0")}`;
      } else if (roll < 0.3) {
        start = `2026-0${rint(2, 4)}-01`;
        end = "2027-03-31";
      }
      const agreed = round2(it.basePrice * rfloat(0.93, 1.02));
      const c: Contract = {
        id: `CTR-${String(cSeq++).padStart(4, "0")}`,
        supplierId: s.id,
        itemId: it.id,
        category: it.category,
        agreedUnitPrice: agreed,
        currency: "AED",
        startDate: start,
        endDate: end,
        paymentTerms: s.paymentTerms,
        value: Math.round(agreed * rint(400, 4000)),
      };
      contracts.push(c);
      contractKey[`${s.id}|${it.id}`] = c;
    });
  });
  const contractById: Record<string, Contract> = {};
  contracts.forEach((c) => (contractById[c.id] = c));

  /* ---------------- Planted anomaly plans ---------------- */
  // Price creep pairs (supplier, item): unit price ramps from month 6 onward
  const creepPairs: { supplierId: string; itemId: string; ramp: number }[] = [
    { supplierId: "SUP-001", itemId: "ITM-001", ramp: 0.5 }, // ABC Trading / A4 paper
    { supplierId: "SUP-002", itemId: "ITM-006", ramp: 0.34 },
    { supplierId: "SUP-003", itemId: "ITM-017", ramp: 0.28 },
    { supplierId: "SUP-004", itemId: "ITM-012", ramp: 0.41 },
    { supplierId: "SUP-006", itemId: "ITM-002", ramp: 0.23 },
    { supplierId: "SUP-020", itemId: "ITM-023", ramp: 0.31 },
    { supplierId: "SUP-031", itemId: "ITM-027", ramp: 0.26 },
  ];
  const creepMap = new Map(creepPairs.map((c) => [`${c.supplierId}|${c.itemId}`, c]));
  // Suppliers that bill above contract price
  const contractLeakers = new Set([
    "SUP-007",
    "SUP-002",
    "SUP-011",
    "SUP-018",
    "SUP-024",
    "SUP-033",
    "SUP-045",
  ]);
  // Suppliers with frequent no-PO invoices
  const maverickSuppliers = new Set(["SUP-009", "SUP-014", "SUP-022", "SUP-037", "SUP-051"]);
  // Suppliers with recurring surcharge lines
  const surchargeSuppliers = new Set(["SUP-001", "SUP-013", "SUP-026"]);

  /* ---------------- Transactions & invoices ---------------- */
  const txns: Txn[] = [];
  const invoices: Invoice[] = [];
  let invSeq = 4100;
  let txnSeq = 1;
  let poSeq = 9000;

  const pushInvoice = (
    supplierId: string,
    date: string,
    department: Department,
    lines: Omit<Txn, "invoiceNumber" | "id" | "supplierId" | "date" | "department">[],
    opts: { invoiceNumber?: string; hasPO?: boolean } = {},
  ) => {
    const invoiceNumber = opts.invoiceNumber ?? `INV-${invSeq++}`;
    const lineIds: string[] = [];
    let amount = 0;
    lines.forEach((l) => {
      const t: Txn = {
        ...l,
        id: `TXN-${String(txnSeq++).padStart(6, "0")}`,
        supplierId,
        date,
        department,
        invoiceNumber,
      };
      txns.push(t);
      lineIds.push(t.id);
      amount += t.total;
    });
    invoices.push({
      invoiceNumber,
      supplierId,
      date,
      amount: round2(amount),
      department,
      lineIds,
      hasPO: lines.some((l) => l.poNumber !== null),
    });
    return invoiceNumber;
  };

  const makeLine = (
    supplierId: string,
    item: Item,
    month: string,
    department: Department,
    opts: { forceNoPO?: boolean; qtyMul?: number } = {},
  ) => {
    const monthIdx = MONTHS.indexOf(month);
    const creep = creepMap.get(`${supplierId}|${item.id}`);
    let unitPrice = item.basePrice * supFactor[supplierId]! * rfloat(0.98, 1.04);
    const contract = contractKey[`${supplierId}|${item.id}`];
    if (contract) {
      unitPrice = contract.agreedUnitPrice * (contractLeakers.has(supplierId) ? rfloat(1.09, 1.28) : rfloat(0.99, 1.012));
    }
    if (creep && monthIdx >= 6) {
      const progress = Math.min(1, (monthIdx - 5) / 4);
      unitPrice = unitPrice * (1 + creep.ramp * progress);
    }
    unitPrice = round2(unitPrice);
    const qty = Math.max(1, Math.round(rint(4, 160) * (opts.qtyMul ?? 1) * (item.basePrice > 300 ? 0.15 : 1)));
    const noPO = opts.forceNoPO ?? (maverickSuppliers.has(supplierId) ? rnd() < 0.55 : rnd() < 0.07);
    const poNumber = noPO ? null : `PO-${poSeq++}`;
    // ~4% of PO-backed lines carry a quantity or price mismatch
    let poQty: number | null = poNumber ? qty : null;
    let poUnitPrice: number | null = poNumber ? unitPrice : null;
    if (poNumber && rnd() < 0.045) {
      if (rnd() < 0.6) poQty = Math.max(1, Math.round(qty / rfloat(1.08, 1.35)));
      else poUnitPrice = round2(unitPrice / rfloat(1.05, 1.2));
    }
    const contractActive =
      contract && month + "-15" >= contract.startDate && month + "-15" <= contract.endDate;
    return {
      category: item.category,
      itemId: item.id,
      itemName: item.name,
      unit: item.unit,
      qty,
      unitPrice,
      total: round2(qty * unitPrice),
      poNumber,
      poQty,
      poUnitPrice,
      contractId: contractActive ? contract!.id : null,
      status: (rnd() < 0.82 ? "Paid" : rnd() < 0.6 ? "Approved" : "Pending") as Txn["status"],
    };
  };

  const surchargeItem: Item = {
    id: "ITM-900",
    name: "Delivery & Handling Surcharge",
    normalizedName: "deliveryhandlingsurcharge",
    category: "Facility Consumables",
    unit: "charge",
    basePrice: 350,
    ...({} as object),
  };
  items.push(surchargeItem);
  itemById[surchargeItem.id] = surchargeItem;

  MONTHS.forEach((month) => {
    const invoiceCount = rint(190, 230);
    for (let i = 0; i < invoiceCount; i++) {
      const supplier = suppliers[rint(0, suppliers.length - 1)]!;
      const dept = weightedDept();
      const date = dayInMonth(month);
      const lineCount = rint(1, 4);
      const lines = [];
      for (let l = 0; l < lineCount; l++) {
        const item = pick(supplierItems[supplier.id]!);
        lines.push(makeLine(supplier.id, item, month, dept));
      }
      if (surchargeSuppliers.has(supplier.id) && rnd() < 0.5) {
        lines.push({
          category: "Facility Consumables" as Category,
          itemId: surchargeItem.id,
          itemName: surchargeItem.name,
          unit: "charge",
          qty: 1,
          unitPrice: round2(rfloat(280, 520)),
          total: 0,
          poNumber: null,
          poQty: null,
          poUnitPrice: null,
          contractId: null,
          status: "Paid" as Txn["status"],
        });
        const last = lines[lines.length - 1]!;
        last.total = round2(last.qty * last.unitPrice);
      }
      pushInvoice(supplier.id, date, dept, lines);
    }

    // planted duplicate invoices: clone 3 invoices from this month
    const monthInvoices = invoices.filter((inv) => inv.date.startsWith(month));
    for (let d = 0; d < 3; d++) {
      const src = monthInvoices[rint(0, monthInvoices.length - 1)]!;
      const srcLines = src.lineIds.map((id) => txns.find((t) => t.id === id)!);
      const dupNumber =
        d === 0 ? src.invoiceNumber : `${src.invoiceNumber}${d === 1 ? "-A" : "R"}`;
      pushInvoice(
        src.supplierId,
        src.date,
        src.department,
        srcLines.map((l) => ({
          category: l.category,
          itemId: l.itemId,
          itemName: l.itemName,
          unit: l.unit,
          qty: l.qty,
          unitPrice: l.unitPrice,
          total: l.total,
          poNumber: l.poNumber,
          poQty: l.poQty,
          poUnitPrice: l.poUnitPrice,
          contractId: l.contractId,
          status: "Paid" as Txn["status"],
        })),
        { invoiceNumber: dupNumber },
      );
    }

    // planted split purchases: 3 clusters of 3 invoices just under AED 10,000
    for (let s = 0; s < 3; s++) {
      const supplier = suppliers[rint(0, 40)]!;
      const dept = weightedDept();
      const item = pick(supplierItems[supplier.id]!);
      const baseDay = rint(3, 20);
      for (let k = 0; k < 3; k++) {
        const targetAmount = rfloat(7600, 9700);
        const unitPrice = round2(item.basePrice * supFactor[supplier.id]! * rfloat(0.99, 1.03));
        const qty = Math.max(1, Math.round(targetAmount / unitPrice));
        pushInvoice(
          supplier.id,
          `${month}-${String(baseDay + k * 2).padStart(2, "0")}`,
          dept,
          [
            {
              category: item.category,
              itemId: item.id,
              itemName: item.name,
              unit: item.unit,
              qty,
              unitPrice,
              total: round2(qty * unitPrice),
              poNumber: `PO-${poSeq++}`,
              poQty: qty,
              poUnitPrice: unitPrice,
              contractId: null,
              status: "Paid",
            },
          ],
        );
      }
    }
  });

  const txnById: Record<string, Txn> = {};
  txns.forEach((t) => (txnById[t.id] = t));

  return {
    suppliers,
    supplierById,
    items,
    itemById,
    contracts,
    contractById,
    txns,
    txnById,
    invoices,
    departments: DEPARTMENTS,
    categories: CATEGORIES,
    months: MONTHS,
  };
}

let cached: Dataset | null = null;
export function getDataset(): Dataset {
  if (!cached) cached = buildDataset();
  return cached;
}
