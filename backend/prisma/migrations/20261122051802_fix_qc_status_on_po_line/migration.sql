/*
  Warnings:

  - You are about to drop the column `qcStatus` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "qcStatus";

-- AlterTable
ALTER TABLE "PurchaseOrderLine" ADD COLUMN     "qcStatus" "QCStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "PurchaseOrderLine_qcStatus_idx" ON "PurchaseOrderLine"("qcStatus");
