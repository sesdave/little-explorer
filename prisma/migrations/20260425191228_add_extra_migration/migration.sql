/*
  Warnings:

  - You are about to drop the column `amountPaid` on the `Registration` table. All the data in the column will be lost.
  - The `status` column on the `Registration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[childId,classId,applicationId]` on the table `Registration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `applicationId` to the `Registration` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentPlan" AS ENUM ('FULL', 'PARTIAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'PAYSTACK', 'BANK_TRANSFER', 'CASH');

-- DropIndex
DROP INDEX "Registration_childId_idx";

-- DropIndex
DROP INDEX "Registration_classId_idx";

-- DropIndex
DROP INDEX "Registration_sessionId_idx";

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "registrationsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Registration" DROP COLUMN "amountPaid",
ADD COLUMN     "applicationId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PROVISIONAL';

-- DropEnum
DROP TYPE "RegistrationStatus";

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "paymentPlan" "PaymentPlan" NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "PaymentMethod" NOT NULL,
    "externalReference" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Application_parentId_sessionId_status_idx" ON "Application"("parentId", "sessionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_externalReference_key" ON "Payment"("externalReference");

-- CreateIndex
CREATE INDEX "Payment_applicationId_status_idx" ON "Payment"("applicationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_childId_classId_applicationId_key" ON "Registration"("childId", "classId", "applicationId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
