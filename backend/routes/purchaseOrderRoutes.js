const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/rbac");
const poController = require("../controllers/purchaseOrderController");

router.use(authenticate);

router.post("/", authorize("po:create"), poController.createPurchaseOrder);
router.get("/", authorize("po:read"), poController.getPurchaseOrders);
router.get("/:id", authorize("po:read"), poController.getPurchaseOrderById);
router.put("/:id", authorize("po:update"), poController.updatePurchaseOrder);
router.post("/:id/submit", authorize("po:submit"), poController.submitPurchaseOrder); // Status derivation
router.post("/:id/cancel", authorize("po:cancel"), poController.cancelPurchaseOrder); // Soft delete via status

router.post("/:id/receive", authorize("po:receive"), poController.receivePurchaseOrder);

router.post("/qc/pass", authorize("qc:pass"), poController.passQualityCheck);
router.post("/qc/fail", authorize("qc:fail"), poController.failQualityCheck);

module.exports = router;