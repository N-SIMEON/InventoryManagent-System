-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "LandedCost" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "purchaseOrderId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LandedCost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LandedCost_tenantId_idx" ON "LandedCost"("tenantId");

-- CreateIndex
CREATE INDEX "LandedCost_purchaseOrderId_idx" ON "LandedCost"("purchaseOrderId");

-- AddForeignKey
ALTER TABLE "LandedCost" ADD CONSTRAINT "LandedCost_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
