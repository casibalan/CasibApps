const features = [
  {
    title: "AI Invoice Generator",
    description:
      "Turn merchant details, line items, and payment terms into clear USDC invoices in seconds.",
  },
  {
    title: "USDC Checkout",
    description:
      "Share a payment link that gives customers a focused checkout experience for USDC payments.",
  },
  {
    title: "Arc Settlement",
    description:
      "Route confirmed payments toward fast settlement on Arc with infrastructure designed for commerce.",
  },
  {
    title: "Merchant Dashboard",
    description:
      "Track invoice status, checkout activity, settlement progress, and business-ready payment records.",
  },
];

const flowSteps = [
  "Create invoice",
  "Share payment link",
  "Accept USDC",
  "Settle on Arc",
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_34%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
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

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-200">
              Circle-powered payments for merchants
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl">
              AI-powered USDC invoicing and checkout on Arc
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Create invoices, accept USDC payments, and settle transactions on Arc using Circle-powered infrastructure.
            </p>
            <div id="checkout" className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#flow"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-200"
              >
                Create Invoice
              </a>
              <a
                href="#features"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white transition hover:border-white/35 hover:bg-white/10"
              >
                View Demo
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="rounded-xl bg-slate-900/90 p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm text-slate-400">Invoice preview</p>
                  <h2 className="mt-1 text-xl font-semibold">Design retainer</h2>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-200">
                  Ready
                </span>
              </div>
              <div className="space-y-4 py-5">
                <div className="flex items-center justify-between rounded-lg bg-white/[0.04] p-4">
                  <span className="text-slate-300">Amount due</span>
                  <span className="text-2xl font-semibold">1,250 USDC</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 p-4">
                    <p className="text-sm text-slate-400">Checkout</p>
                    <p className="mt-2 font-semibold">Payment link active</p>
                  </div>
                  <div className="rounded-lg border border-white/10 p-4">
                    <p className="text-sm text-slate-400">Settlement</p>
                    <p className="mt-2 font-semibold">Arc pending</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100">
                AI drafts the invoice, the merchant approves it, and CasibApps prepares a USDC checkout link for the customer.
              </div>
            </div>
          </div>
        </section>

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
              <article
                key={feature.title}
                className="rounded-xl border border-white/10 bg-white/[0.05] p-5 transition hover:border-cyan-300/40 hover:bg-white/[0.08]"
              >
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

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
      </div>
    </main>
  );
}
