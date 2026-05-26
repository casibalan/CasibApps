import type { LandingFeature } from "@/lib/landing-data";

type FeatureCardProps = {
  feature: LandingFeature;
};

export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.05] p-5 transition hover:border-cyan-300/40 hover:bg-white/[0.08]">
      <h3 className="text-lg font-semibold">{feature.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        {feature.description}
      </p>
    </article>
  );
}
