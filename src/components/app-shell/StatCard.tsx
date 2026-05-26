import type { DashboardStat } from "@/lib/types";

type StatCardProps = {
  stat: DashboardStat;
};

export function StatCard({ stat }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {stat.label}
      </p>
      <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
      <p className="mt-1 text-xs text-slate-400">{stat.detail}</p>
    </article>
  );
}
