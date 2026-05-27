import { StatusPill } from "@/components/app-shell/StatusPill";
import { getArcscanTxUrl } from "@/lib/arc-contract";
import type { Invoice } from "@/lib/types";

type PaymentStatusCardProps = {
  invoice: Invoice;
};

export function PaymentStatusCard({ invoice }: PaymentStatusCardProps) {
  const isPaid = invoice.status === "paid";

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">Arc settlement status</p>
          <h2 className="mt-1 text-xl font-semibold">
            {isPaid ? "Payment settled" : "Waiting for payment"}
          </h2>
        </div>
        <StatusPill status={invoice.status} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">
        {isPaid
          ? "This invoice was verified against CasibInvoiceEscrow on Arc Testnet and marked as settled in CasibApps."
          : "This invoice is pending. The checkout will approve USDC, call payInvoice on Arc Testnet, then verify the onchain event before updating the invoice record."}
      </p>
      {invoice.arcTxHash ? (
        <a
          href={getArcscanTxUrl(invoice.arcTxHash)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block break-all text-sm font-semibold text-cyan-100 underline underline-offset-4"
        >
          Arc transaction: {invoice.arcTxHash}
        </a>
      ) : null}
    </section>
  );
}
