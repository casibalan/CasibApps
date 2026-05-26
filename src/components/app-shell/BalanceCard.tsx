import Link from "next/link";
import { usdcBalance } from "@/lib/demo-data";
import { Badge } from "./Badge";

export function BalanceCard() {
  return (
    <section className="rounded-[1.5rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/20 via-white/[0.07] to-emerald-300/10 p-5 shadow-xl shadow-cyan-950/20">
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge tone="cyan">Circle-powered</Badge>
        <Badge tone="emerald">Arc settlement</Badge>
      </div>
      <p className="text-sm text-slate-300">{usdcBalance.label}</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <div>
          <p className="text-4xl font-semibold tracking-tight">{usdcBalance.amount}</p>
          <p className="mt-1 text-sm font-semibold text-cyan-100">USDC</p>
        </div>
        <Link
          href="/invoices/new"
          className="rounded-full bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
        >
          Create Invoice
        </Link>
      </div>
    </section>
  );
}
