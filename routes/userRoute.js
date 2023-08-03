const express = require('express');
const router = express.Router(); 
const userController = require('../server/controller/userController');
const authController = require('../server/middleware/authenticate-user');
const serviceRender = require('../server/services/render');

router.get('/', authController.authenticateUser, serviceRender.userDashboardPage);
router.get('/signup', serviceRender.userSignupPage);
router.get('/login', serviceRender.userLoginPage);
router.get('/logout', serviceRender.userLogout);

router.post('/signup', userController.registerUser);
router.post('/verify-otp', userController.loginOTPVerify);
router.post('/login', userController.userLogin);

module.exports = router;  