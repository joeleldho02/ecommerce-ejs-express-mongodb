const express = require('express');
const router = express.Router(); 
const userController = require('../server/controller/userController');
const categoryController = require('../server/controller/categoryController');
const cartController = require('../server/controller/cartController');
const orderController = require('../server/controller/orderController');
const authController = require('../server/middleware/authenticate-user');
const serviceRender = require('../server/services/render');

router.get('/', authController.authenticateUser, categoryController.getListedCategories, 
    cartController.getAllCartItems, cartController.getCartItemsCount, 
    userController.getAllAddresses, orderController.getAllOrdersOfUser,
    serviceRender.userDashboardPage);
router.get('/signup', serviceRender.userSignupPage);
router.get('/verify-otp', serviceRender.userVerifyOtpPage);
router.get('/login', serviceRender.userLoginPage);
router.get('/logout', serviceRender.userLogout);
router.get('/view-order/:id', authController.authenticateUser, categoryController.getListedCategories, orderController.getSingleOrderDetails, cartController.getCartItemsCount, serviceRender.getUserOrderDetailsPage)

router.post('/signup', userController.registerUser);
router.post('/verify-otp', userController.loginOTPVerify);
router.post('/login', userController.userLogin);

router.post('/add-new-address', userController.addNewAddress);
router.post('/delete-address', userController.deleteAddress);
router.post('/edit-address', userController.editAddress);


module.exports = router;  