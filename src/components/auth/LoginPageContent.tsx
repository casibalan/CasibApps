"use client";

/**
 * LoginPageContent — Professional login page with Circle Google login flow.
 * Mobile-first, Web3 fintech style.
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
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-8">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.1),_transparent_50%)]" />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Logo / branding */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-xl shadow-cyan-500/20">
            <span className="text-2xl font-black text-white">C</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CasibApps</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            USDC invoicing and checkout on Arc
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <h2 className="mb-1 text-center text-base font-semibold text-slate-100">
            Merchant Login
          </h2>
          <p className="mb-6 text-center text-xs text-slate-500">
            Sign in to manage invoices and receive USDC payments
          </p>

          {hasConfig ? (
            <GoogleLoginFlow appId={appId} />
          ) : (
            <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
              <p className="text-xs font-medium text-amber-200">
                Configuration incomplete
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Missing:{" "}
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

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600">
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            Non-custodial
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-cyan-500" />
            Circle-powered
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-blue-500" />
            Arc settlement
          </span>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-600">
          Powered by Circle Developer Platform
        </p>
      </div>
    </main>
  );
}
