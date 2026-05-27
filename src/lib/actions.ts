"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import {
  isAddressLike,
  isTxHashLike,
  markInvoicePaid,
  verifyInvoicePaidOnchain,
} from "./payments";

const MERCHANT_EMAIL = "alanilahi123@gmail.com";

export type CreateInvoiceState = {
  errors?: {
    clientName?: string;
    amount?: string;
    description?: string;
    general?: string;
  };
};

export type ConfirmInvoicePaymentResult = {
  ok: boolean;
  error?: string;
};

export async function createInvoice(
  _prevState: CreateInvoiceState,
  formData: FormData
): Promise<CreateInvoiceState> {
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

  // Find or create the demo merchant
  let merchant = await prisma.merchant.findUnique({
    where: { email: MERCHANT_EMAIL },
  });

  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: {
        name: "Alan Ilahi",
        email: MERCHANT_EMAIL,
        businessName: "CasibApps",
      },
    });
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

  // Create the invoice
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

export async function confirmInvoicePayment(params: {
  invoiceNumber: string;
  txHash: string;
}): Promise<ConfirmInvoicePaymentResult> {
  if (!params.invoiceNumber.trim()) {
    return { ok: false, error: "Missing invoice number." };
  }

  if (!isTxHashLike(params.txHash)) {
    return { ok: false, error: "Invalid Arc transaction hash." };
  }

  const invoice = await prisma.invoice.findUnique({
    where: { invoiceNumber: params.invoiceNumber },
    include: { merchant: true },
  });

  if (!invoice) {
    return { ok: false, error: "Invoice not found." };
  }

  if (invoice.status === "PAID") {
    return { ok: true };
  }

  if (!isAddressLike(invoice.merchant.walletAddress)) {
    return { ok: false, error: "Merchant wallet address is not configured." };
  }

  const verification = await verifyInvoicePaidOnchain({
    invoiceNumber: invoice.invoiceNumber,
    merchantWalletAddress: invoice.merchant.walletAddress,
    amount: Number(invoice.amount),
    txHash: params.txHash,
  });

  if (!verification.ok) {
    return { ok: false, error: verification.reason ?? "Unable to verify Arc payment." };
  }

  await markInvoicePaid({
    invoiceNumber: invoice.invoiceNumber,
    txHash: params.txHash,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/invoices/${invoice.invoiceNumber}`);
  revalidatePath(`/pay/${invoice.paymentLinkSlug}`);

  return { ok: true };
}
