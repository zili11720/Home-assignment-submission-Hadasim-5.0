function requireLogin(req, res, next) {
    if (req.session && req.session.userId) {
      return next();
    } else {
      return res.redirect("/grocery");
    }
  }
  
  module.exports = { requireLogin };
  