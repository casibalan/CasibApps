import Link from "next/link";
import { InvoicePreview } from "./InvoicePreview";

export function HeroSection() {
  return (
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
          <Link
            href="/invoices/new"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-200"
          >
            Create Invoice
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white transition hover:border-white/35 hover:bg-white/10"
          >
            View Demo
          </Link>
        </div>
      </div>

      <InvoicePreview />
    </section>
  );
}
