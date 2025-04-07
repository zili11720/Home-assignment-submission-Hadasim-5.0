const inventoryModel = require('../models/inventoryModel');
const productModel = require('../models/productModel');

async function renderInventoryPage(req,res) {
    try {

     const inventory = await inventoryModel.getInventoryProducts()  || [];
      res.render("pages/inventory", { inventory});    

    } catch (error) {
        res.status(500).send("Server error"); 
    }    
}

async function purchaseAndUpdateInventory(req, res) {
  try {
    
    const items = JSON.parse(req.body.cartData); // [{ product_name, quantity }]
    console.log(items);
    const alertMessages = [];

    //update inventory
    for (const item of items) {
      await inventoryModel.decreaseQuantity(item.product_name, item.quantity);
    }

    const inventory = await inventoryModel.getInventoryProducts();
    const supplierOrders = {}; // { supplierId: [ { product_id, quantity } ] }

    for (const item of inventory) {
      if (item.current_quantity < item.min_quantity) {
        // חיפוש הספק הכי זול
        const supplier = await inventoryModel.findSupplierForProduct(item.product_name);
        if (!supplier) {
          alertMessages.push(`לא נמצא ספק עבור המוצר: ${item.product_name}`);
          continue;
        }

        //calculate the quantity needed for the new order
        const quantity = item.min_quantity - item.current_quantity;


        //orgenize orders by suppliers
        if (!supplierOrders[supplier.supplier_id]) {
          supplierOrders[supplier.supplier_id] = [];
        }
        supplierOrders[supplier.supplier_id].push({
          product_id: supplier.product_id,
          quantity: quantity
        });
      }
    }

    // make orders from dofferent suppliers
    for (const [supplierId, orderItems] of Object.entries(supplierOrders)) {
      await productModel.createOrderForSupplier(parseInt(supplierId), orderItems);
      const names = orderItems.map(i => `מוצר ID ${i.product_id}, כמות ${i.quantity}`).join(', ');
      alertMessages.push(`בוצעה הזמנה לספק ${supplierId}: ${names}`);
    }

    const updatedInventory = await inventoryModel.getInventoryProducts();


    console.log("messege:",alertMessages.join('\n'));
    res.render("pages/inventory", {
      inventory: updatedInventory,
      alertMessage: alertMessages.join('\n')
    });

  } catch (error) {
    console.error("Purchase error:", error);
    res.status(500).send("Server error");
  }
}


module.exports={ renderInventoryPage, purchaseAndUpdateInventory}