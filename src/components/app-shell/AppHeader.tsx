import Link from "next/link";

type AppHeaderProps = {
  title: string;
  eyebrow?: string;
  href?: string;
};

export function AppHeader({ title, eyebrow, href = "/dashboard" }: AppHeaderProps) {
  return (
    <header className="mb-5 flex items-center justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      <Link
        href={href}
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-black text-cyan-200"
        aria-label="Go to dashboard"
      >
        C
      </Link>
    </header>
  );
}
