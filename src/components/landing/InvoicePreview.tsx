export function InvoicePreview() {
  return (
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
  );
}
