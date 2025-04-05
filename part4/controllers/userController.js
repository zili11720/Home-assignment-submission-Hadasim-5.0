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

async function logout(req,res){
  try{
    req.session.destroy(); // Destroy session

   res.render('pages/index'); //redirect to login page

  }
  catch(err){
    console.error('Error loging out:', err);
  }   
}

async function signup(req,res){
  try{
    const {company_name,phone,representative_name,password} =req.body;
    console.log("hi from signup");
    await userModel.registerUser(
      { company_name,
        phone,
        representative_name,
        password }
    );
    res.redirect('/grocery/products'); //redirect to product page
  }
  catch(err){
      res.render('pages/index', {
      alertMessage: err.message || "שגיאה בהוספת משתמש"
    });
  }   
}

module.exports = {
  login,logout,signup
};
