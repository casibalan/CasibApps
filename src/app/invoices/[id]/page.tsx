import { AppHeader } from "@/components/app-shell/AppHeader";
import { AppScreen } from "@/components/app-shell/AppScreen";
import { BottomNav } from "@/components/app-shell/BottomNav";
import { InvoiceDetailCard } from "@/components/invoices/InvoiceDetailCard";
import { PaymentLinkCard } from "@/components/invoices/PaymentLinkCard";
import { SettlementCard } from "@/components/invoices/SettlementCard";
import { getInvoiceById } from "@/lib/demo-data";

type InvoicePageProps = {
  params: Promise<{ id: string }>;
};

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
  const invoice = getInvoiceById(id);

  return (
    <AppScreen>
      <AppHeader title="Invoice detail" eyebrow={invoice.id} />
      <div className="space-y-4">
        <InvoiceDetailCard invoice={invoice} />
        <PaymentLinkCard invoice={invoice} />
        <SettlementCard />
      </div>
      <BottomNav />
    </AppScreen>
  );
}
