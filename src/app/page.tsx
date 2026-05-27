import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth-guard";
import { LandingPage } from "@/components/landing/LandingPage";

export const dynamic = "force-dynamic";

/**
 * Root page — login-first UX.
 * If authenticated, redirect to dashboard.
 * If not, show professional landing with login CTA.
 */
export default async function Home() {
  const session = await checkAuth();

  if (session) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
