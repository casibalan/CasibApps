"use client";

import { useActionState } from "react";
import { createInvoice, type CreateInvoiceState } from "@/lib/actions";

const initialState: CreateInvoiceState = {};

export function InvoiceForm() {
  const [state, formAction, pending] = useActionState(createInvoice, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4">
        <button
          type="button"
          className="mb-4 w-full rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100"
        >
          Generate with AI
        </button>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">Client name</span>
            <input
              name="clientName"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
              placeholder="Northstar Creative"
            />
            {state.errors?.clientName && (
              <p className="mt-1 text-sm text-red-400">{state.errors.clientName}</p>
            )}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">Client email</span>
            <input
              name="clientEmail"
              type="email"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
              placeholder="ap@client.com"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">Amount in USDC</span>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
              placeholder="1250"
            />
            {state.errors?.amount && (
              <p className="mt-1 text-sm text-red-400">{state.errors.amount}</p>
            )}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">Description</span>
            <textarea
              name="description"
              className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
              placeholder="Design retainer and checkout setup"
            />
            {state.errors?.description && (
              <p className="mt-1 text-sm text-red-400">{state.errors.description}</p>
            )}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">Due date</span>
            <input
              name="dueDate"
              type="date"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
            />
          </label>
        </div>
      </div>

      {state.errors?.general && (
        <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {state.errors.general}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-cyan-300 px-5 py-4 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-200 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create Payment Link"}
      </button>
    </form>
  );
}
