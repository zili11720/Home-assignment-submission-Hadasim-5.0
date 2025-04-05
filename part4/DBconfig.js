//somee db connection details
const db = {
    user: 'Zili_SQLLogin_1',
    password: 'yn6pan7eb4',
    server: 'grocerySuppliers.mssql.somee.com',
    database: 'grocerySuppliers',
    options: {
      encrypt: true,
      enableArithAbort: true,
      trustServerCertificate: true,
      port: 1433,
    }
  };
  
  module.exports = { db};