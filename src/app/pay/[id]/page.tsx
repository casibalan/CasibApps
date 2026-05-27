import { notFound } from "next/navigation";
import { PaymentSummary } from "@/components/payments/PaymentSummary";
import { PayInvoiceFlow } from "@/components/payments/PayInvoiceFlow";
import { TrustIndicators } from "@/components/payments/TrustIndicators";
import { getInvoiceWithMerchant } from "@/lib/queries";
import { getCircleEnvStatus } from "@/lib/circle";

type PayPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

/**
 * /pay/[id] — Public payment page for customers.
 * Does NOT require merchant auth — customers access this via payment links.
 * Payment flow safety is preserved: approve USDC → payInvoice → verify onchain → update DB.
 */
export default async function PayPage({ params }: PayPageProps) {
  const { id } = await params;
  const data = await getInvoiceWithMerchant(id);

  if (!data) notFound();

  const { invoice, merchantName, merchantWalletAddress, invoiceDbId } = data;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.08),_transparent_50%)]" />

      <div className="mx-auto w-full max-w-lg px-4 pb-12 pt-6 sm:px-6">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-cyan-300/80">
              USDC Checkout
            </p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight">Pay Invoice</h1>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-black text-white shadow-lg shadow-cyan-500/20">
            C
          </div>
        </header>

        <div className="space-y-4">
          {/* Invoice already paid */}
          {invoice.status === "paid" ? (
            <>
              <PaymentSummary invoice={invoice} merchantName={merchantName} />
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-base font-semibold text-emerald-100">
                  Invoice Paid
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">
                  This invoice has been paid and verified onchain.
                </p>
              </div>
              <TrustIndicators />
            </>
          ) : !merchantWalletAddress ? (
            /* Merchant wallet not configured */
            <>
              <PaymentSummary invoice={invoice} merchantName={merchantName} />
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/10">
                  <span className="text-2xl">⚠</span>
                </div>
                <h3 className="text-base font-semibold text-amber-100">
                  Merchant Wallet Not Configured
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">
                  This merchant has not set up their wallet yet. Payment cannot be processed until the merchant completes wallet onboarding.
                </p>
              </div>
              <TrustIndicators />
            </>
          ) : (
            /* Normal payment flow */
            <>
              <PaymentSummary invoice={invoice} merchantName={merchantName} />
              <PayInvoiceFlow
                invoiceNumber={invoice.id}
                invoiceDbId={invoiceDbId}
                merchantWalletAddress={merchantWalletAddress}
                amountUsdc={invoice.amount}
              />
              <TrustIndicators />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
