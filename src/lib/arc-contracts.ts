/**
 * Arc Testnet contract configuration for CasibApps.
 *
 * Contains chain config, token/contract addresses, and minimal ABIs
 * needed for the USDC approve + payInvoice flow.
 */

// ---------------------------------------------------------------------------
// Chain
// ---------------------------------------------------------------------------

export const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  rpcUrl: "https://rpc.testnet.arc.network",
} as const;

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

export const USDC_ADDRESS =
  "0x3600000000000000000000000000000000000000" as const;

export const CASIB_INVOICE_ESCROW_ADDRESS =
  "0x1c5e3AafC5D2Ce9C9BC0e5A5a7Bc665ed7Fd1CCC" as const;

// ---------------------------------------------------------------------------
// ABIs (minimal, only the functions/events we use)
// ---------------------------------------------------------------------------

/** ERC-20 approve – needed before payInvoice */
export const erc20ApproveAbi = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

/** CasibInvoiceEscrow – payInvoice + isPaid + InvoicePaid event */
export const casibInvoiceEscrowAbi = [
  {
    type: "function",
    name: "payInvoice",
    inputs: [
      { name: "invoiceId", type: "bytes32" },
      { name: "merchant", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isPaid",
    inputs: [{ name: "invoiceId", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "InvoicePaid",
    inputs: [
      { name: "invoiceId", type: "bytes32", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "merchant", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;
