import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /logout — Clear merchant session cookie and redirect to /login.
 *
 * Implemented as a Route Handler (not a Server Component page) because
 * cookie mutations (delete) are only reliably supported in Route Handlers
 * and Server Actions in Next.js 15+. A Server Component page that mutates
 * cookies and then calls redirect() can crash in production with a
 * server-side rendering error.
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("casib_merchant_id");

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl, { status: 302 });
}
