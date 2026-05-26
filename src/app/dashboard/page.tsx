import { AppHeader } from "@/components/app-shell/AppHeader";
import { AppScreen } from "@/components/app-shell/AppScreen";
import { BalanceCard } from "@/components/app-shell/BalanceCard";
import { BottomNav } from "@/components/app-shell/BottomNav";
import { StatCard } from "@/components/app-shell/StatCard";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { dashboardStats, demoInvoices } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <AppScreen>
      <AppHeader title="Merchant dashboard" eyebrow="CasibApps" />
      <BalanceCard />
      <section className="mt-4 grid gap-3 md:grid-cols-3">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>
      <InvoiceList invoices={demoInvoices} />
      <BottomNav />
    </AppScreen>
  );
}
