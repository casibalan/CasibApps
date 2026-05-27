import { redirect } from "next/navigation";
import { clearMerchantSession } from "@/lib/auth-actions";

export const dynamic = "force-dynamic";

/**
 * /logout — Clear merchant session and redirect to login.
 */
export default async function LogoutPage() {
  await clearMerchantSession();
  redirect("/login");
}
