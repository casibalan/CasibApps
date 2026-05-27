# CasibApps Project State

Last updated: 2026-05-27

## Project Identity

CasibApps is an AI-powered USDC invoicing and checkout app for small businesses and freelancers.

Grant positioning:
- Arc-native payment and settlement app
- Circle Developer Platform aligned
- USDC checkout
- Merchant invoicing
- Agentic commerce
- Real smart contract payment flow on Arc Testnet

Do not position this project as:
- generic wallet
- exchange
- DeFi trading app
- prediction market
- gambling app
- fake/demo-only payment app

## Repository

GitHub:
https://github.com/casibalan/CasibApps

Main branch is active.

## Current Tech Stack

Frontend:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Mobile-first smartphone Web3 fintech UI

Database:
- Neon PostgreSQL
- Prisma 7.x
- Prisma adapter-pg
- Seed data exists

Smart contract:
- Foundry
- Solidity ^0.8.24
- Arc Testnet

Deployment:
- Vercel project: casibapps
- Vercel team: Alan Ilahi's projects
- DATABASE_URL must be configured in Vercel env

## Important Local Rules

Use local repo-specific Git config only. Do not set global Git identity for this project.

Local Git identity:
- user.name: casibalan
- user.email: alanilahi123@gmail.com

Secrets stay in .env only.
Never commit .env.
Never paste private keys or database URLs into chat.

Important: Neon DATABASE_URL was accidentally exposed in chat logs earlier. Rotate Neon database password and update local .env + Vercel DATABASE_URL.

## Completed Work

### App Foundation

Done:
- Next.js app initialized
- Landing page created
- Landing page refactored into modular components
- Mobile-first MVP app shell created

Routes:
- /
- /dashboard
- /invoices/new
- /invoices/[id]
- /pay/[id]

### Database

Done:
- Prisma installed
- Neon PostgreSQL connected
- Prisma schema created
- Migration exists
- Prisma Studio confirmed tables:
  - Merchant
  - Invoice
  - _prisma_migrations
- Seed script added
- Seed data inserted

Seeded merchant:
- name: Casib Owner
- email: alanilahi123@gmail.com
- businessName: Casib Studio

Seeded invoices:
- INV-1008
- INV-1009
- INV-1010

### App Database Flow

Done:
- /dashboard reads from database
- /invoices/[id] reads from database
- /pay/[id] reads from database
- invoice lookup supports invoiceNumber, lowercase slug, and paymentLinkSlug
- /invoices/new creates real invoices in Neon
- create invoice flow tested successfully
- Example created invoice:
  - INV-1011
  - /invoices/INV-1011 works
  - /pay/pay-inv-1011 works

### Vercel

Done:
- Vercel project exists: casibapps
- Database pages were changed to dynamic rendering:
  - /dashboard
  - /invoices/[id]
  - /pay/[id]

Important:
- Vercel deploy previously failed because DATABASE_URL was missing and Prisma tried 127.0.0.1:5432.
- Fix required:
  - Set DATABASE_URL in Vercel Environment Variables
  - Redeploy latest commit

### Smart Contract

Done:
- Foundry installed
- Foundry contract foundation added
- Contract deployed to Arc Testnet
- Contract verified on Arcscan / Blockscout
- Real onchain function test passed

Contract:
CasibInvoiceEscrow

Contract address:
0x1c5e3AafC5D2Ce9C9BC0e5A5a7Bc665ed7Fd1CCC

Network:
Arc Testnet

Chain ID:
5042002

RPC:
https://rpc.testnet.arc.network

USDC token address:
0x3600000000000000000000000000000000000000

Deploy tx:
0x20165024d770aa15618fe54b82e336145a28dc39ba8f8faf9679cb3f8e0f66ba

Approve tx:
0x1790c3923deda3573909f6fe087c7566d33ba8d0f682ad5c8799e73fcd8998ac

payInvoice tx:
0xccc192cbed55b828c21de64bec0d6630b1af1e88a7446680e4fd7a7406532a80

Verified contract URL:
https://testnet.arcscan.app/address/0x1c5e3aafc5d2ce9c9bc0e5a5a7bc665ed7fd1ccc

Onchain terminal tests completed:
- isPaid(dummy) returned false
- usdc() returned 0x3600000000000000000000000000000000000000
- USDC approve succeeded
- payInvoice succeeded
- InvoicePaid event emitted
- isPaid(invoiceId) returned true

## Current Status

The project is no longer just a mock UI.

Current real flow:
- Create invoice from web form
- Save invoice to Neon PostgreSQL
- View invoice detail
- Open payment page
- Foundry smart contract deployed and verified on Arc Testnet
- Real USDC approve + payInvoice tested on Arc Testnet via terminal

Not done yet:
- Frontend is not connected to the contract yet
- Circle Wallet SDK is not connected yet
- Merchant wallet address is not wired into the payment flow yet
- Invoice status is not auto-updated from onchain tx yet
- Vercel production deploy still needs correct env and redeploy

## Next Recommended Steps

1. Rotate Neon database password.
2. Update local .env with new DATABASE_URL.
3. Update Vercel DATABASE_URL env.
4. Add these Vercel env vars:
   - DATABASE_URL
   - ARC_RPC_URL
   - USDC_TOKEN_ADDRESS
   - CASIB_INVOICE_ESCROW_ADDRESS
5. Redeploy Vercel latest main commit.
6. Add merchant wallet address to database.
7. Install viem.
8. Add contract ABI/config.
9. Connect /pay/[id] page to real contract:
   - approve USDC
   - call payInvoice(bytes32 invoiceId, address merchant, uint256 amount)
   - capture tx hash
   - update invoice status to PAID
   - update settlementStatus to SETTLED
   - save arcTxHash
10. After viem contract flow works, integrate Circle Wallet SDK as the wallet layer.

## Important Next Prompt For New Chat

Use this prompt in a new ChatGPT tab:

"Continue the CasibApps project from the repo casibalan/CasibApps. First read PROJECT_STATE.md and AGENTS.md. Do not restart planning. Current state: Next.js + Prisma + Neon invoice app works, Foundry contract CasibInvoiceEscrow is deployed and verified on Arc Testnet at 0x1c5e3AafC5D2Ce9C9BC0e5A5a7Bc665ed7Fd1CCC, and real approve + payInvoice succeeded on Arc Testnet. Next task: rotate/update env if needed, then connect the /pay/[id] page to the real contract using viem, no fake payment flow, no mock, no placeholder paid button."

