const express = require('express');
const router = express.Router(); 
const {authenticateUser} = require('../server/middleware/authenticate-user');
const {getListedCategories} = require('../server/controller/categoryController');
const {getAllCartItems, getCartItemsCount} = require('../server/controller/cartController');
const {getAllOrdersOfUser, getSingleOrderDetails, generateInvoicePDF, cancelOrder, returnOrder} = require('../server/controller/orderController');
const {userDashboardPage, userSignupPage, userVerifyOtpPage, userLoginPage, userLogout, getUserOrderDetailsPage, getUserOrderInvoicePage} = require('../server/services/render');
const {getAllAddresses, getUserWalletDetails, getWalletBalance, registerUser, loginOTPVerify, userLogin, addNewAddress, deleteAddress, editAddress, addToWalletGetRazorpay, verifyWalletRazorpayPayment} = require('../server/controller/userController');

router.get('/', authenticateUser, getListedCategories, getAllCartItems, getCartItemsCount, getAllAddresses, getAllOrdersOfUser, getUserWalletDetails, getWalletBalance, userDashboardPage);
router.get('/signup', getListedCategories, userSignupPage);
router.get('/verify-otp', getListedCategories, userVerifyOtpPage);
router.get('/login', getListedCategories, userLoginPage);
router.get('/logout', userLogout);

router.get('/view-order/:id', authenticateUser, getListedCategories, getSingleOrderDetails, getCartItemsCount, getUserOrderDetailsPage)
router.get('/order-invoice/:id', authenticateUser, getListedCategories, getSingleOrderDetails, getCartItemsCount, getUserOrderInvoicePage)
router.get('/download-invoice/:id', authenticateUser, getListedCategories, getSingleOrderDetails, generateInvoicePDF);
 
router.post('/signup', registerUser);
router.post('/verify-otp', loginOTPVerify);
router.post('/login', userLogin);

router.post('/add-new-address', authenticateUser, addNewAddress);
router.post('/delete-address',authenticateUser,  deleteAddress);
router.post('/edit-address', authenticateUser, editAddress);

router.post('/add-to-wallet', authenticateUser, addToWalletGetRazorpay);
router.post('/verify-wallet-payment', authenticateUser, verifyWalletRazorpayPayment);

router.post('/cancel-order', authenticateUser, cancelOrder);
router.post('/return-order', authenticateUser, returnOrder);

module.exports = router;  