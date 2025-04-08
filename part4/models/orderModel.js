const sql = require('mssql');
const { db } = require('../DBconfig');


async function getSupplierOrders(supplierId) {
  try {
    await sql.connect(db);
    let result=null;

    //Get all orders from a specific supplier
    if(supplierId){
      result = await sql.query`
      SELECT 
        o.id AS order_id,
        o.order_date,
        o.status,
        p.product_name,
        oi.quantity
      FROM orders o
      JOIN orderItems oi ON o.id = oi.order_id
      JOIN products p ON p.id=oi.product_id
      WHERE o.supplier_id = ${supplierId}
      ORDER BY o.order_date DESC;
    `;
    }

    //get all orders for manager
    else{   
      result = await sql.query`
      SELECT 
        o.id AS order_id,
        o.order_date,
        o.status,
        p.product_name,
        oi.quantity
      FROM orders o
      JOIN orderItems oi ON o.id = oi.order_id
      JOIN products p ON p.id=oi.product_id
      ORDER BY o.order_date DESC;
    `;

    }

    if (result.recordset.length === 0) {
      return []; //no orders where found
    }

    // structure: [{order_id, order_date, status, items: [...]}, ...]
    const ordersMap = new Map();

    for (const row of result.recordset) {
      const { order_id, order_date, status, product_name, quantity } = row;

      if (!ordersMap.has(order_id)) {
        ordersMap.set(order_id, {
          order_id,
          order_date,
          status,
          items: []
        });
      }

      ordersMap.get(order_id).items.push({
        product_name,
        quantity
      });
    }

    return Array.from(ordersMap.values());

  } catch (err) {
    console.error('Error accessing DB:', err);
    throw err;
  }
}


async function changeStatus(order_id,role){
  try{
    await sql.connect(db);

    //A supplier can change status from 'Pending' to 'In progress'
    if(role=='supplier'){
      await sql.query`
      UPDATE orders
      SET status = 'In Progress'
      WHERE id = ${order_id}
    `;
    }
    else{ 
      //The owner can change status from 'In progress' to 'Completed'
      await sql.query`
      UPDATE orders
      SET status = 'Completed'
      WHERE id = ${order_id}
    `;
     }
  }
  catch(err){
    console.error('Error accessing DB:', err);
    throw err;
  }
}

module.exports = { getSupplierOrders ,changeStatus
};
