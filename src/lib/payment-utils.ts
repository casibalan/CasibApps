import { keccak256, parseUnits, stringToBytes } from "viem";

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
