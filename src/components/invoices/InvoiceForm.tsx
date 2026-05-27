"use client";

import { useActionState } from "react";
import { createInvoice, type CreateInvoiceState } from "@/lib/actions";

const initialState: CreateInvoiceState = {};

type InvoiceFormProps = {
  merchantId: string;
};

export function InvoiceForm({ merchantId }: InvoiceFormProps) {
  const [state, formAction, pending] = useActionState(createInvoice, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {/* Pass merchantId as hidden field */}
      <input type="hidden" name="merchantId" value={merchantId} />

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Client name</span>
            <input
              name="clientName"
              className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:ring-1 focus:ring-cyan-300/20"
              placeholder="Northstar Creative"
            />
            {state.errors?.clientName && (
              <p className="mt-1 text-xs text-red-400">{state.errors.clientName}</p>
            )}
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Client email</span>
            <input
              name="clientEmail"
              type="email"
              className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:ring-1 focus:ring-cyan-300/20"
              placeholder="ap@client.com"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Amount (USDC)</span>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:ring-1 focus:ring-cyan-300/20"
              placeholder="1250.00"
            />
            {state.errors?.amount && (
              <p className="mt-1 text-xs text-red-400">{state.errors.amount}</p>
            )}
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Description</span>
            <textarea
              name="description"
              className="mt-1.5 min-h-24 w-full rounded-xl border border-white/[0.08] bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:ring-1 focus:ring-cyan-300/20 resize-none"
              placeholder="Design retainer and checkout setup"
            />
            {state.errors?.description && (
              <p className="mt-1 text-xs text-red-400">{state.errors.description}</p>
            )}
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Due date</span>
            <input
              name="dueDate"
              type="date"
              className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:ring-1 focus:ring-cyan-300/20"
            />
          </label>
        </div>
      </div>

      {state.errors?.general && (
        <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs text-red-300">
          {state.errors.general}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create Payment Link"}
      </button>
    </form>
  );
}
