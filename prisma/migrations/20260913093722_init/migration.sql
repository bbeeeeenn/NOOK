-- CreateTable
CREATE TABLE "AdminAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "AdminAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuration" (
    "id" TEXT NOT NULL,
    "spreadsheetId" TEXT NOT NULL,
    "adminAccountId" TEXT NOT NULL,

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BorrowLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idNumber" TEXT NOT NULL,
    "bookBarcode" TEXT NOT NULL,
    "bookTitle" TEXT,
    "bookAuthor" TEXT,
    "callNumber" TEXT,
    "copies" INTEGER,

    CONSTRAINT "BorrowLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Borrower" (
    "id" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yearLevel" INTEGER NOT NULL,
    "program" TEXT NOT NULL,
    "college" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Borrower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingRegistration" (
    "id" SERIAL NOT NULL,
    "idNumber" TEXT NOT NULL,
    "timesBorrowed" INTEGER NOT NULL DEFAULT 1,
    "lastBorrowDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tableRanges" TEXT[],

    CONSTRAINT "PendingRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccount_username_key" ON "AdminAccount"("username");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccount_email_key" ON "AdminAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Configuration_adminAccountId_key" ON "Configuration"("adminAccountId");

-- CreateIndex
CREATE INDEX "BorrowLog_date_idx" ON "BorrowLog"("date");

-- CreateIndex
CREATE INDEX "BorrowLog_idNumber_date_idx" ON "BorrowLog"("idNumber", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Borrower_idNumber_key" ON "Borrower"("idNumber");

-- CreateIndex
CREATE INDEX "Borrower_createdAt_idx" ON "Borrower"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PendingRegistration_idNumber_key" ON "PendingRegistration"("idNumber");

-- AddForeignKey
ALTER TABLE "Configuration" ADD CONSTRAINT "Configuration_adminAccountId_fkey" FOREIGN KEY ("adminAccountId") REFERENCES "AdminAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
