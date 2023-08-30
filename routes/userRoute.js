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
    userController.getUserWalletDetails, userController.getWalletBalance, serviceRender.userDashboardPage);
router.get('/signup', serviceRender.userSignupPage);
router.get('/verify-otp', serviceRender.userVerifyOtpPage);
router.get('/login', serviceRender.userLoginPage);
router.get('/logout', serviceRender.userLogout);
router.get('/view-order/:id', authController.authenticateUser, categoryController.getListedCategories, orderController.getSingleOrderDetails, cartController.getCartItemsCount, serviceRender.getUserOrderDetailsPage)
router.get('/order-invoice/:id', authController.authenticateUser, categoryController.getListedCategories, orderController.getSingleOrderDetails, cartController.getCartItemsCount, serviceRender.getUserOrderInvoicePage)
router.get('/download-invoice/:id', authController.authenticateUser, categoryController.getListedCategories, orderController.getSingleOrderDetails, orderController.generateInvoicePDF);
 
router.post('/signup', userController.registerUser);
router.post('/verify-otp', userController.loginOTPVerify);
router.post('/login', userController.userLogin);

router.post('/add-new-address', authController.authenticateUser, userController.addNewAddress);
router.post('/delete-address',authController.authenticateUser,  userController.deleteAddress);
router.post('/edit-address', authController.authenticateUser, userController.editAddress);

router.post('/add-to-wallet', authController.authenticateUser, userController.addToWalletGetRazorpay);
router.post('/verify-wallet-payment', authController.authenticateUser, userController.verifyWalletRazorpayPayment);

router.get('/cancel-order/:id', authController.authenticateUser, orderController.cancelOrder);
router.get('/return-order/:id', authController.authenticateUser, orderController.returnOrder);

module.exports = router;  