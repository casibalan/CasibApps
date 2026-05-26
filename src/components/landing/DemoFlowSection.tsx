import { flowSteps } from "@/lib/landing-data";

export function DemoFlowSection() {
  return (
    <section id="flow" className="pb-16 pt-8">
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 sm:p-8">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Demo flow
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Create invoice → Share payment link → Accept USDC → Settle on Arc
            </h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {flowSteps.map((step, index) => (
            <div
              key={step}
              className="flex min-h-28 flex-col justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4"
            >
              <span className="text-sm font-semibold text-cyan-200">
                0{index + 1}
              </span>
              <p className="text-lg font-semibold">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
