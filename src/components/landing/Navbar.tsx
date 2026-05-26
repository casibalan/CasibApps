export function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-white/10 pb-5">
      <a href="#" className="flex items-center gap-3" aria-label="CasibApps home">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-sm font-black text-slate-950">
          C
        </span>
        <span className="text-lg font-semibold tracking-tight">CasibApps</span>
      </a>
      <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
        <a className="transition hover:text-white" href="#features">
          Features
        </a>
        <a className="transition hover:text-white" href="#flow">
          Demo Flow
        </a>
        <a className="transition hover:text-white" href="#checkout">
          Checkout
        </a>
      </div>
      <a
        href="#checkout"
        className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200"
      >
        Launch MVP
      </a>
    </nav>
  );
}
