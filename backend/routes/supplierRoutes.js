const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth"); // Ensure this exists
const { authorize } = require("../middleware/rbac");
const supplierController = require("../controllers/supplierController");

// All routes are protected and scoped to the authenticated user's tenant
router.use(authenticate);

router.post("/", authorize("supplier:create"), supplierController.createSupplier);
router.get("/", authorize("supplier:read"), supplierController.getSuppliers);
router.get("/:id", authorize("supplier:read"), supplierController.getSupplierById);
router.put("/:id", authorize("supplier:update"), supplierController.updateSupplier);
router.delete("/:id", authorize("supplier:delete"), supplierController.deleteSupplier);

module.exports = router;