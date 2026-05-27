import { BottomNav } from "@/components/app-shell/BottomNav";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { getDashboardStats, getInvoices, getMerchantById } from "@/lib/queries";
import { requireAuth } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Require authenticated session — redirects to /login if missing
  const session = await requireAuth();

  const merchant = await getMerchantById(session.merchantId);
  const [stats, invoices] = await Promise.all([
    getDashboardStats(session.merchantId),
    getInvoices(session.merchantId),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.12),_transparent_50%)]" />

      <div className="mx-auto w-full max-w-lg px-4 pb-24 pt-6 sm:px-6">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-cyan-300/80">
              CasibApps
            </p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/logout"
              className="text-xs text-slate-500 transition hover:text-slate-300"
            >
              Sign out
            </a>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-black text-white shadow-lg shadow-cyan-500/20">
              C
            </div>
          </div>
        </header>

        {/* Merchant info bar */}
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-300/10 text-sm font-bold text-cyan-300">
            {(merchant?.businessName ?? merchant?.name ?? "M").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-200">
              {merchant?.businessName ?? merchant?.name ?? "Merchant"}
            </p>
            <p className="truncate text-xs text-slate-500">{session.email}</p>
          </div>
        </div>

        {/* Wallet status */}
        {merchant && (
          <section className="mb-5">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${merchant.walletAddress ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
                  <span className="text-xs font-medium text-slate-300">
                    {merchant.walletAddress ? "Wallet connected" : "Wallet not configured"}
                  </span>
                </div>
                {merchant.walletAddress ? (
                  <span className="font-mono text-xs text-slate-500">
                    {merchant.walletAddress.slice(0, 6)}…{merchant.walletAddress.slice(-4)}
                  </span>
                ) : (
                  <a
                    href="/wallet"
                    className="text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
                  >
                    Set up →
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Stats */}
        <section className="mb-5 grid grid-cols-3 gap-2.5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 text-center"
            >
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </section>

        {/* Quick actions */}
        <section className="mb-5 grid grid-cols-2 gap-2.5">
          <a
            href="/invoices/new"
            className="flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-3 transition hover:bg-cyan-300/10"
          >
            <span className="text-lg">+</span>
            <span className="text-sm font-semibold text-cyan-200">New Invoice</span>
          </a>
          <a
            href="/wallet"
            className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06]"
          >
            <span className="text-lg">💳</span>
            <span className="text-sm font-semibold text-slate-300">Wallet</span>
          </a>
        </section>

        {/* Invoice list */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-400">Recent Invoices</h2>
          <InvoiceList invoices={invoices} />
        </section>

        <BottomNav />
      </div>
    </main>
  );
}
