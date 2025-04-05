const sql = require('mssql');
const bcrypt = require('bcrypt');
const { db } = require('../DBconfig');

async function userValidation(username, password) {
  try {
    await sql.connect(db);

    const result = await sql.query`SELECT * FROM Users WHERE username = ${username}`;
    
    if (result.recordset.length === 0) {
      return null; //user doesn't exist
    }

    const user = result.recordset[0];
    const hash = user.password_hash;

    const isMatch = await bcrypt.compare(password, hash);

    return isMatch ? user : null;

  } catch (err) {
    console.error('Error accessing DB:', err);
  }
}

async function registerUser(company) {
  try {
    await sql.connect(db);
    
    const {company_name,phone,representative_name,password} = company;

    //Make sure the company isn't already registered
    const usernameExists = await doesComapanyExist(company_name);
    if (usernameExists) {
      throw new Error("שם משתמש כבר קיים במערכת");
    }

    const password_hash= await bcrypt.hash(password, 10);

    //insert the new supplier
    await sql.query`
    INSERT INTO Suppliers(company_name, phone, representative_name)
    VALUES (${company_name}, ${phone},${representative_name});
    `;
    
    //get new supplier id number (auto id)
    const result = await sql.query`SELECT id FROM Suppliers WHERE company_name = ${company_name}`;
    const supplier_id = result.recordset[0].id;


    //insert the new user
    await sql.query`
    INSERT INTO Users(username, password_hash, role, supplier_id)
    VALUES (${company_name}, ${password_hash}, 'supplier', ${supplier_id} );
    `;

  } catch (err) {
    console.error('Error accessing DB:', err);
    throw err;
  }
}

async function doesComapanyExist(name) {
  try {
    await sql.connect(db);
    const result = await sql.query`
      SELECT * FROM Suppliers WHERE company_name = ${name};
    `;
    return result.recordset.length > 0;
  } catch (err) {
    console.error("Error checking username:", err);
    throw err;
  }
}

module.exports = { userValidation, registerUser};