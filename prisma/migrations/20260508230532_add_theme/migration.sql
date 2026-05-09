-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "sex" "Sex" NOT NULL DEFAULT 'MALE';

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "theme" TEXT NOT NULL DEFAULT '';
