const userModel = require('../models/userModel');

async function login(req, res) {
  const { username, password } = req.body;

  try {
    const isValidUser = await userModel.userValidation(username, password);
  
    if (isValidUser) {
      req.session.userId = isValidUser.id;
      req.session.supplier_id = isValidUser.supplier_id;
      req.session.role = isValidUser.role;
      
      res.redirect('/grocery/products') ;
      
    } else {
      // If invalid, send back an error message without 
      res.render('pages/index', { alertMessage: 'Wrong username or password!' });
    }
  } catch (err) {
    res.status(500).send('Server Error: ' + err.message);
  }
}

module.exports = {
  login
};
