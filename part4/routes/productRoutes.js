const express = require('express');
const requireLogin = require('../middleware');
const productController = require('../controllers/productController');
const router = express.Router();

router.get("/", productController.renderProductsPage);
//add login check!!

router.post("/addProduct", productController.addNewProduct);

module.exports = router;