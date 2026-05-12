-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_applicationId_fkey";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "applicationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
