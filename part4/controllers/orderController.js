const orderModel = require('../models/orderModel');

async function renderOrdersPage(req, res) {
    const supplierId = req.session.supplier_id;
    console.log("hi from orders");
    try {
      const orders = await orderModel.getSupplierOrders(supplierId);
      console.log(JSON.stringify(orders, null, 2));
      res.render("pages/orders", { orders });

    } catch (err) {
      res.status(500).send("Server error"); //error is thrown why??/?
    }
  }

module.exports={
    renderOrdersPage
}
  