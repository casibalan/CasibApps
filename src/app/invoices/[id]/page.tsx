import { notFound } from "next/navigation";
import { BottomNav } from "@/components/app-shell/BottomNav";
import { InvoiceDetailCard } from "@/components/invoices/InvoiceDetailCard";
import { PaymentLinkCard } from "@/components/invoices/PaymentLinkCard";
import { SettlementCard } from "@/components/invoices/SettlementCard";
import { getInvoiceByIdOrNumber } from "@/lib/queries";
import { requireAuth } from "@/lib/auth-guard";

type InvoicePageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: InvoicePageProps) {
  // Require authenticated session
  const session = await requireAuth();

  const { id } = await params;

  // Scoped to merchant — returns null if invoice belongs to another merchant
  const invoice = await getInvoiceByIdOrNumber(id, session.merchantId);

  if (!invoice) notFound();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.12),_transparent_50%)]" />

      <div className="mx-auto w-full max-w-lg px-4 pb-24 pt-6 sm:px-6">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-cyan-300/80">
              {invoice.id}
            </p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight">Invoice Detail</h1>
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
          <InvoiceDetailCard invoice={invoice} />
          <PaymentLinkCard invoice={invoice} />
          <SettlementCard />
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
