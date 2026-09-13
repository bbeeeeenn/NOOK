-- DropForeignKey
ALTER TABLE "BorrowLog" DROP CONSTRAINT "BorrowLog_idNumber_fkey";

-- AlterTable
ALTER TABLE "BorrowLog" ADD COLUMN     "borrowerIdNumber" TEXT;

-- AddForeignKey
ALTER TABLE "BorrowLog" ADD CONSTRAINT "BorrowLog_borrowerIdNumber_fkey" FOREIGN KEY ("borrowerIdNumber") REFERENCES "Borrower"("idNumber") ON DELETE SET NULL ON UPDATE CASCADE;
