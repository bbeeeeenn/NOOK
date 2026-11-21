/*
  Warnings:

  - You are about to drop the column `circulationType` on the `BookRecord` table. All the data in the column will be lost.
  - You are about to drop the column `sublocation` on the `BookRecord` table. All the data in the column will be lost.
  - Changed the type of `circulationType` on the `BorrowLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Location" AS ENUM ('CIRCULATION', 'FILIPINIANA');

-- AlterTable
ALTER TABLE "BookRecord" DROP COLUMN "circulationType",
DROP COLUMN "sublocation";

-- AlterTable
ALTER TABLE "BorrowLog" DROP COLUMN "circulationType",
ADD COLUMN     "circulationType" "Location" NOT NULL;

-- DropEnum
DROP TYPE "CirculationType";
