# CasibApps Project State

Last updated: 2026-05-27

## Current Rule

Do not restart planning. Do not create unrelated code. Do not provide detached code snippets as the main workflow. Work from the existing repository state and continue the next step only.

No mock payment flow. No fake paid button. No dummy onchain status. The project must continue toward real Arc Testnet + Circle Wallet payment flow.

## Project

CasibApps is an AI-powered USDC invoicing and checkout app for small businesses and freelancers.

Grant direction:
- Arc-native payment and settlement
- Circle Developer Platform aligned
- USDC checkout
- merchant invoicing
- agentic commerce
- real smart contract payment on Arc Testnet

Do not position as a generic wallet, exchange, trading app, prediction market, gambling app, or demo-only payment app.

## Repo

GitHub: casibalan/CasibApps
Branch: main

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma 7
- Neon PostgreSQL
- Foundry
- Solidity
- Arc Testnet
- viem for contract calls

## Completed

App:
- Landing page done.
- Mobile-first app shell done.
- Routes exist: /, /dashboard, /invoices/new, /invoices/[id], /pay/[id].

Database:
- Prisma + Neon configured.
- Merchant and Invoice models exist.
- Seed data exists.
- /dashboard reads from database.
- /invoices/[id] reads from database.
- /pay/[id] reads from database.
- /invoices/new creates real invoices in Neon.
- Created invoice INV-1011 was tested.

Vercel:
- project exists: casibapps.
- database pages were marked dynamic: /dashboard, /invoices/[id], /pay/[id].
- prior deploy failed because DATABASE_URL was missing; set env vars and redeploy latest main.

Smart contract:
- Foundry contract CasibInvoiceEscrow exists.
- Contract is deployed to Arc Testnet.
- Contract is verified on Arcscan / Blockscout.
- Real terminal approve + payInvoice succeeded on Arc Testnet.

Contract details:
- CasibInvoiceEscrow: 0x1c5e3AafC5D2Ce9C9BC0e5A5a7Bc665ed7Fd1CCC
- Arc Testnet chain id: 5042002
- Arc Testnet RPC: https://rpc.testnet.arc.network
- Arc Testnet USDC: 0x3600000000000000000000000000000000000000
- Verified URL: https://testnet.arcscan.app/address/0x1c5e3aafc5d2ce9c9bc0e5a5a7bc665ed7fd1ccc

Onchain proof:
- Deploy tx: 0x20165024d770aa15618fe54b82e336145a28dc39ba8f8faf9679cb3f8e0f66ba
- Approve tx: 0x1790c3923deda3573909f6fe087c7566d33ba8d0f682ad5c8799e73fcd8998ac
- payInvoice tx: 0xccc192cbed55b828c21de64bec0d6630b1af1e88a7446680e4fd7a7406532a80

Terminal tests completed:
- isPaid(dummy) returned false.
- usdc() returned the Arc Testnet USDC token address.
- USDC approve succeeded.
- payInvoice succeeded.
- InvoicePaid event emitted.
- isPaid(invoiceId) returned true.

## Current Status

The project is no longer only a UI prototype.

Current real flow:
- Create invoice from web form.
- Save invoice to Neon PostgreSQL.
- View invoice detail.
- Open payment page.
- Foundry smart contract deployed and verified on Arc Testnet.
- Real USDC approve + payInvoice tested on Arc Testnet via terminal.

Not done yet:
- Frontend is not connected to the contract yet.
- Circle Wallet SDK is not connected.
- Merchant wallet address is not wired into payment flow yet.
- Invoice status is not auto-updated from onchain tx yet.
- Vercel production env must be completed.

## Security

Never commit secrets. Never paste private keys. Never commit .env.

The Neon database URL was exposed in chat before. Rotate the Neon password before continuing serious deployment, then update local env and Vercel env.

## Next Exact Workflow

1. Rotate Neon password and update DATABASE_URL locally and in Vercel.
2. Add Vercel env vars: DATABASE_URL, ARC_RPC_URL, USDC_TOKEN_ADDRESS, CASIB_INVOICE_ESCROW_ADDRESS.
3. Add merchant wallet address to the Merchant record.
4. Install viem.
5. Add contract ABI/config.
6. Connect /pay/[id] to real contract flow:
   - approve USDC
   - call payInvoice(bytes32 invoiceId, address merchant, uint256 amount)
   - capture tx hash
   - update invoice status to PAID
   - update settlementStatus to SETTLED
   - save arcTxHash
7. After viem flow works, integrate Circle Wallet SDK as the wallet layer.

## Prompt For New Chat

Lanjutkan CasibApps dari repo casibalan/CasibApps. Baca PROJECT_STATE.md dan AGENTS.md dulu. Jangan mulai ulang. Jangan brainstorming ulang. Jangan buat code di luar workflow. Kita sudah punya Next.js + Prisma + Neon invoice app, Foundry contract CasibInvoiceEscrow deployed and verified on Arc Testnet, dan real approve + payInvoice sudah sukses. Lanjutkan dari Next Exact Workflow di PROJECT_STATE.md. Tidak boleh mock/fake/demo paid flow.
