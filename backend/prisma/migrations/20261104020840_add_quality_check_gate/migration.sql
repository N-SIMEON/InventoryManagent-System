-- CreateEnum
CREATE TYPE "QCStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "qcStatus" "QCStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "QualityCheck" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "lineId" UUID NOT NULL,
    "status" "QCStatus" NOT NULL,
    "checkedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QualityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QualityCheck_tenantId_idx" ON "QualityCheck"("tenantId");

-- CreateIndex
CREATE INDEX "QualityCheck_lineId_idx" ON "QualityCheck"("lineId");

-- AddForeignKey
ALTER TABLE "QualityCheck" ADD CONSTRAINT "QualityCheck_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "PurchaseOrderLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
