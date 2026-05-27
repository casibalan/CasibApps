import { defineChain } from "viem";

export const ARC_TESTNET_CHAIN_ID = 5042002;
export const ARC_TESTNET_RPC_URL =
  process.env.NEXT_PUBLIC_ARC_RPC_URL ??
  process.env.ARC_RPC_URL ??
  "https://rpc.testnet.arc.network";

export const USDC_TOKEN_ADDRESS =
  (process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS ??
    process.env.USDC_TOKEN_ADDRESS ??
    "0x3600000000000000000000000000000000000000") as `0x${string}`;

export const CASIB_INVOICE_ESCROW_ADDRESS =
  (process.env.NEXT_PUBLIC_CASIB_INVOICE_ESCROW_ADDRESS ??
    process.env.CASIB_INVOICE_ESCROW_ADDRESS ??
    "0x1c5e3AafC5D2Ce9C9BC0e5A5a7Bc665ed7Fd1CCC") as `0x${string}`;

export const arcTestnet = defineChain({
  id: ARC_TESTNET_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Arc Testnet Gas Token",
    symbol: "ARC",
  },
  rpcUrls: {
    default: {
      http: [ARC_TESTNET_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Arcscan",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
});

export const casibInvoiceEscrowAbi = [
  {
    type: "function",
    name: "payInvoice",
    stateMutability: "nonpayable",
    inputs: [
      { name: "invoiceId", type: "bytes32" },
      { name: "merchant", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "isPaid",
    stateMutability: "view",
    inputs: [{ name: "invoiceId", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
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

export const erc20ApproveAbi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export function getArcscanTxUrl(txHash: string) {
  return `https://testnet.arcscan.app/tx/${txHash}`;
}
