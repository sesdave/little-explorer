/*
  Warnings:

  - Added the required column `amount` to the `Donation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL;
