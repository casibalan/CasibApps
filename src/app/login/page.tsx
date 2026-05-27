import { redirect } from "next/navigation";
import { getMerchantSession } from "@/lib/auth-actions";
import { LoginPageContent } from "@/components/auth/LoginPageContent";

export const dynamic = "force-dynamic";

/**
 * /login — Circle Social Login with Google.
 *
 * If the user is already logged in (has a valid merchant session),
 * redirect to dashboard. Otherwise show the Google login flow.
 */
export default async function LoginPage() {
  // Check if already logged in
  const session = await getMerchantSession();
  if (session) {
    // If wallet is missing, guide to wallet setup
    if (!session.walletAddress) {
      redirect("/wallet");
    }
    redirect("/dashboard");
  }

  // Environment variables needed client-side
  const appId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID ?? "";
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  // Validate configuration
  const missingVars: string[] = [];
  if (!process.env.CIRCLE_API_KEY) missingVars.push("CIRCLE_API_KEY");
  if (!appId) missingVars.push("NEXT_PUBLIC_CIRCLE_APP_ID");
  if (!googleClientId) missingVars.push("NEXT_PUBLIC_GOOGLE_CLIENT_ID");

  return (
    <LoginPageContent
      appId={appId}
      googleClientId={googleClientId}
      missingVars={missingVars}
    />
  );
}
