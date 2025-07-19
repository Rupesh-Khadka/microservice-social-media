-- CreateTable
CREATE TABLE "post_service"."Post" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "mediaIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_content_idx" ON "post_service"."Post"("content");
