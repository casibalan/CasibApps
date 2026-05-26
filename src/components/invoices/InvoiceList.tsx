import Link from "next/link";
import { StatusPill } from "@/components/app-shell/StatusPill";
import type { Invoice } from "@/lib/types";

type InvoiceListProps = {
  invoices: Invoice[];
};

export function InvoiceList({ invoices }: InvoiceListProps) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent invoices</h2>
        <Link href="/invoices/new" className="text-sm font-semibold text-cyan-200">
          New
        </Link>
      </div>
      <div className="space-y-3">
        {invoices.map((invoice) => (
          <Link
            key={invoice.id}
            href={`/invoices/${invoice.id}`}
            className="block rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition hover:border-cyan-300/30 hover:bg-white/[0.08]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{invoice.clientName}</p>
                <p className="mt-1 text-sm text-slate-400">{invoice.description}</p>
              </div>
              <StatusPill status={invoice.status} />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-400">Due {invoice.dueDate}</span>
              <span className="font-semibold">{invoice.amount.toLocaleString()} USDC</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
