import { features } from "@/lib/landing-data";
import { FeatureCard } from "./FeatureCard";

export function FeaturesSection() {
  return (
    <section id="features" className="py-12">
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
            MVP modules
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Built for everyday merchant payments
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-300">
          A focused payment workflow for freelancers and small businesses that need invoices, checkout, and settlement without operational clutter.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>
    </section>
  );
}
