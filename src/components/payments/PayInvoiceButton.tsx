"use client";

import { useState, useTransition } from "react";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { confirmInvoicePayment } from "@/lib/actions";
import {
  ARC_TESTNET_CHAIN_ID,
  arcTestnet,
  CASIB_INVOICE_ESCROW_ADDRESS,
  casibInvoiceEscrowAbi,
  erc20ApproveAbi,
  getArcscanTxUrl,
  USDC_TOKEN_ADDRESS,
} from "@/lib/arc-contract";
import { getInvoiceBytes32, getUsdcBaseUnits } from "@/lib/payment-utils";
import type { Invoice } from "@/lib/types";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

type PayInvoiceButtonProps = {
  invoice: Invoice;
  merchantWalletAddress: string | null;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Payment failed before it could be confirmed.";
}

export function PayInvoiceButton({ invoice, merchantWalletAddress }: PayInvoiceButtonProps) {
  const [status, setStatus] = useState<"idle" | "approving" | "paying" | "confirming" | "paid">(
    invoice.status === "paid" ? "paid" : "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(invoice.arcTxHash ?? null);
  const [isPending, startTransition] = useTransition();

  const disabled =
    status === "paid" ||
    status === "approving" ||
    status === "paying" ||
    status === "confirming" ||
    isPending;

  async function handlePay() {
    setError(null);

    if (!merchantWalletAddress) {
      setError("Merchant wallet address is not configured yet.");
      return;
    }

    if (!window.ethereum) {
      setError("No browser wallet detected. Connect an EIP-1193 wallet before paying.");
      return;
    }

    try {
      const walletClient = createWalletClient({
        chain: arcTestnet,
        transport: custom(window.ethereum),
      });
      const publicClient = createPublicClient({
        chain: arcTestnet,
        transport: http(),
      });

      const [account] = await walletClient.requestAddresses();
      const currentChainId = await walletClient.getChainId();

      if (currentChainId !== ARC_TESTNET_CHAIN_ID) {
        await walletClient.switchChain({ id: ARC_TESTNET_CHAIN_ID });
      }

      const amount = getUsdcBaseUnits(invoice.amount);
      const invoiceId = getInvoiceBytes32(invoice.id);

      setStatus("approving");
      const approveHash = await walletClient.writeContract({
        account,
        address: USDC_TOKEN_ADDRESS,
        abi: erc20ApproveAbi,
        functionName: "approve",
        args: [CASIB_INVOICE_ESCROW_ADDRESS, amount],
      });

      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      setStatus("paying");
      const paymentHash = await walletClient.writeContract({
        account,
        address: CASIB_INVOICE_ESCROW_ADDRESS,
        abi: casibInvoiceEscrowAbi,
        functionName: "payInvoice",
        args: [invoiceId, merchantWalletAddress as `0x${string}`, amount],
      });

      setTxHash(paymentHash);
      await publicClient.waitForTransactionReceipt({ hash: paymentHash });

      setStatus("confirming");
      startTransition(async () => {
        const result = await confirmInvoicePayment({
          invoiceNumber: invoice.id,
          txHash: paymentHash,
        });

        if (!result.ok) {
          setError(result.error ?? "Arc payment could not be verified.");
          setStatus("idle");
          return;
        }

        setStatus("paid");
      });
    } catch (paymentError) {
      setError(getErrorMessage(paymentError));
      setStatus("idle");
    }
  }

  const label = {
    idle: "Approve USDC and pay invoice",
    approving: "Approving USDC...",
    paying: "Paying on Arc...",
    confirming: "Confirming settlement...",
    paid: "Invoice paid",
  }[status];

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={handlePay}
        disabled={disabled}
        className="w-full rounded-full bg-cyan-300 px-5 py-4 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {label}
      </button>

      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs leading-5 text-slate-300">
        <p>
          This checkout performs a real USDC approve transaction, then calls CasibInvoiceEscrow.payInvoice on Arc Testnet.
        </p>
        {txHash ? (
          <a
            href={getArcscanTxUrl(txHash)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block break-all font-semibold text-cyan-100 underline underline-offset-4"
          >
            View Arc transaction: {txHash}
          </a>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
          {error}
        </p>
      ) : null}
    </section>
  );
}
