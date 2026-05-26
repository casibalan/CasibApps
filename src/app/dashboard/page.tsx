import { AppHeader } from "@/components/app-shell/AppHeader";
import { AppScreen } from "@/components/app-shell/AppScreen";
import { BalanceCard } from "@/components/app-shell/BalanceCard";
import { BottomNav } from "@/components/app-shell/BottomNav";
import { StatCard } from "@/components/app-shell/StatCard";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { getDashboardStats, getInvoices } from "@/lib/queries";

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const [stats, invoices] = await Promise.all([
    getDashboardStats(),
    getInvoices(),
  ]);

  return (
    <AppScreen>
      <AppHeader title="Merchant dashboard" eyebrow="CasibApps" />
      <BalanceCard />
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
