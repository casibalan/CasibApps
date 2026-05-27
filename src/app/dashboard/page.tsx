import { AppHeader } from "@/components/app-shell/AppHeader";
import { AppScreen } from "@/components/app-shell/AppScreen";
import { BalanceCard } from "@/components/app-shell/BalanceCard";
import { BottomNav } from "@/components/app-shell/BottomNav";
import { StatCard } from "@/components/app-shell/StatCard";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { CircleWalletStatus } from "@/components/circle/CircleWalletStatus";
import { getDashboardStats, getInvoices, getMerchant, getMerchantById } from "@/lib/queries";
import { getCircleEnvStatus } from "@/lib/circle";
import { getMerchantSession } from "@/lib/auth-actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  // Check for authenticated session
  const session = await getMerchantSession();

  // Use session merchant if available, otherwise fall back to first merchant
  let merchant;
  if (session) {
    merchant = await getMerchantById(session.merchantId);
  } else {
    merchant = await getMerchant();
  }

  const [stats, invoices] = await Promise.all([
    getDashboardStats(),
    getInvoices(),
  ]);

  const circleEnv = getCircleEnvStatus();

  return (
    <AppScreen>
      <AppHeader title="Merchant dashboard" eyebrow="CasibApps" />

      {/* Session indicator */}
      {session ? (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-2">
          <span className="text-xs text-slate-400">
            Signed in as{" "}
            <span className="text-slate-200">
              {merchant?.businessName ?? merchant?.name ?? session.email}
            </span>
          </span>
          <a
            href="/logout"
            className="text-xs text-slate-500 hover:text-slate-300 transition"
          >
            Sign out
          </a>
        </div>
      ) : (
        <div className="mb-3 rounded-xl bg-cyan-300/5 border border-cyan-300/20 px-4 py-2 text-center">
          <a
            href="/login"
            className="text-xs text-cyan-300 hover:text-cyan-200 transition font-medium"
          >
            Sign in with Google to manage your own merchant account →
          </a>
        </div>
      )}

      <BalanceCard />

      {/* Circle Wallet status */}
      {merchant && (
        <section className="mt-4">
          <CircleWalletStatus
            walletAddress={merchant.walletAddress}
            circleConfigured={circleEnv.configured}
            circleConfigMissing={circleEnv.missing}
          />
          {!merchant.walletAddress && circleEnv.configured && (
            <a
              href="/wallet"
              className="mt-2 block text-center text-xs text-cyan-300 underline"
            >
              Set up Circle Wallet →
            </a>
          )}
        </section>
      )}

      <section className="mt-4 grid gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>
      <InvoiceList invoices={invoices} />
      <BottomNav />
    </AppScreen>
  );
}
