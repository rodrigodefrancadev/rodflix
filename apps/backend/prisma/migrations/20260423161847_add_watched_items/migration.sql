-- CreateEnum
CREATE TYPE "WatchedKind" AS ENUM ('FILM', 'EPISODE');

-- CreateTable
CREATE TABLE "WatchedItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "kind" "WatchedKind" NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WatchedItem_userId_refId_key" ON "WatchedItem"("userId", "refId");

-- AddForeignKey
ALTER TABLE "WatchedItem" ADD CONSTRAINT "WatchedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
