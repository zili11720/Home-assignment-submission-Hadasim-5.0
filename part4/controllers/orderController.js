const orderModel = require('../models/orderModel');

async function renderOrdersPage(req, res) {
    console.log("hi from orders")
    const role=req.session.role
    try {
      if( role=='supplier'){
        const supplierId = req.session.supplier_id;
        const orders = await orderModel.getSupplierOrders(supplierId) || [];
        res.render("pages/orders", { orders,role });
      }
      else{//manager

        const orders = await orderModel.getSupplierOrders(null) || [];
        console.log("orders:",orders);
        res.render("pages/orders", { orders,role });

      }

    } catch (err) {
      res.status(500).send("Server error");
    }
  }

  async function changeStatus(req, res) {
    try {
      const role=req.session.role
      const { order_id } = req.body;
      await orderModel.changeStatus(order_id,role);
      res.redirect('/grocery/orders');

    } catch (err) {
      res.status(500).send("Server error"); 
    }
  }
  

module.exports={
    renderOrdersPage,changeStatus
}
  