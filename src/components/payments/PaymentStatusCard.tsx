import { StatusPill } from "@/components/app-shell/StatusPill";

export function PaymentStatusCard() {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">Demo status</p>
          <h2 className="mt-1 text-xl font-semibold">Waiting for payment</h2>
        </div>
        <StatusPill status="waiting" />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">
        No Circle API call is made yet. This screen is ready for a future USDC checkout integration.
      </p>
    </section>
  );
}
