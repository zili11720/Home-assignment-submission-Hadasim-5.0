const express = require('express');
const requireLogin = require('../middleware');
const orderController = require('../controllers/orderController');
const router = express.Router();

router.get("/", orderController.renderOrdersPage);
//add login check!!


router.post("/confirmOrder", orderController.confirmOrder);

module.exports = router;