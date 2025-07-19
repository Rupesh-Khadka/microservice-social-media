/*
  Warnings:

  - A unique constraint covering the columns `[postId]` on the table `Search` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Search_postId_key" ON "search_service"."Search"("postId");
