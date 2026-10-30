const prisma = require("../db");

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, orderNumber, notes, lines } = req.body;
    if (!supplierId || !orderNumber || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: "supplierId, orderNumber, and at least one line are required" });
    }

    // Verify supplier belongs to tenant
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, tenantId: req.user.tenantId },
    });
    if (!supplier) return res.status(400).json({ error: "Invalid supplier for this tenant" });

    // Calculate totals
    let totalAmount = 0;
    const formattedLines = lines.map(line => {
      const lineTotal = line.quantity * line.unitPrice;
      totalAmount += lineTotal;
      return {
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: lineTotal,
      };
    });

    const po = await prisma.purchaseOrder.create({
      data: {
        tenantId: req.user.tenantId,
        supplierId,
        orderNumber,
        notes,
        totalAmount,
        lines: { create: formattedLines },
      },
      include: { lines: true, supplier: { select: { name: true } } },
    });

    res.status(201).json(po);
  } catch (err) {
    console.error("Create PO error:", err);
    // Handle unique constraint violation for orderNumber
    if (err.code === 'P2002') return res.status(409).json({ error: "Order number already exists for this tenant" });
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPurchaseOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = { tenantId: req.user.tenantId };
    if (status) whereClause.status = status;

    const pos = await prisma.purchaseOrder.findMany({
      where: whereClause,
      include: { supplier: { select: { name: true } }, lines: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(pos);
  } catch (err) {
    console.error("List POs error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPurchaseOrderById = async (req, res) => {
  try {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: { lines: true, supplier: true },
    });
    if (!po) return res.status(404).json({ error: "Purchase Order not found" });
    res.json(po);
  } catch (err) {
    console.error("Get PO error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    const { notes, lines } = req.body;
    
    const existing = await prisma.purchaseOrder.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: { lines: true },
    });
    if (!existing) return res.status(404).json({ error: "Purchase Order not found" });

    // 🔒 Business Logic: Only DRAFT orders can be modified
    if (existing.status !== "DRAFT") {
      return res.status(400).json({ error: "Only DRAFT purchase orders can be updated" });
    }

    let totalAmount = existing.totalAmount;
    let lineUpdateData = {};

    if (lines && Array.isArray(lines)) {
      let newTotal = 0;
      const formattedLines = lines.map(line => {
        const lineTotal = line.quantity * line.unitPrice;
        newTotal += lineTotal;
        return {
          id: line.id, // Include ID to update existing lines
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineTotal: lineTotal,
        };
      });
      totalAmount = newTotal;
      lineUpdateData = {
        update: formattedLines.map(({ id, ...data }) => ({ where: { id }, data })),
      };
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: {
        notes,
        totalAmount,
        lines: lineUpdateData,
      },
      include: { lines: true },
    });

    res.json(updated);
  } catch (err) {
    console.error("Update PO error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.submitPurchaseOrder = async (req, res) => {
  try {
    const existing = await prisma.purchaseOrder.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!existing) return res.status(404).json({ error: "Purchase Order not found" });

    if (existing.status !== "DRAFT") {
      return res.status(400).json({ error: "Only DRAFT purchase orders can be submitted" });
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: { status: "SUBMITTED" },
      include: { lines: true },
    });

    res.json({ message: "Purchase Order submitted successfully", po: updated });
  } catch (err) {
    console.error("Submit PO error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.cancelPurchaseOrder = async (req, res) => {
  try {
    const existing = await prisma.purchaseOrder.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!existing) return res.status(404).json({ error: "Purchase Order not found" });

    if (existing.status === "RECEIVED" || existing.status === "PARTIALLY_RECEIVED") {
      return res.status(400).json({ error: "Cannot cancel a PO that has already been received" });
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED" },
    });

    res.json({ message: "Purchase Order cancelled successfully", po: updated });
  } catch (err) {
    console.error("Cancel PO error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.receivePurchaseOrder = async (req, res) => {
  try {
    const { lines } = req.body; 
    
    if (!Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: "lines array is required" });
    }

    // 1. Fetch the PO and verify ownership & status
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: { lines: { include: { product: true } } }, // Include product to check trackingType
    });

    if (!po) return res.status(404).json({ error: "Purchase Order not found" });
    if (po.status !== "SUBMITTED" && po.status !== "PARTIALLY_RECEIVED") {
      return res.status(400).json({ error: `Cannot receive items on a ${po.status} purchase order` });
    }

    let newPoStatus = po.status;
    let allLinesFullyReceived = true;
    let atLeastOneLineReceived = po.status === "PARTIALLY_RECEIVED";

    // 2. Process each line
    for (const lineUpdate of lines) {
      const line = po.lines.find(l => l.id === lineUpdate.lineId);
      if (!line) return res.status(400).json({ error: `Line ${lineUpdate.lineId} not found` });
      
      const receivedQty = lineUpdate.receivedQty || 0;
      if (receivedQty <= 0) return res.status(400).json({ error: "receivedQty must be > 0" });
      if (receivedQty + line.receivedQty > line.quantity) {
        return res.status(400).json({ error: `Received qty exceeds ordered qty for line ${lineUpdate.lineId}` });
      }

      // --- TRACKING TYPE LOGIC ---
      const trackingType = line.product.trackingType;

      if (trackingType === "LOT") {
        if (!Array.isArray(lineUpdate.lots) || lineUpdate.lots.length === 0) {
          return res.status(400).json({ error: "Lot information is required for LOT tracked products" });
        }
        // Validate lot quantities sum up to receivedQty
        const lotTotal = lineUpdate.lots.reduce((sum, l) => sum + l.quantity, 0);
        if (lotTotal !== receivedQty) {
          return res.status(400).json({ error: "Sum of lot quantities must equal receivedQty" });
        }

        // Create/Update Lots
        for (const lotData of lineUpdate.lots) {
          await prisma.lot.upsert({
            where: {
              tenantId_productId_lotNumber: {
                tenantId: req.user.tenantId,
                productId: line.productId,
                lotNumber: lotData.lotNumber,
              }
            },
            update: { quantity: { increment: lotData.quantity } },
            create: {
              tenantId: req.user.tenantId,
              productId: line.productId,
              lotNumber: lotData.lotNumber,
              expiryDate: lotData.expiryDate ? new Date(lotData.expiryDate) : null,
              quantity: lotData.quantity,
            },
          });
        }
      } 
      else if (trackingType === "SERIAL") {
        if (!Array.isArray(lineUpdate.serials) || lineUpdate.serials.length === 0) {
          return res.status(400).json({ error: "Serial numbers are required for SERIAL tracked products" });
        }
        if (lineUpdate.serials.length !== receivedQty) {
          return res.status(400).json({ error: "Number of serials must exactly match receivedQty" });
        }

        // Create Serial Numbers
        const serialRecords = lineUpdate.serials.map(sn => ({
          tenantId: req.user.tenantId,
          productId: line.productId,
          serialNumber: sn,
        }));

        await prisma.serialNumber.createMany({
          data: serialRecords,
          skipDuplicates: true, // Prevents crash if duplicate sent, though DB unique constraint will also catch it
        });
      }

      // --- UPDATE PO LINE & MOCK STOCK LEDGER ---
      await prisma.purchaseOrderLine.update({
        where: { id: lineUpdate.lineId },
        data: { receivedQty: { increment: receivedQty } },
      });

      // TODO: TASK 1.5 INTEGRATION (Replace direct product update with stockMovement)
      await prisma.product.update({
        where: { id: line.productId },
        data: { quantity: { increment: receivedQty } },
      });

      // Check line completion
      const newLineReceivedQty = line.receivedQty + receivedQty;
      if (newLineReceivedQty < line.quantity) {
        allLinesFullyReceived = false;
      } else {
        atLeastOneLineReceived = true;
      }
    }

    // 3. Derive PO Status
    if (allLinesFullyReceived) newPoStatus = "RECEIVED";
    else if (atLeastOneLineReceived) newPoStatus = "PARTIALLY_RECEIVED";

    const updatedPo = await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: { status: newPoStatus },
      include: { lines: true, supplier: { select: { name: true } } },
    });

    res.json({ message: "Items received successfully", po: updatedPo });
  } catch (err) {
    console.error("Receive PO error:", err);
    if (err.code === 'P2002') return res.status(409).json({ error: "Duplicate lot number or serial number provided" });
    res.status(500).json({ error: "Internal server error" });
  }
};