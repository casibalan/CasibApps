import { getMerchantById } from "@/lib/queries";
import { requireAuth } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  // Require authenticated session — redirects to /login if missing
  const session = await requireAuth();

  const merchant = await getMerchantById(session.merchantId);

  if (!merchant) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.12),_transparent_50%)]" />
        <div className="mx-auto w-full max-w-lg px-4 pb-24 pt-6 sm:px-6">
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-center">
            <p className="text-sm text-red-300">
              No merchant found. Please contact support.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.12),_transparent_50%)]" />

      <div className="mx-auto w-full max-w-lg px-4 pb-24 pt-6 sm:px-6">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-cyan-300/80">
              Circle Wallet
            </p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight">Wallet Setup</h1>
          </div>
          <a
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-black text-white shadow-lg shadow-cyan-500/20"
            aria-label="Back to dashboard"
          >
            C
          </a>
        </header>

        <div className="space-y-4">
          {/* Wallet status card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${merchant.walletAddress ? "bg-emerald-400/10" : "bg-amber-400/10"}`}>
                <span className="text-xl">{merchant.walletAddress ? "✓" : "💳"}</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-200">
                  {merchant.walletAddress ? "Wallet Connected" : "Set Up Your Wallet"}
                </h2>
                <p className="text-xs text-slate-500">
                  {merchant.walletAddress
                    ? "Your Circle Wallet is ready to receive payments"
                    : "Connect a wallet to start receiving USDC payments"}
                </p>
              </div>
            </div>

            {merchant.walletAddress && (
              <div className="rounded-xl bg-slate-900/50 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-0.5">Address</p>
                <p className="font-mono text-xs text-slate-300 break-all">
                  {merchant.walletAddress}
                </p>
              </div>
            )}
          </div>

          {/* Wallet setup guidance for Social Login merchants.
              The Social Login flow (GoogleLoginFlow) creates the Circle wallet
              during login. The manual CircleWalletSetup component uses a
              separate PIN-based flow that is incompatible with Social Login
              users (causes ApolloError: Forbidden). Instead, direct the user
              to log out and log back in to re-trigger wallet creation. */}
          {!merchant.walletAddress && (
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔑</span>
                <h3 className="text-sm font-semibold text-cyan-100">
                  Complete Wallet Setup
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Your wallet is created automatically during Google login.
                If wallet setup didn&apos;t complete, log out and log back in
                to retry. The Circle SDK will resume wallet creation.
              </p>
              <a
                href="/logout"
                className="block w-full rounded-full bg-cyan-300 px-5 py-3 text-center text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-200"
              >
                Log out &amp; retry wallet setup
              </a>
            </div>
          )}

          {/* How it works */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              How Circle Wallets work
            </h3>
            <ul className="space-y-2.5">
              {[
                "Your wallet is secured by a PIN only you know",
                "Private keys are split — CasibApps never has full access",
                "Payments are verified onchain via Arc smart contract",
                "USDC is sent directly to your wallet address",
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-xs text-slate-400">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Merchant details */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              Merchant Details
            </h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-xs text-slate-500">Name</dt>
                <dd className="text-xs text-slate-300">{merchant.businessName ?? merchant.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="text-xs text-slate-300">{merchant.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-slate-500">Wallet</dt>
                <dd className="font-mono text-xs text-slate-300">
                  {merchant.walletAddress
                    ? `${merchant.walletAddress.slice(0, 6)}…${merchant.walletAddress.slice(-4)}`
                    : "Not configured"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </main>
  );
}
