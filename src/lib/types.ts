export type InvoiceStatus = "paid" | "pending" | "draft";

export type Invoice = {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  description: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentLink: string;
  createdAt: string;
};

export type DashboardStat = {
  label: string;
  value: string;
  detail: string;
};
