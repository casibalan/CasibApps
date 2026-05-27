import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * /login — Redirects to root `/` which handles the Circle Social Login flow.
 *
 * The login flow lives on `/` so that the Google OAuth redirect_uri
 * (window.location.origin) matches the page where the Circle SDK is initialized.
 * This avoids token validation mismatches.
 */
export default function LoginPage() {
  redirect("/");
}
