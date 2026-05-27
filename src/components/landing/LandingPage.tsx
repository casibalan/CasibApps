import Link from "next/link";

/**
 * LandingPage — Professional login-first landing for unauthenticated users.
 * Mobile-first, Web3 fintech style. Primary CTA is "Continue with Google".
 */
export function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-white">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(20,184,166,0.15),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.12),_transparent_50%)]" />

      {/* Subtle grid pattern */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 flex flex-1 flex-col">
        {/* Nav */}
        <nav className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-black text-white shadow-lg shadow-cyan-500/20">
              C
            </span>
            <span className="text-base font-semibold tracking-tight">CasibApps</span>
          </div>
          <Link
            href="/login"
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-200"
          >
            Sign In
          </Link>
        </nav>

        {/* Hero */}
        <section className="flex flex-1 flex-col items-center justify-center px-5 pb-12 pt-8 text-center sm:px-8">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-medium text-cyan-200">
              Circle-powered &middot; Arc settlement
            </span>
          </div>

          <h1 className="max-w-lg text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Accept{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              USDC payments
            </span>{" "}
            with one link
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400 sm:text-lg">
            Create invoices, share payment links, and receive USDC directly to your wallet. Built for freelancers and small businesses.
          </p>

          {/* Primary CTA */}
          <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-xl shadow-black/20 transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Link>
            <p className="text-center text-[11px] text-slate-500">
              Secure login via Circle &middot; No seed phrases
            </p>
          </div>

          {/* Feature pills */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            <FeaturePill icon="⚡" text="Instant USDC" />
            <FeaturePill icon="🔒" text="Non-custodial" />
            <FeaturePill icon="🌐" text="Arc settlement" />
            <FeaturePill icon="📱" text="Mobile-first" />
          </div>
        </section>

        {/* Trust bar */}
        <footer className="border-t border-white/5 px-5 py-5 text-center">
          <p className="text-xs text-slate-500">
            Powered by Circle Developer Platform &middot; USDC on Arc Testnet
          </p>
        </footer>
      </div>
    </main>
  );
}

function FeaturePill({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">
      <span>{icon}</span>
      {text}
    </span>
  );
}
