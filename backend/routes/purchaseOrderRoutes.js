const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const poController = require("../controllers/purchaseOrderController");

router.use(authenticate);

router.post("/", poController.createPurchaseOrder);
router.get("/", poController.getPurchaseOrders);
router.get("/:id", poController.getPurchaseOrderById);
router.put("/:id", poController.updatePurchaseOrder);
router.post("/:id/submit", poController.submitPurchaseOrder); // Status derivation
router.post("/:id/cancel", poController.cancelPurchaseOrder); // Soft delete via status

router.post("/:id/receive", poController.receivePurchaseOrder);

module.exports = router;