export type Department =
  | "Operations"
  | "Maintenance"
  | "Procurement"
  | "Admin"
  | "Sales"
  | "IT"
  | "HR";

export type Category =
  | "Office Supplies"
  | "Cleaning & Hygiene"
  | "Electrical & MEP"
  | "HVAC Parts"
  | "Safety & PPE"
  | "IT Hardware"
  | "Vehicle & Fuel"
  | "Facility Consumables";

export interface Supplier {
  id: string;
  name: string;
  normalizedName: string;
  trn: string;
  city: string;
  paymentTerms: string;
  categories: Category[];
  onboarded: string;
}

export interface Item {
  id: string;
  name: string;
  normalizedName: string;
  category: Category;
  unit: string;
  basePrice: number;
}

export interface Contract {
  id: string;
  supplierId: string;
  itemId: string;
  category: Category;
  agreedUnitPrice: number;
  currency: "AED";
  startDate: string;
  endDate: string;
  paymentTerms: string;
  value: number;
}

export type TxnStatus = "Paid" | "Approved" | "Pending";

export interface Txn {
  id: string;
  date: string;
  supplierId: string;
  department: Department;
  category: Category;
  itemId: string;
  itemName: string;
  unit: string;
  qty: number;
  unitPrice: number;
  total: number;
  poNumber: string | null;
  poQty: number | null;
  poUnitPrice: number | null;
  invoiceNumber: string;
  contractId: string | null;
  status: TxnStatus;
}

export interface Invoice {
  invoiceNumber: string;
  supplierId: string;
  date: string;
  amount: number;
  department: Department;
  lineIds: string[];
  hasPO: boolean;
}

export type FindingType =
  | "Supplier Price Creep"
  | "Contract Price Violation"
  | "Potential Duplicate Invoice"
  | "Maverick / No-PO Spend"
  | "Potential Approval-Threshold Splitting"
  | "PO / Invoice Mismatch"
  | "Quantity Mismatch"
  | "Supplier Price Variance"
  | "Department Spend Anomaly"
  | "Potential Duplicate Vendor"
  | "Recurring Additional Charges"
  | "Contract Expiry Exposure";

export type LeakageCategory =
  | "Price Variance"
  | "Contract Leakage"
  | "Duplicate Payments"
  | "Maverick Spend"
  | "PO/Invoice Mismatch"
  | "Approval Anomalies"
  | "Supplier Anomalies";

export type Severity = "High" | "Medium" | "Low";
export type FindingStatus = "New" | "Under Review" | "Confirmed" | "Dismissed" | "Resolved";

export interface EvidenceMetric {
  label: string;
  value: string;
}

export interface Finding {
  id: string;
  type: FindingType;
  category: LeakageCategory;
  severity: Severity;
  confidence: number;
  estimatedImpact: number;
  title: string;
  description: string;
  whyFlagged: string;
  detectionMethod: string;
  calculation: string;
  confidenceRationale: string;
  metrics: EvidenceMetric[];
  evidenceTxnIds: string[];
  supplierId: string | null;
  supplierIds?: string[];
  department: Department | null;
  contractId?: string | null;
  itemId?: string | null;
  createdAt: string;
  priceHistory?: { month: string; unitPrice: number; qty: number }[];
  benchmarks?: { label: string; value: number }[];
}

export interface Dataset {
  suppliers: Supplier[];
  supplierById: Record<string, Supplier>;
  items: Item[];
  itemById: Record<string, Item>;
  contracts: Contract[];
  contractById: Record<string, Contract>;
  txns: Txn[];
  txnById: Record<string, Txn>;
  invoices: Invoice[];
  departments: Department[];
  categories: Category[];
  months: string[];
}

export interface Policies {
  approvalThreshold: number;
  maxPriceVariancePct: number;
  requirePO: boolean;
  requireContract: boolean;
  duplicateToleranceDays: number;
  contractExpiryWarningDays: number;
  minConfidence: number;
  allowedPaymentTerms: string[];
}

export interface RuleToggles {
  priceCreep: boolean;
  contractLeakage: boolean;
  duplicateInvoices: boolean;
  noPOSpend: boolean;
  splitPurchases: boolean;
  poInvoiceMismatch: boolean;
  quantityMismatch: boolean;
  supplierPriceVariance: boolean;
  departmentAnomalies: boolean;
  duplicateVendors: boolean;
  recurringCharges: boolean;
  contractExpiry: boolean;
}
