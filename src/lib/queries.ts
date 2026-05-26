import { prisma } from "./prisma";
import type { Invoice, DashboardStat } from "./types";

/**
 * Map a Prisma Invoice row to the UI Invoice type.
 */
function toInvoiceView(row: {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string | null;
  amount: unknown; // Decimal comes as Prisma.Decimal
  description: string;
  dueDate: Date | null;
  status: string;
  paymentLinkSlug: string;
  createdAt: Date;
}): Invoice {
  return {
    id: row.invoiceNumber,
    clientName: row.clientName,
    clientEmail: row.clientEmail ?? "",
    amount: Number(row.amount),
    description: row.description,
    dueDate: row.dueDate ? row.dueDate.toISOString().slice(0, 10) : "",
    status: row.status.toLowerCase() as Invoice["status"],
    paymentLink: `/pay/${row.paymentLinkSlug}`,
    createdAt: row.createdAt.toISOString().slice(0, 10),
  };
}

/**
 * Fetch the first merchant (single-tenant for now).
 */
export async function getMerchant() {
  const merchant = await prisma.merchant.findFirst({
    orderBy: { createdAt: "asc" },
  });
  return merchant;
}

/**
 * Fetch all invoices for the dashboard, ordered by newest first.
 */
export async function getInvoices(): Promise<Invoice[]> {
  const rows = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toInvoiceView);
}

/**
 * Fetch a single invoice by invoiceNumber, paymentLinkSlug, or cuid id.
 * Supports case-insensitive matching for invoiceNumber and paymentLinkSlug.
 */
export async function getInvoiceByIdOrNumber(
  idOrNumber: string
): Promise<Invoice | null> {
  const row = await prisma.invoice.findFirst({
    where: {
      OR: [
        { id: idOrNumber },
        { invoiceNumber: { equals: idOrNumber, mode: "insensitive" } },
        { paymentLinkSlug: { equals: idOrNumber, mode: "insensitive" } },
      ],
    },
  });
  if (!row) return null;
  return toInvoiceView(row);
}

/**
 * Fetch a single invoice with merchant info for the pay page.
 * Supports case-insensitive matching for invoiceNumber and paymentLinkSlug.
 */
export async function getInvoiceWithMerchant(idOrNumber: string) {
  const row = await prisma.invoice.findFirst({
    where: {
      OR: [
        { id: idOrNumber },
        { invoiceNumber: { equals: idOrNumber, mode: "insensitive" } },
        { paymentLinkSlug: { equals: idOrNumber, mode: "insensitive" } },
      ],
    },
    include: { merchant: true },
  });
  if (!row) return null;
  return {
    invoice: toInvoiceView(row),
    merchantName: row.merchant.businessName ?? row.merchant.name,
  };
}

/**
 * Compute dashboard stats from real invoice data.
 */
export async function getDashboardStats(): Promise<DashboardStat[]> {
  const [paidCount, pendingCount, totalReceived] = await Promise.all([
    prisma.invoice.count({ where: { status: "PAID" } }),
    prisma.invoice.count({ where: { status: "PENDING" } }),
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  const totalAmount = totalReceived._sum.amount
    ? Number(totalReceived._sum.amount).toLocaleString()
    : "0";

  return [
    {
      label: "Paid invoices",
      value: String(paidCount),
      detail: "Circle-powered checkout",
    },
    {
      label: "Pending invoices",
      value: String(pendingCount),
      detail: "Awaiting USDC payment",
    },
    {
      label: "Total received",
      value: `${totalAmount} USDC`,
      detail: "Settled on Arc",
    },
  ];
}
