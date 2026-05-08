/*
  Warnings:

  - You are about to alter the column `price` on the `Class` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'PARTIALLY_PAID';

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "balanceDue" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Class" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);
