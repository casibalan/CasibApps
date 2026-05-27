"use client";

/**
 * CircleWalletSetup — Client-side component for Circle wallet onboarding.
 *
 * This component handles the full merchant wallet setup flow:
 * 1. Check Circle configuration status
 * 2. Create Circle user (server action)
 * 3. Acquire session (userToken + encryptionKey)
 * 4. Initialize Web SDK and execute wallet creation challenge
 * 5. Sync wallet address back to database
 *
 * The Circle Web SDK (@circle-fin/w3s-pw-web-sdk) manages PIN entry,
 * security questions, and key generation in a secure iframe/modal.
 * The merchant's private key never leaves the client.
 */

import { useState, useCallback } from "react";
import {
  createCircleUser,
  acquireCircleSession,
  initializeCircleWallet,
  syncCircleWalletAddress,
} from "@/lib/circle-actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SetupStep =
  | "idle"
  | "creating-user"
  | "acquiring-session"
  | "initializing-wallet"
  | "executing-challenge"
  | "syncing"
  | "success"
  | "error";

type SetupNotice = {
  tone: "info" | "warning";
  text: string;
};

type CircleWalletSetupProps = {
  merchantId: string;
  merchantName: string;
  onWalletCreated?: (address: string) => void;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CircleWalletSetup({
  merchantId,
  merchantName,
  onWalletCreated,
}: CircleWalletSetupProps) {
  const [step, setStep] = useState<SetupStep>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notice, setNotice] = useState<SetupNotice | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleSetupWallet = useCallback(async () => {
    setErrorMsg(null);
    setNotice(null);
    setStep("creating-user");

    try {
      // Step 1: Create Circle user (idempotent — existing users return success)
      const userResult = await createCircleUser(merchantId);
      if (!userResult.success) {
        throw new Error(userResult.error ?? "Failed to create Circle user.");
      }

      // Step 2: Acquire session
      setStep("acquiring-session");
      const sessionResult = await acquireCircleSession(merchantId);
      if (!sessionResult.success || !sessionResult.data) {
        throw new Error(sessionResult.error ?? "Failed to acquire session.");
      }

      const { userToken, encryptionKey, appId } = sessionResult.data;

      // Step 3: Initialize wallet challenge — idempotent. If the user has
      // already completed wallet setup (existing Circle account or returning
      // session), `alreadyInitialized` will be true and we skip the SDK
      // challenge entirely.
      setStep("initializing-wallet");
      const walletResult = await initializeCircleWallet(merchantId);
      if (!walletResult.success || !walletResult.data) {
        throw new Error(walletResult.error ?? "Failed to initialize wallet.");
      }

      const { challengeId, alreadyInitialized } = walletResult.data;

      if (alreadyInitialized) {
        // No challenge needed — user has a Circle wallet from a previous
        // session or another device. Just surface the existing address.
        setNotice({
          tone: "info",
          text: "Wallet account already exists. Continuing setup...",
        });
      } else if (challengeId) {
        // Step 4: Execute challenge with Circle Web SDK (first-time setup)
        setStep("executing-challenge");

        const { W3SSdk } = await import("@circle-fin/w3s-pw-web-sdk");

        const sdk = new W3SSdk();
        sdk.setAppSettings({ appId });
        sdk.setAuthentication({ userToken, encryptionKey });

        // Execute the challenge — this opens Circle's secure UI
        await new Promise<void>((resolve, reject) => {
          sdk.execute(challengeId, (error, result) => {
            if (error) {
              reject(new Error(error.message ?? "Challenge execution failed."));
              return;
            }
            if (result?.status === "COMPLETE") {
              resolve();
            } else {
              reject(
                new Error(
                  `Challenge ended with status: ${result?.status ?? "UNKNOWN"}`
                )
              );
            }
          });
        });
      } else {
        throw new Error(
          "Circle did not return a challenge or existing wallet."
        );
      }

      // Step 5: Sync wallet address from Circle to database. This runs
      // for both first-time setup AND alreadyInitialized — it pulls the
      // existing wallet address into the merchant record either way.
      setStep("syncing");
      const syncResult = await syncCircleWalletAddress(merchantId);
      if (!syncResult.success) {
        throw new Error(syncResult.error ?? "Failed to sync wallet address.");
      }

      if (syncResult.data?.address) {
        setWalletAddress(syncResult.data.address);
        onWalletCreated?.(syncResult.data.address);
        setNotice(null);
        setStep("success");
      } else if (alreadyInitialized) {
        // The user has a Circle account but Circle hasn't surfaced a
        // wallet for this app/blockchain yet. Tell them to retry; this
        // typically resolves once Circle finishes provisioning.
        throw new Error(
          "Your Circle account exists, but no wallet is available yet for this app. Try again in a moment."
        );
      } else {
        throw new Error(
          "Wallet created but address not yet available. Please refresh in a moment."
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Wallet setup failed.";
      setErrorMsg(message);
      setNotice(null);
      setStep("error");
    }
  }, [merchantId, onWalletCreated]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (step === "success" && walletAddress) {
    return (
      <div className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-5">
        <div className="flex items-center gap-3">
          <div className="text-2xl">✓</div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-100">
              Wallet configured
            </h3>
            <p className="mt-1 text-xs text-slate-300 font-mono">
              {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isProcessing =
    step === "creating-user" ||
    step === "acquiring-session" ||
    step === "initializing-wallet" ||
    step === "executing-challenge" ||
    step === "syncing";

  const stepLabels: Record<SetupStep, string> = {
    idle: "Set up Circle Wallet",
    "creating-user": "Creating account…",
    "acquiring-session": "Preparing session…",
    "initializing-wallet": "Initializing wallet…",
    "executing-challenge": "Complete setup in popup…",
    syncing: "Saving wallet address…",
    success: "Done",
    error: "Retry setup",
  };

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">
          Circle Wallet Setup
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Set up a secure wallet for <span className="text-slate-200">{merchantName}</span> powered by Circle.
          Your private key stays with you — CasibApps never has access.
        </p>
      </div>

      <button
        onClick={handleSetupWallet}
        disabled={isProcessing}
        className="w-full rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {stepLabels[step]}
      </button>

      {isProcessing && step !== "executing-challenge" && (
        <p className="text-center text-xs text-slate-400 animate-pulse">
          Please wait…
        </p>
      )}

      {step === "executing-challenge" && (
        <p className="text-center text-xs text-cyan-300 animate-pulse">
          Complete the PIN and security setup in the Circle popup.
        </p>
      )}

      {notice && (
        <div
          className={
            notice.tone === "warning"
              ? "rounded-xl bg-amber-400/10 border border-amber-300/20 p-3 text-xs text-amber-200"
              : "rounded-xl bg-cyan-400/10 border border-cyan-300/20 p-3 text-xs text-cyan-200"
          }
        >
          <p>{notice.text}</p>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-red-500/10 border border-red-400/20 p-3 text-xs text-red-300">
          <p>{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
