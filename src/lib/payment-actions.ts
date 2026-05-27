"use server";

import { createPublicClient, http, decodeEventLog, getAddress } from "viem";
import { prisma } from "./prisma";
import { isValidTxHash, isValidAddress, toInvoiceId, toUsdcBaseUnits } from "./payment-utils";
import {
  arcTestnet,
  CASIB_INVOICE_ESCROW_ADDRESS,
  casibInvoiceEscrowAbi,
} from "./arc-contracts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConfirmPaymentResult = {
  success: boolean;
  error?: string;
};

// ---------------------------------------------------------------------------
// Arc Testnet public client (server-side only)
// ---------------------------------------------------------------------------

const publicClient = createPublicClient({
  transport: http(arcTestnet.rpcUrl),
});

// ---------------------------------------------------------------------------
// Server action
// ---------------------------------------------------------------------------

/**
 * Verify an onchain payment and update the invoice status.
 *
 * Security model:
 * 1. Fetch the invoice + merchant from the database.
 * 2. Require merchant.walletAddress to be set.
 * 3. Fetch the transaction receipt from Arc Testnet RPC.
 * 4. Require receipt.status === "success".
 * 5. Decode logs and find an InvoicePaid event from CASIB_INVOICE_ESCROW_ADDRESS.
 * 6. Verify event args match expected invoiceId, merchant address, and amount.
 * 7. Call isPaid(invoiceId) on the contract as a final check.
 * 8. Only then mark the invoice as PAID.
 */
export async function confirmPayment(
  invoiceDbId: string,
  txHash: string
): Promise<ConfirmPaymentResult> {
  // -------------------------------------------------------------------------
  // Basic input validation
  // -------------------------------------------------------------------------

  if (!txHash || !isValidTxHash(txHash)) {
    return { success: false, error: "Invalid transaction hash." };
  }

  // -------------------------------------------------------------------------
  // 1. Fetch invoice with merchant
  // -------------------------------------------------------------------------

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceDbId },
    include: { merchant: true },
  });

  if (!invoice) {
    return { success: false, error: "Invoice not found." };
  }

  if (invoice.status === "PAID") {
    return { success: true }; // Idempotent — already verified and marked
  }

  // -------------------------------------------------------------------------
  // 2. Require merchant wallet
  // -------------------------------------------------------------------------

  const merchantWallet = invoice.merchant.walletAddress;
  if (!merchantWallet) {
    return {
      success: false,
      error: "Merchant wallet address is not configured.",
    };
  }

  if (!isValidAddress(merchantWallet)) {
    return {
      success: false,
      error: "Merchant wallet address is invalid.",
    };
  }

  // -------------------------------------------------------------------------
  // 3. Compute expected values
  // -------------------------------------------------------------------------

  const expectedInvoiceId = toInvoiceId(invoice.invoiceNumber);
  const expectedAmount = toUsdcBaseUnits(String(invoice.amount));
  const expectedMerchant = getAddress(merchantWallet);

  // -------------------------------------------------------------------------
  // 4. Fetch transaction receipt
  // -------------------------------------------------------------------------

  let receipt;
  try {
    receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });
  } catch {
    return {
      success: false,
      error: "Could not fetch transaction receipt. The transaction may still be pending.",
    };
  }

  if (receipt.status !== "success") {
    return {
      success: false,
      error: "Transaction reverted onchain.",
    };
  }

  // -------------------------------------------------------------------------
  // 5. Decode logs and find InvoicePaid event from the escrow contract
  // -------------------------------------------------------------------------

  const escrowAddress = getAddress(CASIB_INVOICE_ESCROW_ADDRESS);

  type InvoicePaidArgs = {
    invoiceId: `0x${string}`;
    payer: `0x${string}`;
    merchant: `0x${string}`;
    amount: bigint;
  };

  let matchedEvent: InvoicePaidArgs | null = null;

  for (const log of receipt.logs) {
    // Only consider logs emitted by the escrow contract
    if (getAddress(log.address) !== escrowAddress) continue;

    try {
      const decoded = decodeEventLog({
        abi: casibInvoiceEscrowAbi,
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName === "InvoicePaid") {
        matchedEvent = decoded.args as unknown as InvoicePaidArgs;
        break;
      }
    } catch {
      // Log doesn't match our ABI — skip
      continue;
    }
  }

  if (!matchedEvent) {
    return {
      success: false,
      error: "No InvoicePaid event found in transaction logs.",
    };
  }

  // -------------------------------------------------------------------------
  // 6. Verify event args match expected values
  // -------------------------------------------------------------------------

  if (matchedEvent.invoiceId !== expectedInvoiceId) {
    return {
      success: false,
      error: "Transaction invoiceId does not match this invoice.",
    };
  }

  if (getAddress(matchedEvent.merchant) !== expectedMerchant) {
    return {
      success: false,
      error: "Transaction merchant address does not match invoice merchant.",
    };
  }

  if (matchedEvent.amount !== expectedAmount) {
    return {
      success: false,
      error: "Transaction amount does not match invoice amount.",
    };
  }

  // -------------------------------------------------------------------------
  // 7. Call isPaid(invoiceId) on the contract as final confirmation
  // -------------------------------------------------------------------------

  try {
    const isPaid = await publicClient.readContract({
      address: CASIB_INVOICE_ESCROW_ADDRESS,
      abi: casibInvoiceEscrowAbi,
      functionName: "isPaid",
      args: [expectedInvoiceId],
    });

    if (!isPaid) {
      return {
        success: false,
        error: "Contract reports invoice is not paid.",
      };
    }
  } catch {
    return {
      success: false,
      error: "Could not verify payment status on contract.",
    };
  }

  // -------------------------------------------------------------------------
  // 8. All checks passed — update invoice
  // -------------------------------------------------------------------------

  await prisma.invoice.update({
    where: { id: invoiceDbId },
    data: {
      status: "PAID",
      settlementStatus: "SETTLED",
      arcTxHash: txHash,
      paidAt: new Date(),
    },
  });

  return { success: true };
}
