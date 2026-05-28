import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create a PrismaClient with the PrismaPg adapter.
 *
 * Uses lazy initialization so that a missing DATABASE_URL does not crash
 * the module at import time. Instead, the first query will throw a clear
 * error that the calling code's try/catch can surface to server logs.
 */
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // Log a clear diagnostic to the server runtime (Vercel Functions logs).
    // Do NOT throw here — we return a proxy that throws on first use so
    // that auth-actions.ts try/catch can capture and log the error with
    // full context (databaseUrlConfigured, etc.).
    console.error(
      "[prisma] DATABASE_URL is not configured. " +
        "All database queries will fail until this environment variable is set. " +
        "Check Vercel → Settings → Environment Variables for the Production environment."
    );

    // Return a Proxy that throws a descriptive error on any property access
    // that would trigger a query (e.g. prisma.merchant.findUnique).
    // This lets the module load succeed so auth-actions can import it,
    // and the error surfaces inside the try/catch with full diagnostics.
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        // Allow internal Prisma/Node checks that read symbol or string props
        // like Symbol.toPrimitive, then, $$typeof, etc.
        if (typeof prop === "symbol" || prop === "then") return undefined;

        // For any model access (merchant, invoice, etc.), return a proxy
        // that throws on method calls (findUnique, create, etc.)
        return new Proxy(
          {},
          {
            get(_modelTarget, methodProp) {
              if (typeof methodProp === "symbol" || methodProp === "then")
                return undefined;
              return () => {
                throw new Error(
                  `DATABASE_URL is not configured. Cannot execute prisma.${String(prop)}.${String(methodProp)}(). ` +
                    `Set DATABASE_URL in Vercel Environment Variables for the Production environment.`
                );
              };
            },
          }
        );
      },
    });
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
