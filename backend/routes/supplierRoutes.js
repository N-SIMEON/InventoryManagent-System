const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth"); // Ensure this exists
const supplierController = require("../controllers/supplierController");

// All routes are protected and scoped to the authenticated user's tenant
router.use(authenticate);

router.post("/", supplierController.createSupplier);
router.get("/", supplierController.getSuppliers);
router.get("/:id", supplierController.getSupplierById);
router.put("/:id", supplierController.updateSupplier);
router.delete("/:id", supplierController.deleteSupplier);

module.exports = router;