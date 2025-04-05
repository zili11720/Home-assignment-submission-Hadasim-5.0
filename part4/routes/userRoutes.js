const express = require('express');
const userController = require('../controllers/userController.js');
const router = express.Router();

router.post('/login', userController.login);

router.get('/logout', userController.logout);

router.post('/signup', userController.signup);

module.exports = router;