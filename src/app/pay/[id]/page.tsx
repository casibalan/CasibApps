import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-shell/AppHeader";
import { AppScreen } from "@/components/app-shell/AppScreen";
import { PaymentStatusCard } from "@/components/payments/PaymentStatusCard";
import { PaymentSummary } from "@/components/payments/PaymentSummary";
import { TrustIndicators } from "@/components/payments/TrustIndicators";
import { getInvoiceWithMerchant } from "@/lib/queries";

type PayPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export default async function PayPage({ params }: PayPageProps) {
  const { id } = await params;
  const data = await getInvoiceWithMerchant(id);

  if (!data) notFound();

  return (
    <AppScreen>
      <AppHeader title="USDC checkout" eyebrow="Customer payment" />
      <div className="space-y-4">
        <PaymentSummary invoice={data.invoice} merchantName={data.merchantName} />
        <button className="w-full rounded-full bg-cyan-300 px-5 py-4 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-200">
          Start checkout
        </button>
        <TrustIndicators />
        <PaymentStatusCard />
      </div>
    </AppScreen>
  );
}
