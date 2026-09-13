/*
  Warnings:

  - You are about to drop the column `borrowerIdNumber` on the `BorrowLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BorrowLog" DROP CONSTRAINT "BorrowLog_borrowerIdNumber_fkey";

-- AlterTable
ALTER TABLE "BorrowLog" DROP COLUMN "borrowerIdNumber";

-- AddForeignKey
ALTER TABLE "BorrowLog" ADD CONSTRAINT "BorrowLog_idNumber_fkey" FOREIGN KEY ("idNumber") REFERENCES "Borrower"("idNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
