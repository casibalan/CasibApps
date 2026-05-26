# CasibApps Agent Instructions

## Project

CasibApps is an AI-powered USDC invoicing and checkout platform for small businesses and freelancers.

The product lets merchants create invoices, accept USDC payments, and settle transactions on Arc using Circle-powered infrastructure.

## Grant Alignment

Always keep the product aligned with:
- Circle Developer Platform
- Circle Wallets / Embedded Wallets
- USDC checkout
- Arc settlement
- Payments
- Agentic commerce
- Merchant invoicing
- Treasury/payment records

Do not position CasibApps as:
- a generic crypto wallet
- a DeFi trading app
- an exchange
- a gambling app
- a prediction market
- a lending protocol

## Tech Stack

Current stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL via Neon
- Circle Wallets / Embedded Wallets later
- Arc settlement later
- viem later for Arc RPC reads

Do not add new packages unless explicitly requested.

## File Structure Rules

Keep files modular and small.

Do not put large UI sections directly inside route files.

Route files under `src/app/**/page.tsx` should mostly compose components.

Preferred structure:

```txt
src/
  app/
  components/
    landing/
    app-shell/
    invoices/
    payments/
  lib/
    demo-data.ts
    types.ts
    prisma.ts
  generated/
    prisma/
prisma/
  schema.prisma