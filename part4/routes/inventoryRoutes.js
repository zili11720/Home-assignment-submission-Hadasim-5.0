const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const router = express.Router();

router.get("/", inventoryController.renderInventoryPage);


router.post("/purchase", inventoryController.purchaseAndUpdateInventory);

module.exports = router;