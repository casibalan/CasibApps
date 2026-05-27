import { Badge } from "@/components/app-shell/Badge";

export function TrustIndicators() {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
        <Badge tone="cyan">Circle Developer Platform</Badge>
        <p className="mt-3 text-sm text-slate-300">
          Payments powered by USDC on Arc Testnet with Circle infrastructure.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
        <Badge tone="emerald">Arc settlement</Badge>
        <p className="mt-3 text-sm text-slate-300">
          Transactions settle onchain via CasibInvoiceEscrow smart contract.
        </p>
      </div>
    </section>
  );
}
