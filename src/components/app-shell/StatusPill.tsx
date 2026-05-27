import type { InvoiceStatus } from "@/lib/types";

type StatusPillProps = {
  status: InvoiceStatus | "waiting";
};

const statusClasses: Record<InvoiceStatus | "waiting", string> = {
  paid: "bg-emerald-300/15 text-emerald-100 ring-emerald-300/20",
  pending: "bg-amber-300/15 text-amber-100 ring-amber-300/20",
  draft: "bg-slate-300/15 text-slate-100 ring-slate-300/20",
  expired: "bg-rose-300/15 text-rose-100 ring-rose-300/20",
  cancelled: "bg-slate-500/15 text-slate-200 ring-slate-400/20",
  waiting: "bg-cyan-300/15 text-cyan-100 ring-cyan-300/20",
};

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${statusClasses[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}
