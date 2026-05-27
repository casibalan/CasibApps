"use server";

/**
 * Circle Wallet server actions.
 *
 * These server actions handle the server-side portion of the Circle
 * user-controlled wallet flow:
 * 1. Create a Circle user (maps to a CasibApps merchant)
 * 2. Acquire a user token + encryption key (session)
 * 3. Create a wallet initialization challenge
 * 4. Query wallet status and retrieve wallet address
 * 5. Store wallet address in Merchant.walletAddress
 *
 * The client-side Web SDK (@circle-fin/w3s-pw-web-sdk) handles PIN entry,
 * security questions, and key management. The server never sees the user's
 * PIN or private key.
 */

import { getCircleClient, getCircleEnvStatus, getCircleAppId } from "./circle";
import { prisma } from "./prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CircleActionResult<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
};

export type CircleSessionData = {
  userToken: string;
  encryptionKey: string;
  appId: string;
};

export type CircleWalletInfo = {
  walletId: string;
  address: string;
  blockchain: string;
  state: string;
};

// ---------------------------------------------------------------------------
// 1. Check Circle configuration status (safe to call from client)
// ---------------------------------------------------------------------------

export async function checkCircleConfig(): Promise<
  CircleActionResult<{ configured: boolean; missing: string[] }>
> {
  const status = getCircleEnvStatus();
  return {
    success: true,
    data: status,
  };
}

// ---------------------------------------------------------------------------
// 2. Create or get Circle user for a merchant
// ---------------------------------------------------------------------------

/**
 * Create a Circle user for the given merchant.
 * Uses the merchant's database ID as the external userId for Circle.
 * Idempotent — if user already exists, Circle returns success.
 */
export async function createCircleUser(
  merchantId: string
): Promise<CircleActionResult<{ userId: string }>> {
  const client = getCircleClient();
  if (!client) {
    return {
      success: false,
      error: "Circle SDK not configured. Required env vars: CIRCLE_API_KEY, CIRCLE_APP_ID.",
    };
  }

  // Verify merchant exists
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
  });
  if (!merchant) {
    return { success: false, error: "Merchant not found." };
  }

  try {
    // Circle uses an external userId — we use the merchant's cuid
    await client.createUser({ userId: merchantId });
    return { success: true, data: { userId: merchantId } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create Circle user.";
    // Circle returns 409 if user already exists — treat as success
    if (message.includes("already exist") || message.includes("409")) {
      return { success: true, data: { userId: merchantId } };
    }
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// 3. Acquire user session (userToken + encryptionKey)
// ---------------------------------------------------------------------------

/**
 * Get a user token and encryption key for the Circle Web SDK.
 * The client-side SDK needs these to initialize and execute challenges.
 */
export async function acquireCircleSession(
  merchantId: string
): Promise<CircleActionResult<CircleSessionData>> {
  const client = getCircleClient();
  if (!client) {
    return {
      success: false,
      error: "Circle SDK not configured. Required env vars: CIRCLE_API_KEY, CIRCLE_APP_ID.",
    };
  }

  const appId = getCircleAppId();
  if (!appId) {
    return { success: false, error: "CIRCLE_APP_ID not configured." };
  }

  try {
    const response = await client.createUserToken({ userId: merchantId });
    const userToken = response.data?.userToken;
    const encryptionKey = response.data?.encryptionKey;

    if (!userToken || !encryptionKey) {
      return {
        success: false,
        error: "Circle returned empty session credentials.",
      };
    }

    return {
      success: true,
      data: { userToken, encryptionKey, appId },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to acquire Circle session.";
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// 4. Initialize user wallet (create challenge)
// ---------------------------------------------------------------------------

/**
 * Create a challenge to initialize the user's wallet.
 * The returned challengeId must be executed by the client-side Web SDK
 * (user sets PIN, security questions, wallet is created).
 */
export async function initializeCircleWallet(
  merchantId: string
): Promise<CircleActionResult<{ challengeId: string }>> {
  const client = getCircleClient();
  if (!client) {
    return {
      success: false,
      error: "Circle SDK not configured.",
    };
  }

  try {
    // First ensure user token exists
    const sessionResult = await acquireCircleSession(merchantId);
    if (!sessionResult.success || !sessionResult.data) {
      return {
        success: false,
        error: sessionResult.error ?? "Could not acquire session.",
      };
    }

    // Create the wallet initialization challenge
    // This creates a PIN-based wallet. Blockchain is configured in Circle Console.
    const response = await client.createUserPinWithWallets({
      userId: merchantId,
      blockchains: ["MATIC-AMOY"], // Circle testnet default; Arc when supported
    });

    const challengeId = response.data?.challengeId;
    if (!challengeId) {
      return {
        success: false,
        error: "Circle returned empty challengeId.",
      };
    }

    return { success: true, data: { challengeId } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create wallet challenge.";
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// 5. Query wallet status and sync address to database
// ---------------------------------------------------------------------------

/**
 * List wallets for a Circle user and sync the first wallet address
 * to the merchant's walletAddress field in the database.
 */
export async function syncCircleWalletAddress(
  merchantId: string
): Promise<CircleActionResult<CircleWalletInfo | null>> {
  const client = getCircleClient();
  if (!client) {
    return {
      success: false,
      error: "Circle SDK not configured.",
    };
  }

  try {
    // First get user token for the API call
    const tokenResponse = await client.createUserToken({ userId: merchantId });
    const userToken = tokenResponse.data?.userToken;
    if (!userToken) {
      return { success: false, error: "Could not get user token." };
    }

    // List wallets for this user
    const walletsResponse = await client.listWallets({ userId: merchantId });
    const wallets = walletsResponse.data?.wallets;

    if (!wallets || wallets.length === 0) {
      return { success: true, data: null }; // No wallets yet
    }

    // Use the first wallet's address
    const wallet = wallets[0];
    const walletInfo: CircleWalletInfo = {
      walletId: wallet.id ?? "",
      address: wallet.address ?? "",
      blockchain: wallet.blockchain ?? "",
      state: wallet.state ?? "",
    };

    // If we have a valid address, store it in the merchant record
    if (walletInfo.address && walletInfo.state === "LIVE") {
      await prisma.merchant.update({
        where: { id: merchantId },
        data: { walletAddress: walletInfo.address },
      });
    }

    return { success: true, data: walletInfo };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to query wallets.";
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// 6. Get merchant wallet onboarding status
// ---------------------------------------------------------------------------

export type WalletOnboardingStatus = {
  merchantId: string;
  merchantName: string;
  walletAddress: string | null;
  circleConfigured: boolean;
  circleConfigMissing: string[];
};

/**
 * Get the full wallet onboarding status for a merchant.
 * Used by the dashboard to show wallet setup progress.
 */
export async function getWalletOnboardingStatus(
  merchantId: string
): Promise<CircleActionResult<WalletOnboardingStatus>> {
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
  });

  if (!merchant) {
    return { success: false, error: "Merchant not found." };
  }

  const envStatus = getCircleEnvStatus();

  return {
    success: true,
    data: {
      merchantId: merchant.id,
      merchantName: merchant.businessName ?? merchant.name,
      walletAddress: merchant.walletAddress,
      circleConfigured: envStatus.configured,
      circleConfigMissing: envStatus.missing,
    },
  };
}
