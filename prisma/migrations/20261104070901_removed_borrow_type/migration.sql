/*
  Warnings:

  - You are about to drop the column `type` on the `BorrowLog` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BorrowLog_type_idx";

-- AlterTable
ALTER TABLE "BorrowLog" DROP COLUMN "type";

-- DropEnum
DROP TYPE "PatronType";
