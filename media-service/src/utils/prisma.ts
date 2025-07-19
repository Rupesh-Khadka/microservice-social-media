import { PrismaClient } from "@prisma/client";
import logger from "./logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

async function testConnection() {
  try {
    await prisma.$connect();
    logger.info(`Database connected`);

    // console.log("✅ DB connected");
  } catch (err) {
    logger.warn(`Failed to connect Database`);

    // console.error("❌ Failed to connect to the DB", err);
  }
}

testConnection();
