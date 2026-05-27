"use client";

/**
 * LoginPageContent — Client wrapper for the login page.
 *
 * Renders the CasibApps branding and the Circle Google login flow.
 * Shows a configuration error if required env vars are missing.
 *
 * Google OAuth Web Client ID is configured inside Circle Console —
 * the SDK handles it automatically without needing it in our env.
 */

import { GoogleLoginFlow } from "./GoogleLoginFlow";

type LoginPageContentProps = {
  appId: string;
  missingVars: string[];
};

export function LoginPageContent({
  appId,
  missingVars,
}: LoginPageContentProps) {
  const hasConfig = missingVars.length === 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / branding */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/20">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <h1 className="text-2xl font-bold text-white">CasibApps</h1>
          <p className="mt-2 text-sm text-slate-400">
            USDC invoicing and checkout on Arc
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-3xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm">
          <h2 className="mb-1 text-center text-lg font-semibold text-slate-100">
            Merchant Login
          </h2>
          <p className="mb-6 text-center text-xs text-slate-400">
            Sign in to manage invoices and receive USDC payments
          </p>

          {hasConfig ? (
            <GoogleLoginFlow appId={appId} />
          ) : (
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
              <p className="text-xs font-medium text-amber-200">
                Configuration incomplete
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Missing environment variables:{" "}
                <span className="font-mono text-amber-300/80">
                  {missingVars.join(", ")}
                </span>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Add these to your .env file to enable Google login.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600">
          Powered by Circle &middot; Settled on Arc
        </p>
      </div>
    </div>
  );
}
