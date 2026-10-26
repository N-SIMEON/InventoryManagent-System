const prisma = require("../db");

exports.createSupplier = async (req, res) => {
  try {
    const { name, contactEmail, contactPhone, address } = req.body;
    if (!name) return res.status(400).json({ error: "Supplier name is required" });

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactEmail,
        contactPhone,
        address,
        tenantId: req.user.tenantId, // 🔒 Tenant isolation
      },
    });
    res.status(201).json(supplier);
  } catch (err) {
    console.error("Create supplier error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { tenantId: req.user.tenantId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(suppliers);
  } catch (err) {
    console.error("List suppliers error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await prisma.supplier.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    console.error("Get supplier error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { name, contactEmail, contactPhone, address, isActive } = req.body;
    
    // Verify ownership first
    const existing = await prisma.supplier.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!existing) return res.status(404).json({ error: "Supplier not found" });

    const updated = await prisma.supplier.update({
      where: { id: req.params.id },
      data: { name, contactEmail, contactPhone, address, isActive },
    });
    res.json(updated);
  } catch (err) {
    console.error("Update supplier error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const existing = await prisma.supplier.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!existing) return res.status(404).json({ error: "Supplier not found" });

    // Soft delete to preserve historical PO references
    await prisma.supplier.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ message: "Supplier deactivated successfully" });
  } catch (err) {
    console.error("Delete supplier error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};