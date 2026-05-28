"use client";

/**
 * PayInvoiceFlow — Payer checkout using external injected wallet.
 *
 * Current architecture:
 * - Payer connects via window.ethereum (MetaMask, Rabby, etc.)
 * - Approves USDC spend → calls payInvoice on Arc escrow contract
 * - Merchant receives USDC at their Circle Wallet address
 *
 * Future: Add Circle Wallet / embedded wallet as primary payer option.
 * This external wallet flow will remain as an alternative payment method.
 */

import { useState, useCallback } from "react";
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  type Hash,
} from "viem";
import {
  arcTestnet,
  USDC_ADDRESS,
  CASIB_INVOICE_ESCROW_ADDRESS,
  erc20ApproveAbi,
  casibInvoiceEscrowAbi,
} from "@/lib/arc-contracts";
import { toInvoiceId, toUsdcBaseUnits } from "@/lib/payment-utils";
import { confirmPayment } from "@/lib/payment-actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PaymentStep =
  | "idle"
  | "connecting"
  | "approving"
  | "paying"
  | "confirming"
  | "success"
  | "error";

type PayInvoiceFlowProps = {
  invoiceNumber: string;
  invoiceDbId: string;
  merchantWalletAddress: string;
  amountUsdc: number;
};

// ---------------------------------------------------------------------------
// Arc Testnet chain definition for viem
// ---------------------------------------------------------------------------

const arcTestnetChain = {
  id: arcTestnet.id,
  name: arcTestnet.name,
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [arcTestnet.rpcUrl] },
  },
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PayInvoiceFlow({
  invoiceNumber,
  invoiceDbId,
  merchantWalletAddress,
  amountUsdc,
}: PayInvoiceFlowProps) {
  const [step, setStep] = useState<PaymentStep>("idle");
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePay = useCallback(async () => {
    setErrorMsg(null);

    // Check for injected wallet (MetaMask, etc.)
    if (typeof window === "undefined" || !window.ethereum) {
      setErrorMsg(
        "No wallet detected. Please install MetaMask or another EVM wallet to pay."
      );
      setStep("error");
      return;
    }

    try {
      // 1. Connect wallet
      setStep("connecting");
      const walletClient = createWalletClient({
        chain: arcTestnetChain,
        transport: custom(window.ethereum),
      });

      const [account] = await walletClient.requestAddresses();
      if (!account) {
        throw new Error("No account returned from wallet");
      }

      // Ensure wallet is on Arc Testnet
      const chainId = await walletClient.getChainId();
      if (chainId !== arcTestnet.id) {
        try {
          await walletClient.switchChain({ id: arcTestnet.id });
        } catch {
          // switchChain failed — try adding the chain first, then switch
          try {
            await walletClient.addChain({
              chain: arcTestnetChain,
            });
            await walletClient.switchChain({ id: arcTestnet.id });
          } catch {
            throw new Error(
              "Please switch your wallet to Arc Testnet (chain ID 5042002)."
            );
          }
        }
      }

      const publicClient = createPublicClient({
        chain: arcTestnetChain,
        transport: http(arcTestnet.rpcUrl),
      });

      const amount = toUsdcBaseUnits(amountUsdc.toString());
      const invoiceId = toInvoiceId(invoiceNumber);

      // 2. Approve USDC spend
      setStep("approving");
      const approveTx = await walletClient.writeContract({
        account,
        address: USDC_ADDRESS,
        abi: erc20ApproveAbi,
        functionName: "approve",
        args: [CASIB_INVOICE_ESCROW_ADDRESS, amount],
        chain: arcTestnetChain,
      });

      await publicClient.waitForTransactionReceipt({ hash: approveTx });

      // 3. Call payInvoice on escrow contract
      setStep("paying");
      const payTx = await walletClient.writeContract({
        account,
        address: CASIB_INVOICE_ESCROW_ADDRESS,
        abi: casibInvoiceEscrowAbi,
        functionName: "payInvoice",
        args: [
          invoiceId,
          merchantWalletAddress as `0x${string}`,
          amount,
        ],
        chain: arcTestnetChain,
      });

      // 4. Wait for confirmation
      setStep("confirming");
      await publicClient.waitForTransactionReceipt({ hash: payTx });
      setTxHash(payTx);

      // 5. Verify payment onchain and record in database
      const result = await confirmPayment(invoiceDbId, payTx);
      if (!result.success) {
        setErrorMsg(
          `Transaction submitted onchain (see Arcscan), but server verification failed: ${result.error ?? "Unknown error"}. Contact the merchant if this persists.`
        );
        setStep("error");
        return;
      }

      setStep("success");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Payment failed. Please try again.";
      setErrorMsg(message);
      setStep("error");
    }
  }, [invoiceNumber, invoiceDbId, merchantWalletAddress, amountUsdc]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (step === "success") {
    return (
      <div className="rounded-[1.5rem] border border-emerald-300/30 bg-emerald-300/10 p-5 text-center">
        <div className="text-3xl">✓</div>
        <h3 className="mt-2 text-lg font-semibold text-emerald-100">
          Payment confirmed
        </h3>
        <p className="mt-2 text-sm text-slate-300">
          {amountUsdc} USDC sent to merchant on Arc Testnet.
        </p>
        {txHash && (
          <a
            href={`https://testnet.arcscan.app/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs text-cyan-300 underline"
          >
            View on Arcscan
          </a>
        )}
      </div>
    );
  }

  const isProcessing =
    step === "connecting" ||
    step === "approving" ||
    step === "paying" ||
    step === "confirming";

  const stepLabels: Record<PaymentStep, string> = {
    idle: "Pay with USDC",
    connecting: "Connecting wallet…",
    approving: "Approving USDC…",
    paying: "Sending payment…",
    confirming: "Waiting for confirmation…",
    success: "Done",
    error: "Retry payment",
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handlePay}
        disabled={isProcessing}
        className="w-full rounded-full bg-cyan-300 px-5 py-4 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {stepLabels[step]}
      </button>

      {isProcessing && (
        <p className="text-center text-xs text-slate-400 animate-pulse">
          Please confirm in your wallet…
        </p>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-red-500/10 border border-red-400/20 p-3 text-xs text-red-300 space-y-2">
          <p>{errorMsg}</p>
          {txHash && (
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-cyan-300 underline"
            >
              View transaction on Arcscan
            </a>
          )}
        </div>
      )}
    </div>
  );
}
