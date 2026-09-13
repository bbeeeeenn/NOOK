-- DropForeignKey
ALTER TABLE "BorrowLog" DROP CONSTRAINT "BorrowLog_borrowerIdNumber_fkey";

-- AddForeignKey
ALTER TABLE "BorrowLog" ADD CONSTRAINT "BorrowLog_borrowerIdNumber_fkey" FOREIGN KEY ("borrowerIdNumber") REFERENCES "Borrower"("idNumber") ON DELETE NO ACTION ON UPDATE CASCADE;
