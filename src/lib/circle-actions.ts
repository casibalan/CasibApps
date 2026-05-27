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
// Internal: parse Circle error code from a thrown error
// ---------------------------------------------------------------------------

/**
 * Best-effort extraction of the numeric Circle error code from a thrown error.
 * The Circle Node SDK uses axios under the hood, so the code can sit on
 * `error.code`, `error.response.data.code`, or be embedded in `error.message`.
 */
function getCircleErrorCode(err: unknown): number | null {
  if (!err || typeof err !== "object") return null;

  const e = err as Record<string, unknown>;

  if (typeof e.code === "number") return e.code;
  if (typeof e.code === "string") {
    const parsed = Number.parseInt(e.code, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }

  const response = e.response as Record<string, unknown> | undefined;
  const responseData = response?.data as Record<string, unknown> | undefined;
  if (typeof responseData?.code === "number") return responseData.code;
  if (typeof responseData?.code === "string") {
    const parsed = Number.parseInt(responseData.code, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }

  // Last resort: scan the error message for "code: NNNNNN" or "(NNNNNN)"
  const message = typeof e.message === "string" ? e.message : "";
  const match = message.match(/\b(15\d{4})\b/);
  if (match) {
    return Number.parseInt(match[1], 10);
  }

  return null;
}

/**
 * True when the error indicates the Circle user already exists for this userId.
 */
function isCircleUserAlreadyExistsError(err: unknown): boolean {
  if (getCircleErrorCode(err) === 155101) return true;
  const message = err instanceof Error ? err.message.toLowerCase() : "";
  return (
    message.includes("already exist") ||
    message.includes("already created") ||
    message.includes("existing user")
  );
}

/**
 * True when the error indicates the Circle user has already been initialized
 * (PIN + wallets already created).
 */
function isCircleUserAlreadyInitializedError(err: unknown): boolean {
  if (getCircleErrorCode(err) === 155106) return true;
  const message = err instanceof Error ? err.message.toLowerCase() : "";
  return message.includes("already initialized");
}

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
    // Circle returns code 155101 / message "Existing user already created"
    // when the userId is already mapped to a Circle user. That's fine — the
    // user exists, which is exactly what we want for the next step.
    if (isCircleUserAlreadyExistsError(err)) {
      return { success: true, data: { userId: merchantId } };
    }
    const message = err instanceof Error ? err.message : "Failed to create Circle user.";
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
 *
 * Idempotent: if the user has already been initialized (Circle 155106) or
 * a wallet already exists for this userId, returns `alreadyInitialized: true`
 * with no challengeId so the caller can skip the SDK challenge step.
 */
export async function initializeCircleWallet(
  merchantId: string
): Promise<
  CircleActionResult<{
    challengeId: string | null;
    alreadyInitialized: boolean;
  }>
> {
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

    // Pre-flight: if the user already has wallets, skip the challenge.
    // listWallets is idempotent and never causes Circle to mutate state.
    try {
      const existingWallets = await client.listWallets({ userId: merchantId });
      const wallets = existingWallets.data?.wallets ?? [];
      if (wallets.length > 0) {
        return {
          success: true,
          data: { challengeId: null, alreadyInitialized: true },
        };
      }
    } catch {
      // If the listWallets pre-flight fails for any reason, fall through
      // and try the challenge path below — better to attempt creation
      // than to surface a confusing error here.
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

    return {
      success: true,
      data: { challengeId, alreadyInitialized: false },
    };
  } catch (err: unknown) {
    // Circle returns 155106 ("user has already been initialized") when the
    // user has previously completed PIN/wallet setup. That's not a fatal
    // error — the caller should fall through to listWallets.
    if (isCircleUserAlreadyInitializedError(err)) {
      return {
        success: true,
        data: { challengeId: null, alreadyInitialized: true },
      };
    }
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

    // If we have a valid address, store it in the merchant record.
    // Older wallets surface as state === "LIVE", but freshly-restored
    // wallets can briefly report "INITIALIZED" or no state at all even
    // though they are usable — accept any wallet whose address exists.
    if (walletInfo.address) {
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
