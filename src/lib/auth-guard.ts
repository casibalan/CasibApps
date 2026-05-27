"use server";

/**
 * Auth guard utility for protected routes.
 * Checks for a valid merchant session and redirects to /login if missing.
 */

import { redirect } from "next/navigation";
import { getMerchantSession, type MerchantSession } from "./auth-actions";

/**
 * Require an authenticated merchant session.
 * If no session exists, redirects to /login.
 * Returns the session if authenticated.
 */
export async function requireAuth(): Promise<MerchantSession> {
  const session = await getMerchantSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Check if user is authenticated (non-redirecting).
 * Returns session or null.
 */
export async function checkAuth(): Promise<MerchantSession | null> {
  return getMerchantSession();
}
