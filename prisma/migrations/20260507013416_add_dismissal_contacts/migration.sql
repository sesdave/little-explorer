-- CreateTable
CREATE TABLE "DismissalContact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DismissalContact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DismissalContact" ADD CONSTRAINT "DismissalContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
