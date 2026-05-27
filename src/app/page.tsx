import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth-guard";
import { LoginPageContent } from "@/components/auth/LoginPageContent";

export const dynamic = "force-dynamic";

/**
 * Root page — login-first UX.
 * If authenticated, redirect to dashboard.
 * If not, show Circle Google login flow directly on root domain.
 *
 * This ensures the Google OAuth redirect_uri (window.location.origin)
 * matches the page where the Circle SDK is initialized.
 */
export default async function Home() {
  const session = await checkAuth();

  if (session) {
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
