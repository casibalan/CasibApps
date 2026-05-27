import { NextRequest, NextResponse } from "next/server";
import { getCircleEnvStatus } from "@/lib/circle";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/circle/wallet-status?merchantId=<id>
 *
 * Returns the current wallet configuration status for a merchant.
 * Used by client components to poll for wallet readiness after
 * Circle challenge completion.
 */
export async function GET(request: NextRequest) {
  const merchantId = request.nextUrl.searchParams.get("merchantId");

  if (!merchantId) {
    return NextResponse.json(
      { error: "merchantId query parameter required." },
      { status: 400 }
    );
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: {
      id: true,
      name: true,
      businessName: true,
      walletAddress: true,
    },
  });

  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found." }, { status: 404 });
  }

  const circleEnv = getCircleEnvStatus();

  return NextResponse.json({
    merchantId: merchant.id,
    merchantName: merchant.businessName ?? merchant.name,
    walletAddress: merchant.walletAddress,
    circleConfigured: circleEnv.configured,
  });
}
