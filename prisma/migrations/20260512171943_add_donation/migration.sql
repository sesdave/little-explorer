/*
  Warnings:

  - A unique constraint covering the columns `[donationId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('REGISTRATION', 'DONATION');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "donationId" TEXT,
ADD COLUMN     "type" "PaymentType" NOT NULL DEFAULT 'REGISTRATION',
ALTER COLUMN "currency" SET DEFAULT 'NGN';

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "donorName" TEXT DEFAULT 'Anonymous',
    "message" TEXT,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_donationId_key" ON "Payment"("donationId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
