import type { DashboardStat, Invoice } from "./types";

export const merchant = {
  name: "Casib Studio",
  email: "billing@casibapps.demo",
};

export const usdcBalance = {
  amount: "12,480.50",
  label: "Available USDC balance",
};

export const dashboardStats: DashboardStat[] = [
  {
    label: "Paid invoices",
    value: "18",
    detail: "Circle-powered checkout",
  },
  {
    label: "Pending invoices",
    value: "4",
    detail: "Awaiting USDC payment",
  },
  {
    label: "Total received",
    value: "42,860 USDC",
    detail: "Settled on Arc demo",
  },
];

export const demoInvoices: Invoice[] = [
  {
    id: "inv-1008",
    clientName: "Northstar Creative",
    clientEmail: "ap@northstar.example",
    amount: 1250,
    description: "Design retainer and checkout setup",
    dueDate: "2026-06-04",
    status: "pending",
    paymentLink: "/pay/inv-1008",
    createdAt: "2026-05-24",
  },
  {
    id: "inv-1007",
    clientName: "Brightline Labs",
    clientEmail: "finance@brightline.example",
    amount: 3400,
    description: "AI commerce workflow consulting",
    dueDate: "2026-05-30",
    status: "paid",
    paymentLink: "/pay/inv-1007",
    createdAt: "2026-05-21",
  },
  {
    id: "inv-1006",
    clientName: "Riverdesk Supply",
    clientEmail: "ops@riverdesk.example",
    amount: 875,
    description: "USDC checkout pilot invoice",
    dueDate: "2026-05-28",
    status: "pending",
    paymentLink: "/pay/inv-1006",
    createdAt: "2026-05-20",
  },
];

export function getInvoiceById(id: string) {
  return demoInvoices.find((invoice) => invoice.id === id) ?? demoInvoices[0];
}
