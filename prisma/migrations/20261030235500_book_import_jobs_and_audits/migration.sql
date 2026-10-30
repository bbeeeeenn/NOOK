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

-- CreateIndex
CREATE INDEX "BookImport_createdById_expiresAt_idx" ON "BookImport"("createdById", "expiresAt");

-- CreateIndex
CREATE INDEX "BookImportAudit_createdById_createdAt_idx" ON "BookImportAudit"("createdById", "createdAt");

-- AddForeignKey
ALTER TABLE "BookImport" ADD CONSTRAINT "BookImport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookImportAudit" ADD CONSTRAINT "BookImportAudit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
