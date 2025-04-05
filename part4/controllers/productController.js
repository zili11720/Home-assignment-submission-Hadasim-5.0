const productModel = require('../models/productModel');

async function renderProductsPage(req, res) {
    const supplierId = req.session.supplier_id;

  
    try {
      const products = await productModel.getSupplierProducts(supplierId);
      res.render("pages/products", { products });

    } catch (err) {
      res.status(500).send("Server error"); 
    }
  }
  async function addNewProduct(req, res) {
    try {
      const supplierId = req.session.supplier_id;
  
      const { product_name, price_per_unit, min_quantity } = req.body;
  
      await productModel.addNewProduct(supplierId, {
        product_name,
        price_per_unit,
        min_quantity
      });
  
      res.redirect('/grocery/products');
  
    } catch (err) {
      console.error("Error adding product:", err);
      res.status(500).send("Server error");
    }
  }
  
  module.exports = {
    renderProductsPage,
    addNewProduct
  }
  