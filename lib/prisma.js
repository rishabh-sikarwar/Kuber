import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

let prisma;
if (!globalForPrisma.prisma) {
  prisma = new PrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
} else {
  prisma = globalForPrisma.prisma;
}

export const db = prisma;

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
