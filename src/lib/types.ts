export type InvoiceStatus = "paid" | "pending" | "draft" | "expired" | "cancelled";

export type SettlementStatus = "not_started" | "pending" | "settled" | "failed";

export type Invoice = {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  description: string;
  dueDate: string;
  status: InvoiceStatus;
  settlementStatus: SettlementStatus;
  paymentLink: string;
  createdAt: string;
  paidAt?: string;
  arcTxHash?: string;
};

export type DashboardStat = {
  label: string;
  value: string;
  detail: string;
};