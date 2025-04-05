const sql = require('mssql');
const { db } = require('../DBconfig');

async function getSupplierProducts(supplierId) {
  try {
    await sql.connect(db);

    const result = await sql.query`SELECT * FROM Products WHERE supplier_id = ${supplierId}`;

    
    if (result.recordset.length === 0) {
      return null; //user doesn't exist
    }

   return result.recordset

  } catch (err) {
    console.error('Error accessing DB:', err);
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


module.exports = {getSupplierProducts , addNewProduct};