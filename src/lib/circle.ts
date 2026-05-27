/**
 * Circle User-Controlled Wallets — Server-side SDK client.
 *
 * This module initializes the Circle Node.js SDK for server-side operations:
 * - Creating Circle users
 * - Generating user tokens (sessions)
 * - Creating wallet initialization challenges
 * - Querying wallet status/addresses
 *
 * Required environment variables:
 *   CIRCLE_API_KEY   — API key from Circle Developer Console
 *   CIRCLE_APP_ID    — App ID from Circle Developer Console
 *
 * Google OAuth Web Client ID is configured inside Circle Console.
 * Entity Secret is not used for User-Controlled Wallets social login.
 *
 * The module exports a safe getter that returns null if env vars are missing,
 * allowing the app to degrade gracefully.
 */

import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

// ---------------------------------------------------------------------------
// Environment validation
// ---------------------------------------------------------------------------

export type CircleEnvStatus = {
  configured: boolean;
  missing: string[];
};

const REQUIRED_ENV_VARS = [
  "CIRCLE_API_KEY",
  "CIRCLE_APP_ID",
] as const;

/**
 * Check which Circle env vars are configured.
 */
export function getCircleEnvStatus(): CircleEnvStatus {
  const missing: string[] = [];
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  return {
    configured: missing.length === 0,
    missing,
  };
}

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let _client: ReturnType<typeof initiateUserControlledWalletsClient> | null = null;

/**
 * Get the Circle user-controlled wallets client.
 * Returns null if required env vars are missing.
 */
export function getCircleClient() {
  const { configured } = getCircleEnvStatus();
  if (!configured) return null;

  if (!_client) {
    _client = initiateUserControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
    });
  }
  return _client;
}

/**
 * Get the Circle App ID for client-side SDK initialization.
 * Returns null if not configured.
 */
export function getCircleAppId(): string | null {
  return process.env.CIRCLE_APP_ID ?? null;
}
