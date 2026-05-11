-- CreateEnum
CREATE TYPE "BroadcastStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "BroadcastType" AS ENUM ('EMAIL', 'SMS');

-- CreateTable
CREATE TABLE "Broadcast" (
    "id" TEXT NOT NULL,
    "type" "BroadcastType" NOT NULL,
    "status" "BroadcastStatus" NOT NULL DEFAULT 'PROCESSING',
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "recipients" INTEGER NOT NULL DEFAULT 0,
    "senderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Broadcast_senderId_idx" ON "Broadcast"("senderId");

-- AddForeignKey
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
