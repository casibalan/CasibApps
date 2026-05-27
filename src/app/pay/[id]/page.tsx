import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-shell/AppHeader";
import { AppScreen } from "@/components/app-shell/AppScreen";
import { PaymentSummary } from "@/components/payments/PaymentSummary";
import { PayInvoiceFlow } from "@/components/payments/PayInvoiceFlow";
import { TrustIndicators } from "@/components/payments/TrustIndicators";
import { CircleWalletStatus } from "@/components/circle/CircleWalletStatus";
import { getInvoiceWithMerchant } from "@/lib/queries";
import { getCircleEnvStatus } from "@/lib/circle";

type PayPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function PayPage({ params }: PayPageProps) {
  const { id } = await params;
  const data = await getInvoiceWithMerchant(id);

  if (!data) notFound();

  const { invoice, merchantName, merchantWalletAddress, invoiceDbId } = data;

  // If invoice is already paid, show confirmation
  if (invoice.status === "paid") {
    return (
      <AppScreen>
        <AppHeader title="USDC checkout" eyebrow="Customer payment" />
        <div className="space-y-4">
          <PaymentSummary invoice={invoice} merchantName={merchantName} />
          <div className="rounded-[1.5rem] border border-emerald-300/30 bg-emerald-300/10 p-5 text-center">
            <div className="text-3xl">✓</div>
            <h3 className="mt-2 text-lg font-semibold text-emerald-100">
              Invoice paid
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              This invoice has already been paid.
            </p>
          </div>
          <TrustIndicators />
        </div>
      </AppScreen>
    );
  }

  // If merchant wallet is not configured, block payment and show Circle status
  if (!merchantWalletAddress) {
    const circleEnv = getCircleEnvStatus();
    return (
      <AppScreen>
        <AppHeader title="USDC checkout" eyebrow="Customer payment" />
        <div className="space-y-4">
          <PaymentSummary invoice={invoice} merchantName={merchantName} />
          <div className="rounded-[1.5rem] border border-amber-300/30 bg-amber-300/10 p-5 text-center">
            <div className="text-3xl">⚠</div>
            <h3 className="mt-2 text-lg font-semibold text-amber-100">
              Merchant wallet not configured
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              This merchant has not set up their Circle Wallet yet. Payment
              cannot be processed until the merchant completes wallet onboarding.
            </p>
          </div>
          <CircleWalletStatus
            walletAddress={null}
            circleConfigured={circleEnv.configured}
            circleConfigMissing={circleEnv.missing}
          />
          <TrustIndicators />
        </div>
      </AppScreen>
    );
  }

  // Normal payment flow
  return (
    <AppScreen>
      <AppHeader title="USDC checkout" eyebrow="Customer payment" />
      <div className="space-y-4">
        <PaymentSummary invoice={invoice} merchantName={merchantName} />
        <PayInvoiceFlow
          invoiceNumber={invoice.id}
          invoiceDbId={invoiceDbId}
          merchantWalletAddress={merchantWalletAddress}
          amountUsdc={invoice.amount}
        />
        <TrustIndicators />
      </div>
    </AppScreen>
  );
}
