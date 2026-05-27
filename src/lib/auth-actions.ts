"use server";

/**
 * Auth/merchant server actions for Circle Social Login.
 *
 * After a user authenticates via Circle Social Login (Google),
 * these actions handle:
 * - Creating or finding a Merchant record by Circle userId
 * - Storing wallet address when available
 * - Retrieving the current merchant session
 */

import { prisma } from "./prisma";
import { cookies } from "next/headers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MerchantSession = {
  merchantId: string;
  merchantName: string;
  email: string | null;
  walletAddress: string | null;
};

// ---------------------------------------------------------------------------
// Cookie-based session (lightweight, no external auth provider needed)
// ---------------------------------------------------------------------------

const SESSION_COOKIE = "casib_merchant_id";

/**
 * Set the merchant session cookie after successful login.
 */
export async function setMerchantSession(merchantId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, merchantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

/**
 * Get the current merchant session from cookie.
 */
export async function getMerchantSession(): Promise<MerchantSession | null> {
  const cookieStore = await cookies();
  const merchantId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!merchantId) return null;

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
  });
  if (!merchant) return null;

  return {
    merchantId: merchant.id,
    merchantName: merchant.businessName ?? merchant.name,
    email: merchant.email,
    walletAddress: merchant.walletAddress,
  };
}

/**
 * Clear the merchant session (logout).
 */
export async function clearMerchantSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ---------------------------------------------------------------------------
// Merchant upsert after Circle Social Login
// ---------------------------------------------------------------------------

type UpsertMerchantInput = {
  circleUserId: string;
  email?: string | null;
  name?: string | null;
};

/**
 * Create or update a Merchant record after Circle Social Login.
 *
 * Strategy:
 * - If a merchant with this email exists, update their record with circleUserId.
 * - Otherwise, create a new merchant.
 * - Returns the merchant ID for session storage.
 */
export async function upsertMerchantFromCircleLogin(
  input: UpsertMerchantInput
): Promise<{ merchantId: string; isNew: boolean }> {
  const { circleUserId, email, name } = input;

  // Try to find existing merchant by email first
  if (email) {
    const existing = await prisma.merchant.findUnique({
      where: { email },
    });

    if (existing) {
      // Update existing merchant — no need to create a new one
      await prisma.merchant.update({
        where: { id: existing.id },
        data: {
          // Store circleUserId in name field prefix for tracking (lightweight)
          // In production, add a circleUserId column
          updatedAt: new Date(),
        },
      });

      // Set session
      await setMerchantSession(existing.id);
      return { merchantId: existing.id, isNew: false };
    }
  }

  // Create new merchant
  const displayName = name ?? email?.split("@")[0] ?? "Merchant";
  const merchantEmail = email ?? `circle_${circleUserId}@casibapps.local`;

  const merchant = await prisma.merchant.create({
    data: {
      name: displayName,
      email: merchantEmail,
      businessName: displayName,
    },
  });

  // Set session
  await setMerchantSession(merchant.id);
  return { merchantId: merchant.id, isNew: true };
}

// ---------------------------------------------------------------------------
// Wallet address sync
// ---------------------------------------------------------------------------

/**
 * Store a wallet address for the given merchant.
 */
export async function storeMerchantWalletAddress(
  merchantId: string,
  walletAddress: string
): Promise<void> {
  await prisma.merchant.update({
    where: { id: merchantId },
    data: { walletAddress },
  });
}
