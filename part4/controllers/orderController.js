const orderModel = require('../models/orderModel');

async function renderOrdersPage(req, res) {
    const supplierId = req.session.supplier_id;
    try {
      const orders = await orderModel.getSupplierOrders(supplierId);
      res.render("pages/orders", { orders });

    } catch (err) {
      res.status(500).send("Server error"); //error is thrown why??/?
    }
  }

  async function confirmOrder(req, res) {
    try {
      const { order_id } = req.body;
      console.log("hi from confirm order");
      await orderModel.confirmOrder(order_id);
      res.redirect('/grocery/orders');

    } catch (err) {
      res.status(500).send("Server error"); 
    }
  }

module.exports={
    renderOrdersPage, confirmOrder
}
  