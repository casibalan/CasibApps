import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Upsert demo merchant
  const merchant = await prisma.merchant.upsert({
    where: { email: "alanilahi123@gmail.com" },
    update: {
      name: "Casib Owner",
      businessName: "Casib Studio",
    },
    create: {
      name: "Casib Owner",
      email: "alanilahi123@gmail.com",
      businessName: "Casib Studio",
    },
  });

  console.log(`Merchant upserted: ${merchant.name} (${merchant.id})`);

  // Upsert demo invoices
  const invoices = [
    {
      invoiceNumber: "INV-1008",
      clientName: "Acme Corp",
      clientEmail: "billing@acme.com",
      description: "Website redesign - Phase 1",
      amount: 1500.0,
      currency: "USDC",
      status: "PENDING" as const,
      settlementStatus: "NOT_STARTED" as const,
      dueDate: new Date("2026-06-15"),
      paymentLinkSlug: "pay-inv-1008",
    },
    {
      invoiceNumber: "INV-1009",
      clientName: "Globex Inc",
      clientEmail: "ap@globex.io",
      description: "Logo and brand kit",
      amount: 800.0,
      currency: "USDC",
      status: "PAID" as const,
      settlementStatus: "SETTLED" as const,
      dueDate: new Date("2026-05-20"),
      paidAt: new Date("2026-05-18"),
      paymentLinkSlug: "pay-inv-1009",
    },
    {
      invoiceNumber: "INV-1010",
      clientName: "Initech LLC",
      clientEmail: "finance@initech.co",
      description: "Monthly retainer - June 2026",
      amount: 2000.0,
      currency: "USDC",
      status: "PENDING" as const,
      settlementStatus: "NOT_STARTED" as const,
      dueDate: new Date("2026-06-30"),
      paymentLinkSlug: "pay-inv-1010",
    },
  ];

  for (const inv of invoices) {
    const result = await prisma.invoice.upsert({
      where: { invoiceNumber: inv.invoiceNumber },
      update: {
        status: inv.status,
        settlementStatus: inv.settlementStatus,
        amount: inv.amount,
        paidAt: inv.paidAt ?? null,
      },
      create: {
        ...inv,
        merchantId: merchant.id,
      },
    });
    console.log(`Invoice upserted: ${result.invoiceNumber} [${result.status}]`);
  }

  console.log("\nSeed complete ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
