type BadgeProps = {
  children: React.ReactNode;
  tone?: "cyan" | "emerald" | "slate";
};

const toneClasses = {
  cyan: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
  emerald: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  slate: "border-white/10 bg-white/[0.06] text-slate-200",
};

export function Badge({ children, tone = "slate" }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
