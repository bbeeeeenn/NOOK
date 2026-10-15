/*
  Warnings:

  - You are about to drop the column `createdAt` on the `BorrowerRecord` table. All the data in the column will be lost.
  - Added the required column `gender` to the `BorrowerRecord` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- DropIndex
DROP INDEX "BorrowerRecord_createdAt_idx";

-- AlterTable
ALTER TABLE "BorrowerRecord" DROP COLUMN "createdAt",
ADD COLUMN     "gender" "Gender" NOT NULL;
