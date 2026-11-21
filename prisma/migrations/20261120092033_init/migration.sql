-- CreateEnum
CREATE TYPE "CirculationType" AS ENUM ('CIRCULATION', 'FILIPINIANA');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateTable
CREATE TABLE "BorrowLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scannedId" TEXT,
    "idNumber" TEXT,
    "bookBarcode" TEXT NOT NULL,
    "classNumber" INTEGER NOT NULL,
    "circulationType" "CirculationType" NOT NULL,

    CONSTRAINT "BorrowLog_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "BorrowerRecord" (
    "idNumber" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "middlename" TEXT,
    "yearLevel" INTEGER NOT NULL,
    "program" TEXT NOT NULL,
    "college" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,

    CONSTRAINT "BorrowerRecord_pkey" PRIMARY KEY ("idNumber")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BorrowerImport" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "rows" JSONB NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "insertCount" INTEGER NOT NULL,
    "updateCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,

    CONSTRAINT "BorrowerImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BorrowerImportAudit" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "insertCount" INTEGER NOT NULL,
    "updateCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "BorrowerImportAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookImport" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "rows" JSONB NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "insertCount" INTEGER NOT NULL,
    "updateCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,

    CONSTRAINT "BookImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookImportAudit" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "insertCount" INTEGER NOT NULL,
    "updateCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "BookImportAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateIndex
CREATE INDEX "BorrowLog_date_idx" ON "BorrowLog"("date");

-- CreateIndex
CREATE INDEX "BorrowLog_idNumber_date_idx" ON "BorrowLog"("idNumber", "date");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "BorrowerImport_createdById_expiresAt_idx" ON "BorrowerImport"("createdById", "expiresAt");

-- CreateIndex
CREATE INDEX "BorrowerImportAudit_createdById_createdAt_idx" ON "BorrowerImportAudit"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "BookImport_createdById_expiresAt_idx" ON "BookImport"("createdById", "expiresAt");

-- CreateIndex
CREATE INDEX "BookImportAudit_createdById_createdAt_idx" ON "BookImportAudit"("createdById", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- AddForeignKey
ALTER TABLE "BorrowLog" ADD CONSTRAINT "BorrowLog_idNumber_fkey" FOREIGN KEY ("idNumber") REFERENCES "BorrowerRecord"("idNumber") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowLog" ADD CONSTRAINT "BorrowLog_bookBarcode_fkey" FOREIGN KEY ("bookBarcode") REFERENCES "BookRecord"("copyCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowerImport" ADD CONSTRAINT "BorrowerImport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowerImportAudit" ADD CONSTRAINT "BorrowerImportAudit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookImport" ADD CONSTRAINT "BookImport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookImportAudit" ADD CONSTRAINT "BookImportAudit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
