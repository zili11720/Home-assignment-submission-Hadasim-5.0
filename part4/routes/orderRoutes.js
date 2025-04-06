const express = require('express');
const orderController = require('../controllers/orderController');
const router = express.Router();

router.get("/", orderController.renderOrdersPage);


router.post("/confirmOrder", orderController.changeStatus);

module.exports = router;