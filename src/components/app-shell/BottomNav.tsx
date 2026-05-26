import Link from "next/link";

const navItems = [
  { label: "Home", href: "/dashboard", mark: "H" },
  { label: "Invoice", href: "/invoices/new", mark: "+" },
  { label: "Demo", href: "/pay/inv-1008", mark: "P" },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-4 z-20 mx-auto w-[min(24rem,calc(100%-2rem))] rounded-full border border-white/10 bg-slate-900/90 p-2 shadow-2xl shadow-black/40 backdrop-blur md:w-[24rem]">
      <div className="grid grid-cols-3 gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-center gap-2 rounded-full px-3 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300/15 text-cyan-100">
              {item.mark}
            </span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
