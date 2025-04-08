const inventoryModel = require('../models/inventoryModel');
const productModel = require('../models/productModel');

async function renderInventoryPage(req,res) {
    try {

     const inventory = await inventoryModel.getInventoryProducts()  || [];
      res.render("pages/inventory", { inventory, alertMessage: req.query.msg || ""});    

    } catch (error) {
        res.status(500).send("Server error"); 
    }    
}

//Simulate a selling to a client and update the inventory accordingly if needed
async function purchaseAndUpdateInventory(req, res) {
  try {
    
    const items = JSON.parse(req.body.cartData); // [{ product_name, quantity }]
    const alertMessages = [];

    //Get inventory before sell
    const oldInventory = await inventoryModel.getInventoryProducts();
    if (!oldInventory) {
      return res.status(500).send("Inventory not available");
    }
    //Make sure all wanted items exist in the inventory
    const inventoryMap = {};
    oldInventory.forEach(item => {
      inventoryMap[item.product_name] = item;
    });


    // Update inventory after sell
    for (const item of items) {
       const inventoryItem = inventoryMap[item.product_name];
      
      if (!inventoryItem) {
          alertMessages.push(`לא קיים במלאי: ${item.product_name}`);
          continue;
      }
      
     if (item.quantity > inventoryItem.current_quantity) {
          alertMessages.push(`לא ניתן למכור ${item.quantity} יחידות של "${item.product_name}" – יש רק ${inventoryItem.current_quantity} במלאי.`);
          continue;
     }
      
        await inventoryModel.decreaseQuantity(item.product_name, item.quantity);
    }

    //Get the updates inventory
    const inventory = await inventoryModel.getInventoryProducts();
    const supplierOrders = {}; // { supplierId: [ { product_id, quantity } ] }

    for (const item of inventory) {
      if (item.current_quantity < item.min_quantity) {
        // Look for the supplier with the cheapest price offer
        const supplier = await inventoryModel.findSupplierForProduct(item.product_name);
        if (!supplier) {
          alertMessages.push(`לא נמצא ספק עבור המוצר: ${item.product_name}`);
          continue;
        }

        // Calculate the quantity needed for the new order:
        // Take the maximum between the amount needed to refill inventory and the supplier's minimum order quantity
        const quantity = Math.max(item.min_quantity - item.current_quantity, supplier.min_quantity);

        //Organize orders by suppliers
        if (!supplierOrders[supplier.supplier_id]) {
          supplierOrders[supplier.supplier_id] = [];
        }
        supplierOrders[supplier.supplier_id].push({
          product_id: supplier.product_id,
          quantity: quantity,
          product_name: item.product_name
        });
      }
    }

    // Make orders from different suppliers
    for (const [supplierId, orderItems] of Object.entries(supplierOrders)) {
      await productModel.createOrderForSupplier(parseInt(supplierId), orderItems);
      const names = orderItems.map(i => `${i.quantity} ${i.product_name}`).join(', ');
      alertMessages.push(`בוצעה הזמנה לספק ${supplierId}: ${names}`);
    }
    console.log("messege:",alertMessages.join('\n'));
    res.redirect(`/grocery/inventory?msg=${encodeURIComponent(alertMessages.join('\n'))}`);

  } catch (error) {
    console.error("Purchase error:", error);
    res.status(500).send("Server error");
  }
}


module.exports={ renderInventoryPage, purchaseAndUpdateInventory}