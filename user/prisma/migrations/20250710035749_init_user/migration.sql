-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "user_service";

-- CreateTable
CREATE TABLE "user_service"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_service"."refresh_token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "user_service"."User"("email");

-- CreateIndex
CREATE INDEX "User_name_idx" ON "user_service"."User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_key" ON "user_service"."refresh_token"("token");

-- CreateIndex
CREATE INDEX "refresh_token_expiresAt_idx" ON "user_service"."refresh_token"("expiresAt");

-- AddForeignKey
ALTER TABLE "user_service"."refresh_token" ADD CONSTRAINT "refresh_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_service"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
