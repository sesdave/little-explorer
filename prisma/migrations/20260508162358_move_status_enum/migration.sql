/*
  Warnings:

  - The `status` column on the `Registration` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PROVISIONAL', 'CONFIRMED');

-- AlterTable
ALTER TABLE "Registration" DROP COLUMN "status",
ADD COLUMN     "status" "RegistrationStatus" NOT NULL DEFAULT 'PROVISIONAL';
