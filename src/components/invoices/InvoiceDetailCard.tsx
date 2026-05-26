import { Badge } from "@/components/app-shell/Badge";
import { StatusPill } from "@/components/app-shell/StatusPill";
import type { Invoice } from "@/lib/types";

type InvoiceDetailCardProps = {
  invoice: Invoice;
};

export function InvoiceDetailCard({ invoice }: InvoiceDetailCardProps) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">Invoice amount</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">
            {invoice.amount.toLocaleString()} USDC
          </h2>
        </div>
        <StatusPill status={invoice.status} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Badge tone="cyan">USDC checkout</Badge>
        <Badge tone="emerald">Circle-powered</Badge>
      </div>
      <div className="mt-6 grid gap-3 text-sm">
        <div className="rounded-2xl bg-slate-950/60 p-4">
          <p className="text-slate-400">Client</p>
          <p className="mt-1 font-semibold">{invoice.clientName}</p>
          <p className="mt-1 text-slate-400">{invoice.clientEmail}</p>
        </div>
        <div className="rounded-2xl bg-slate-950/60 p-4">
          <p className="text-slate-400">Due date</p>
          <p className="mt-1 font-semibold">{invoice.dueDate}</p>
        </div>
        <div className="rounded-2xl bg-slate-950/60 p-4">
          <p className="text-slate-400">Description</p>
          <p className="mt-1 font-semibold">{invoice.description}</p>
        </div>
      </div>
    </section>
  );
}
