const orderModel = require('../models/orderModel');

async function renderOrdersPage(req, res) {
    const role=req.session.role
    try {
      if( role=='supplier'){
        const supplierId = req.session.supplier_id;
        const orders = await orderModel.getSupplierOrders(supplierId) || [];
        res.render("pages/orders", { orders,role });
      }
      else{  //role==Owner
        const orders = await orderModel.getSupplierOrders(null) || [];
        res.render("pages/orders", { orders,role });

      }

    } catch (err) {
      res.status(500).send("Server error");
    }
  }

  //Change the status of an order
  async function changeStatus(req, res) {
    try {
      //Get the role of the user in order to decide what is the status change required
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
  