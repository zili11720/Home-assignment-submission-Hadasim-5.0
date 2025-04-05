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
    throw err;
  }
}

module.exports = { userValidation };