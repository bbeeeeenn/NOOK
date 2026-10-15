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

-- CreateIndex
CREATE INDEX "BorrowerImport_createdById_expiresAt_idx" ON "BorrowerImport"("createdById", "expiresAt");

-- CreateIndex
CREATE INDEX "BorrowerImportAudit_createdById_createdAt_idx" ON "BorrowerImportAudit"("createdById", "createdAt");

-- AddForeignKey
ALTER TABLE "BorrowerImport" ADD CONSTRAINT "BorrowerImport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowerImportAudit" ADD CONSTRAINT "BorrowerImportAudit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
