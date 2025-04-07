const sql = require('mssql');
const { db } = require('../DBconfig');

async function getInventoryProducts() {
    try {
        await sql.connect(db);
        const result = await sql.query`SELECT * FROM Inventory`;
    
        if (result.recordset.length === 0) {
          return null; 
        }
    
       return result.recordset
    
      } catch (err) {
        console.error('Error accessing DB:', err);
        throw err;
      }    
}

async function updatedInventory(product_name, quantity) {
  try {
    await sql.connect(db);

    // Check if the product already exists
    const result = await sql.query`
      SELECT * FROM Inventory WHERE product_name = ${product_name}
    `;

    if (result.recordset.length > 0) {
      // Product exists – update quantity
      await sql.query`
        UPDATE Inventory
        SET current_quantity = current_quantity + ${quantity}
        WHERE product_name = ${product_name}
      `;
    } else {
      // Product doesn't exist – insert new row with default min_quantity
      await sql.query`
        INSERT INTO Inventory (product_name, min_quantity, current_quantity)
        VALUES (${product_name}, 0, ${quantity})
      `;
    }
  } catch (err) {
    console.error('Error updating or inserting inventory:', err);
    throw err;
  }
}

async function decreaseQuantity(product_name, quantity) {
  try {
    await sql.connect(db);
    await sql.query`
      UPDATE Inventory
      SET current_quantity = current_quantity - ${quantity}
      WHERE product_name = ${product_name}
    `;
  } catch (err) {
    console.error('Error updating inventory:', err);
    throw err;
  }
}

async function findSupplierForProduct(product_name) {
  try {
    await sql.connect(db);
    const result = await sql.query`
      SELECT TOP 1 id AS product_id, supplier_id
      FROM Products
      WHERE product_name = ${product_name}
      ORDER BY price_per_unit ASC
    `;
    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (err) {
    console.error('Error fetching cheapest supplier for product:', err);
    throw err;
  }
}


module.exports={getInventoryProducts, decreaseQuantity, findSupplierForProduct,  updatedInventory}