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
- viem for Arc Testnet contract calls

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
- Merchant model already has walletAddress
- Invoice model already has status, settlementStatus, arcTxHash, paidAt

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

### Frontend Contract Wiring

Done in latest main commits:
- viem dependency added
- Arc Testnet chain/config added in src/lib/arc-contract.ts
- CasibInvoiceEscrow ABI added
- ERC20 approve ABI added
- client-safe invoice hash and USDC amount helpers added in src/lib/payment-utils.ts
- server-side onchain verification added in src/lib/payments.ts
- confirmInvoicePayment server action added
- /pay/[id] now uses PayInvoiceButton instead of mock button
- payment button requests browser wallet account
- payment button switches to Arc Testnet chain ID 5042002 when needed
- payment button approves USDC to CasibInvoiceEscrow
- payment button calls payInvoice(bytes32 invoiceId, address merchant, uint256 amount)
- payment button captures tx hash and links to Arcscan
- server action verifies transaction receipt, contract isPaid(invoiceId), and matching InvoicePaid event
- verified payment updates invoice status to PAID
- verified payment updates settlementStatus to SETTLED
- verified payment saves arcTxHash and paidAt
- PaymentStatusCard now shows real invoice status, not demo status

## Current Status

The project is no longer just a mock UI.

Current real flow:
- Create invoice from web form
- Save invoice to Neon PostgreSQL
- View invoice detail
- Open payment page
- Foundry smart contract deployed and verified on Arc Testnet
- Real USDC approve + payInvoice tested on Arc Testnet via terminal
- Frontend payment page is now wired to real Arc Testnet contract calls through viem
- Database status update is gated behind server-side onchain verification

Still required before full browser E2E:
- Rotate Neon database password if not already done
- Update local .env with new DATABASE_URL
- Update Vercel DATABASE_URL env
- Add Vercel env vars:
  - DATABASE_URL
  - ARC_RPC_URL
  - NEXT_PUBLIC_ARC_RPC_URL
  - USDC_TOKEN_ADDRESS
  - NEXT_PUBLIC_USDC_TOKEN_ADDRESS
  - CASIB_INVOICE_ESCROW_ADDRESS
  - NEXT_PUBLIC_CASIB_INVOICE_ESCROW_ADDRESS
- Redeploy Vercel latest main commit
- Set Merchant.walletAddress in Neon for the merchant that owns invoices
- Run npm install so package-lock includes viem
- Run npm run build locally after npm install
- Test browser payment with an EIP-1193 wallet funded with Arc Testnet USDC

Not done yet:
- Circle Wallet SDK is not connected yet
- Browser E2E payment has not been confirmed after this patch
- Merchant wallet address must be populated in database before /pay/[id] can pay

## Next Recommended Steps

1. Rotate Neon database password.
2. Update local .env with new DATABASE_URL.
3. Update Vercel DATABASE_URL env.
4. Add these env vars locally and in Vercel:
   - DATABASE_URL
   - ARC_RPC_URL
   - NEXT_PUBLIC_ARC_RPC_URL
   - USDC_TOKEN_ADDRESS
   - NEXT_PUBLIC_USDC_TOKEN_ADDRESS
   - CASIB_INVOICE_ESCROW_ADDRESS
   - NEXT_PUBLIC_CASIB_INVOICE_ESCROW_ADDRESS
5. Run npm install to install viem and generate/update package-lock.
6. Set Merchant.walletAddress in Neon for alanilahi123@gmail.com.
7. Run npm run build.
8. Redeploy Vercel latest main commit.
9. Test /pay/[id] browser flow:
   - connect wallet
   - approve USDC
   - call payInvoice(bytes32 invoiceId, address merchant, uint256 amount)
   - confirm tx hash appears
   - confirm invoice status changes to PAID
   - confirm settlementStatus changes to SETTLED
   - confirm arcTxHash is saved
10. After viem contract flow works in browser, integrate Circle Wallet SDK as the wallet layer.

## Important Next Prompt For New Chat

Use this prompt in a new ChatGPT tab:

"Continue the CasibApps project from the repo casibalan/CasibApps. First read PROJECT_STATE.md and AGENTS.md. Do not restart planning. Current state: Next.js + Prisma + Neon invoice app works, Foundry contract CasibInvoiceEscrow is deployed and verified on Arc Testnet at 0x1c5e3AafC5D2Ce9C9BC0e5A5a7Bc665ed7Fd1CCC, real approve + payInvoice succeeded on Arc Testnet via terminal, and /pay/[id] has now been wired to viem for browser wallet approve + payInvoice with server-side receipt/event verification before updating invoice status. Next task: install viem locally/update lockfile, set Merchant.walletAddress, configure env vars, run build, redeploy Vercel, and test browser E2E. No fake payment flow, no mock, no placeholder paid button."