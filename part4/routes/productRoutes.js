const express = require('express');
const productController = require('../controllers/productController');
const router = express.Router();

router.get("/", productController.renderProductsPage);

router.post("/addProduct", productController.addNewProduct);

router.post("/makeOrder", productController.makeOrder);

module.exports = router;