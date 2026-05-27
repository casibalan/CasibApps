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

Completed (this session):
- Frontend /pay/[id] is now connected to the CasibInvoiceEscrow contract via viem.
- Payment flow: approve USDC → payInvoice → wait for receipt → update DB (status=PAID, arcTxHash saved).
- Merchant wallet address is read from database (invoice → merchant → walletAddress).
- If merchant.walletAddress is null, payment page shows "Merchant wallet not configured" blocked state.
- If invoice is already paid, payment page shows "Invoice paid" confirmation.
- No fake/mock payment. Real contract interaction only.

Not done yet:
- Circle Wallet SDK is not connected (planned as future wallet layer).
- Vercel production env must be completed.
- Server-side onchain verification (read isPaid from contract) not yet added — currently trusts client tx hash.
- Multi-merchant auth/onboarding not yet implemented (plan below).

## Security

Never commit secrets. Never paste private keys. Never commit .env.

The Neon database URL was exposed in chat before. Rotate the Neon password before continuing serious deployment, then update local env and Vercel env.

## Next Exact Workflow

1. Rotate Neon password and update DATABASE_URL locally and in Vercel.
2. Add Vercel env vars: DATABASE_URL, ARC_RPC_URL, USDC_TOKEN_ADDRESS, CASIB_INVOICE_ESCROW_ADDRESS.
3. Set merchant walletAddress in the database for the seed merchant (via Prisma Studio or a migration script).
4. Test the full /pay/[id] flow on Arc Testnet with MetaMask.
5. Add server-side onchain verification: after confirmPayment, read isPaid(invoiceId) from the contract to verify before marking PAID.
6. Integrate Circle Wallet SDK as the wallet/onboarding layer.

## Multi-Merchant Onboarding Plan (Milestone 3)

This section describes how the app will scale from one seeded merchant to many merchants.

### Merchant Signup Flow

1. New merchant signs up via an auth provider (e.g. NextAuth / Clerk / Circle embedded auth).
2. On signup, a new `Merchant` record is created in the database with their email and business name.
3. During onboarding, the merchant connects or creates a wallet:
   - **Circle Wallet SDK** creates/manages the merchant's wallet.
   - The resulting wallet address is stored in `Merchant.walletAddress`.
4. Until `walletAddress` is set, the merchant cannot receive payments (enforced by the /pay/[id] blocked state).

### Invoice Creation

- Invoice creation (`createInvoice` action) uses the logged-in merchant's ID instead of the hardcoded `MERCHANT_EMAIL`.
- Each invoice's `merchantId` links to the authenticated merchant.
- The `createInvoice` action will receive `merchantId` from the session/auth context.

### Payment Resolution

- `/pay/[id]` resolves the merchant wallet from: `invoice → merchant → walletAddress`.
- This is already implemented. No global wallet address is used.
- Each merchant's invoices route payments to that merchant's wallet.

### Where Circle Wallet SDK Fits

- **Merchant onboarding**: Circle Embedded Wallets create/manage merchant wallets. The SDK handles key management so merchants don't need to manage private keys.
- **Customer payment** (future): Circle Wallet SDK can also provide the payer wallet, replacing the current MetaMask/injected wallet requirement.
- **Installation**: Circle SDK should be added only when the auth layer is ready and the team is prepared to integrate the full Circle Developer Platform flow.

### Auth Architecture Decision Needed

Before implementing multi-merchant:
- Choose auth provider (NextAuth, Clerk, or Circle's own auth).
- Decide if merchant wallet creation happens at signup or as a separate onboarding step.
- Determine if Circle Programmable Wallets or Circle Embedded Wallets are the target product.

## Prompt For New Chat

Lanjutkan CasibApps dari repo casibalan/CasibApps. Baca PROJECT_STATE.md dan AGENTS.md dulu. Jangan mulai ulang. Jangan brainstorming ulang. Jangan buat code di luar workflow. Kita sudah punya Next.js + Prisma + Neon invoice app, Foundry contract CasibInvoiceEscrow deployed and verified on Arc Testnet, dan real approve + payInvoice sudah sukses. Frontend /pay/[id] sekarang sudah connected ke contract via viem. Lanjutkan dari Next Exact Workflow di PROJECT_STATE.md. Tidak boleh mock/fake/demo paid flow.
