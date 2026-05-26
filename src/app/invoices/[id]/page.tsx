import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-shell/AppHeader";
import { AppScreen } from "@/components/app-shell/AppScreen";
import { BottomNav } from "@/components/app-shell/BottomNav";
import { InvoiceDetailCard } from "@/components/invoices/InvoiceDetailCard";
import { PaymentLinkCard } from "@/components/invoices/PaymentLinkCard";
import { SettlementCard } from "@/components/invoices/SettlementCard";
import { getInvoiceByIdOrNumber } from "@/lib/queries";

type InvoicePageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
  const invoice = await getInvoiceByIdOrNumber(id);

  if (!invoice) notFound();

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
