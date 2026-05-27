"use client";

/**
 * CircleWalletStatus — Displays the current wallet configuration state.
 *
 * Shows one of:
 * - Wallet configured (with truncated address)
 * - Wallet not configured (with setup CTA)
 * - Circle not configured (env vars missing — admin notice)
 */

type CircleWalletStatusProps = {
  walletAddress: string | null;
  circleConfigured: boolean;
  circleConfigMissing?: string[];
};

export function CircleWalletStatus({
  walletAddress,
  circleConfigured,
  circleConfigMissing = [],
}: CircleWalletStatusProps) {
  // Wallet is already configured
  if (walletAddress) {
    return (
      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300 text-sm">
            ✓
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-200">
              Wallet connected
            </p>
            <p className="text-xs text-slate-400 font-mono">
              {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Circle env vars not configured — admin/developer notice
  if (!circleConfigured) {
    return (
      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 text-sm">
            ⚙
          </div>
          <div>
            <p className="text-xs font-medium text-amber-200">
              Circle Wallet SDK not configured
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Missing environment variables:{" "}
              <span className="font-mono text-amber-300/80">
                {circleConfigMissing.join(", ")}
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Add these to your .env file to enable wallet onboarding.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Circle configured but wallet not yet set up
  return (
    <div className="rounded-2xl border border-slate-600/30 bg-slate-800/30 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600/30 text-slate-400 text-sm">
          ○
        </div>
        <div>
          <p className="text-xs font-medium text-slate-300">
            Wallet not configured
          </p>
          <p className="text-xs text-slate-500">
            Complete Circle Wallet setup to receive payments.
          </p>
        </div>
      </div>
    </div>
  );
}
