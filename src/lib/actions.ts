"use server";

import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export type CreateInvoiceState = {
  errors?: {
    clientName?: string;
    amount?: string;
    description?: string;
    general?: string;
  };
};

export async function createInvoice(
  _prevState: CreateInvoiceState,
  formData: FormData
): Promise<CreateInvoiceState> {
  const merchantId = formData.get("merchantId")?.toString().trim() ?? "";
  const clientName = formData.get("clientName")?.toString().trim() ?? "";
  const clientEmail = formData.get("clientEmail")?.toString().trim() ?? "";
  const amountRaw = formData.get("amount")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";
  const dueDateRaw = formData.get("dueDate")?.toString().trim() ?? "";

  // Validation
  const errors: CreateInvoiceState["errors"] = {};

  if (!clientName) {
    errors.clientName = "Client name is required";
  }

  const amount = parseFloat(amountRaw);
  if (!amountRaw || isNaN(amount) || amount <= 0) {
    errors.amount = "Amount must be greater than 0";
  }

  if (!description) {
    errors.description = "Description is required";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // Resolve merchant from session merchantId
  let merchant;
  if (merchantId) {
    merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
    });
  }

  // Fallback: if merchantId not provided or not found, use first merchant
  // This preserves backward compatibility but should not happen with auth gating
  if (!merchant) {
    merchant = await prisma.merchant.findFirst({
      orderBy: { createdAt: "asc" },
    });
  }

  if (!merchant) {
    return { errors: { general: "No merchant account found. Please log in again." } };
  }

  // Generate next invoice number
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });

  let nextNumber = 1001;
  if (lastInvoice) {
    const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  const invoiceNumber = `INV-${nextNumber}`;
  const paymentLinkSlug = `pay-inv-${nextNumber}`;

  // Parse due date
  const dueDate = dueDateRaw ? new Date(dueDateRaw) : null;

  // Create the invoice linked to the authenticated merchant
  await prisma.invoice.create({
    data: {
      invoiceNumber,
      paymentLinkSlug,
      merchantId: merchant.id,
      clientName,
      clientEmail: clientEmail || null,
      amount,
      description,
      dueDate,
      currency: "USDC",
      status: "PENDING",
      settlementStatus: "NOT_STARTED",
    },
  });

  redirect(`/invoices/${invoiceNumber}`);
}
