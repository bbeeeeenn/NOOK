/*
  Warnings:

  - You are about to drop the column `callNumber` on the `BorrowLog` table. All the data in the column will be lost.
  - You are about to drop the column `copies` on the `BorrowLog` table. All the data in the column will be lost.
  - You are about to drop the `PendingRegistration` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "BorrowLog" DROP COLUMN "callNumber",
DROP COLUMN "copies";

-- DropTable
DROP TABLE "PendingRegistration";

-- CreateTable
CREATE TABLE "PendingBorrowLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idNumber" TEXT NOT NULL,
    "bookBarcode" TEXT NOT NULL,
    "bookTitle" TEXT,
    "bookAuthor" TEXT,
    "tableRange" TEXT NOT NULL,

    CONSTRAINT "PendingBorrowLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingBorrowLog_date_idx" ON "PendingBorrowLog"("date");

-- CreateIndex
CREATE INDEX "PendingBorrowLog_idNumber_date_idx" ON "PendingBorrowLog"("idNumber", "date");

-- AddForeignKey
ALTER TABLE "BorrowLog" ADD CONSTRAINT "BorrowLog_idNumber_fkey" FOREIGN KEY ("idNumber") REFERENCES "Borrower"("idNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
