-- AddForeignKey
ALTER TABLE "BorrowLog" ADD CONSTRAINT "BorrowLog_bookBarcode_fkey" FOREIGN KEY ("bookBarcode") REFERENCES "BookRecord"("copyCode") ON DELETE RESTRICT ON UPDATE CASCADE;
