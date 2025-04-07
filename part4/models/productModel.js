const sql = require('mssql');
const { db } = require('../DBconfig');
const inventoryModel = require('../models/inventoryModel');

async function getSupplierProducts(supplierId) {
  try {
    await sql.connect(db);

    const result = await sql.query`SELECT * FROM Products WHERE supplier_id = ${supplierId}`;

    
    if (result.recordset.length === 0) {
      return null; 
    }

   return result.recordset

  } catch (err) {
    console.error('Error accessing DB:', err);
    throw err;
  }
}

async function getAllSuppliers() {
  try {
    await sql.connect(db);
    const result = await sql.query`SELECT id, company_name FROM Suppliers`;
    return result.recordset;
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    throw err;
  }
}

async function addNewProduct(supplierId, product) {
  try {
    await sql.connect(db);

    const { product_name, price_per_unit, min_quantity } = product;

    await sql.query`
      INSERT INTO Products (supplier_id, product_name, price_per_unit, min_quantity)
      VALUES (${supplierId}, ${product_name}, ${price_per_unit}, ${min_quantity});
    `;

  } catch (err) {
    console.error("Error inserting new product:", err);
    throw err;
  }
}


async function createOrderForSupplier(supplierId, items) {
  try {
    await sql.connect(db);

    // Create a new order
    const insertOrderResult = await sql.query`
      INSERT INTO Orders (supplier_id, order_date, status)
      OUTPUT INSERTED.id
      VALUES (${supplierId}, GETDATE(), 'Pending');
    `;

    const orderId = insertOrderResult.recordset[0].id;

    // adding each item to orderItems
    for (const item of items) {
      await sql.query`
        INSERT INTO OrderItems (order_id, product_id, quantity)
        VALUES (${orderId}, ${item.product_id}, ${item.quantity});
      `;

      //update the grocery inventory for each item
      const result = await sql.query`SELECT product_name FROM Products WHERE id = ${item.product_id}`;
      const product_name = result.recordset[0].product_name;
      await inventoryModel.updatedInventory(product_name,item.quantity)
    }

  } catch (err) {
    console.error('Error creating order:', err);
    throw err;
  }
}


module.exports = {getSupplierProducts , addNewProduct,  getAllSuppliers, createOrderForSupplier};