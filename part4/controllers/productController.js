const productModel = require('../models/productModel');

async function renderProductsPage(req, res) {
    try {
      if(req.session.role=='supplier'){
          const supplierId = req.session.supplier_id;
          const products = await productModel.getSupplierProducts(supplierId)  || [];
          res.render("pages/products", { products });
      }
      else{//owner
        //const products = await productModel.getAllProducts()  || [];
          const selectedSupplierId = req.query.supplier_id || 1;
          console.log("hi1");
          const suppliers = await productModel.getAllSuppliers();
          console.log("hi2");
          const products = await productModel.getSupplierProducts(selectedSupplierId);
          console.log("hi3");
          res.render('pages/manager_products', {
           suppliers,
           products,
           selectedSupplierId
         });
      }

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
   

  async function makeOrder(req, res) {
    try {
      // Parse the cart from the hidden input field
      const cart = JSON.parse(req.body.cartData);
  
      if (!cart || cart.length === 0) {
        return res.status(400).send("העגלה ריקה");
      }
      
      const items = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }));
  
      await productModel.createOrderForSupplier(supplierId, items);
  
      res.redirect("/grocery/orders");
  
    } catch (err) {
      console.error("Error in makeOrder controller:", err);
      res.status(500).send("שגיאה ביצירת ההזמנה");
    }
  }
  
  module.exports = {
    renderProductsPage,
    addNewProduct,
    makeOrder
  }
  