/**
 * Pure helper functions for the CasibApps payment flow.
 *
 * No Prisma, no server actions, no wallet code, no contract calls.
 * Uses viem utilities where appropriate.
 */

import { keccak256, toHex, isAddress, isHex, parseUnits } from "viem";

// ---------------------------------------------------------------------------
// Invoice ID
// ---------------------------------------------------------------------------

/**
 * Convert an invoice number/string (e.g. "INV-1011") into a bytes32 hash
 * compatible with CasibInvoiceEscrow.
 */
export function toInvoiceId(invoiceNumber: string): `0x${string}` {
  return keccak256(toHex(invoiceNumber));
}

// ---------------------------------------------------------------------------
// USDC amount
// ---------------------------------------------------------------------------

/** USDC uses 6 decimals on Arc Testnet. */
const USDC_DECIMALS = 6;

/**
 * Convert a human-readable USDC amount (e.g. "25.50") into base units (bigint).
 * Throws if the value is not a valid decimal string.
 */
export function toUsdcBaseUnits(displayAmount: string): bigint {
  return parseUnits(displayAmount, USDC_DECIMALS);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Returns true if the value is a valid EVM address (checksummed or lowercase).
 */
export function isValidAddress(value: string): boolean {
  return isAddress(value);
}

/**
 * Returns true if the value looks like a valid transaction hash (66-char hex).
 */
export function isValidTxHash(value: string): boolean {
  return isHex(value) && value.length === 66;
}
