/*
  Warnings:

  - Added the required column `s3Key` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "media_service"."Media" ADD COLUMN     "s3Key" TEXT NOT NULL;
