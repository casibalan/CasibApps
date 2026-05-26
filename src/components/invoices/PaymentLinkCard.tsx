import Link from "next/link";
import type { Invoice } from "@/lib/types";

type PaymentLinkCardProps = {
  invoice: Invoice;
};

export function PaymentLinkCard({ invoice }: PaymentLinkCardProps) {
  return (
    <section className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
      <p className="text-sm font-semibold text-cyan-100">Payment link preview</p>
      <p className="mt-3 break-all rounded-2xl bg-slate-950/70 p-4 text-sm text-slate-300">
        casibapps.demo{invoice.paymentLink}
      </p>
      <Link
        href={invoice.paymentLink}
        className="mt-4 inline-flex w-full justify-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
      >
        Open Checkout
      </Link>
    </section>
  );
}
