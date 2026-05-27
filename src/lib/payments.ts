import { createPublicClient, decodeEventLog, getContract, http, keccak256, parseUnits, stringToBytes } from "viem";
import { prisma } from "./prisma";
import {
  arcTestnet,
  casibInvoiceEscrowAbi,
  CASIB_INVOICE_ESCROW_ADDRESS,
} from "./arc-contract";

const ADDRESS_REGEX = new RegExp("^0x[a-fA-F0-9]{40}$");
const TX_HASH_REGEX = new RegExp("^0x[a-fA-F0-9]{64}$");

export function getInvoiceBytes32(invoiceNumber: string) {
  return keccak256(stringToBytes(invoiceNumber));
}

export function getUsdcBaseUnits(amount: number) {
  return parseUnits(amount.toFixed(6), 6);
}

export function isAddressLike(value: string | null | undefined): value is `0x${string}` {
  return Boolean(value && ADDRESS_REGEX.test(value));
}

export function isTxHashLike(value: string): value is `0x${string}` {
  return TX_HASH_REGEX.test(value);
}

export const arcPublicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(),
});

export async function verifyInvoicePaidOnchain(params: {
  invoiceNumber: string;
  merchantWalletAddress: `0x${string}`;
  amount: number;
  txHash: `0x${string}`;
}) {
  const invoiceId = getInvoiceBytes32(params.invoiceNumber);
  const expectedAmount = getUsdcBaseUnits(params.amount);
  const receipt = await arcPublicClient.getTransactionReceipt({ hash: params.txHash });

  if (receipt.status !== "success") {
    return { ok: false, reason: "Transaction did not succeed on Arc." };
  }

  const contract = getContract({
    address: CASIB_INVOICE_ESCROW_ADDRESS,
    abi: casibInvoiceEscrowAbi,
    client: arcPublicClient,
  });

  const onchainPaid = await contract.read.isPaid([invoiceId]);
  if (!onchainPaid) {
    return { ok: false, reason: "Contract does not mark this invoice as paid." };
  }

  const matchingEvent = receipt.logs.some((log) => {
    if (log.address.toLowerCase() !== CASIB_INVOICE_ESCROW_ADDRESS.toLowerCase()) {
      return false;
    }

    try {
      const decoded = decodeEventLog({
        abi: casibInvoiceEscrowAbi,
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName !== "InvoicePaid") return false;

      return (
        decoded.args.invoiceId.toLowerCase() === invoiceId.toLowerCase() &&
        decoded.args.merchant.toLowerCase() === params.merchantWalletAddress.toLowerCase() &&
        decoded.args.amount === expectedAmount
      );
    } catch {
      return false;
    }
  });

  if (!matchingEvent) {
    return { ok: false, reason: "InvoicePaid event does not match this invoice." };
  }

  return { ok: true, reason: null };
}

export async function markInvoicePaid(params: {
  invoiceNumber: string;
  txHash: `0x${string}`;
}) {
  return prisma.invoice.update({
    where: { invoiceNumber: params.invoiceNumber },
    data: {
      status: "PAID",
      settlementStatus: "SETTLED",
      arcTxHash: params.txHash,
      paidAt: new Date(),
    },
  });
}
