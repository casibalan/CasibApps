import { Badge } from "@/components/app-shell/Badge";
import type { Invoice } from "@/lib/types";

type PaymentSummaryProps = {
  invoice: Invoice;
  merchantName: string;
};

export function PaymentSummary({ invoice, merchantName }: PaymentSummaryProps) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-cyan-300/10 p-5">
      <div className="flex flex-wrap gap-2">
        <Badge tone="cyan">USDC checkout</Badge>
        <Badge tone="emerald">Settlement on Arc</Badge>
      </div>
      <p className="mt-6 text-sm text-slate-400">Paying</p>
      <h2 className="mt-1 text-xl font-semibold">{merchantName}</h2>
      <p className="mt-5 text-5xl font-semibold tracking-tight">
        {invoice.amount.toLocaleString()} <span className="text-xl text-cyan-100">USDC</span>
      </p>
      <div className="mt-6 space-y-3 text-sm">
        <div className="rounded-2xl bg-slate-950/60 p-4">
          <p className="text-slate-400">Description</p>
          <p className="mt-1 font-semibold">{invoice.description}</p>
        </div>
        <div className="rounded-2xl bg-slate-950/60 p-4">
          <p className="text-slate-400">Due date</p>
          <p className="mt-1 font-semibold">{invoice.dueDate}</p>
        </div>
      </div>
    </section>
  );
}
