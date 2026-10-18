/*
  Warnings:

  - You are about to drop the column `bookAuthor` on the `BorrowLog` table. All the data in the column will be lost.
  - You are about to drop the column `bookTitle` on the `BorrowLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BorrowLog" DROP COLUMN "bookAuthor",
DROP COLUMN "bookTitle";

-- CreateTable
CREATE TABLE "BookRecord" (
    "copyCode" TEXT NOT NULL,
    "callnumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "sublocation" TEXT NOT NULL,
    "circulationType" TEXT NOT NULL,

    CONSTRAINT "BookRecord_pkey" PRIMARY KEY ("copyCode")
);
