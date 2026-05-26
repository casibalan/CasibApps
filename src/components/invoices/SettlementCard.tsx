import { Badge } from "@/components/app-shell/Badge";

export function SettlementCard() {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">Settlement</p>
          <h2 className="mt-1 text-xl font-semibold">Arc settlement pending</h2>
        </div>
        <Badge tone="emerald">Arc</Badge>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">
        Demo state for settlement tracking after a customer completes USDC checkout through Circle-powered infrastructure.
      </p>
    </section>
  );
}
