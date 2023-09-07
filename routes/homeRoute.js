const express = require('express');
const router = express.Router(); 
const {authenticateUser} = require('../server/middleware/authenticate-user');
const {applyCoupon} = require('../server/controller/couponController');
const {getAllBannerDetails} = require('../server/controller/bannerController');
const {getListedCategories} = require('../server/controller/categoryController');
const {getAllAddresses, getWalletBalance} = require('../server/controller/userController');
const {getOrderSummaryDetails, placeOrder, verifyRazorpayPayment} = require('../server/controller/orderController');
const {getCartItemsCount, getAllCartItems, changeCartItemQty, addToCart, removeCartItem, getUserCart} = require('../server/controller/cartController');
const {homePage, getUserCartPage, getUserCheckoutPage, getOrderPlacedPage, contactUs, categoryProductsPage, productDetailsPage, aboutUs} = require('../server/services/render');
const {getFeaturedProducts, getSearchProducts, getProductsOfSingleCategory, getNewProductsOfCategory, getNewArrivalProducts, getProductItemById} = require('../server/controller/productController');

router.get('/', getListedCategories, getCartItemsCount, getAllBannerDetails, getFeaturedProducts, getNewArrivalProducts, homePage);
router.get('/cart', authenticateUser, getListedCategories, getAllCartItems, getCartItemsCount, getUserCartPage);
router.get('/checkout', authenticateUser, getListedCategories, getAllCartItems, getCartItemsCount, getAllAddresses, getWalletBalance, getUserCheckoutPage);
router.get('/place-order', authenticateUser, getListedCategories, getCartItemsCount, getOrderSummaryDetails, getOrderPlacedPage);
router.get('/contact', getListedCategories, getAllCartItems, getCartItemsCount, contactUs);
router.get('/about', getListedCategories, getAllCartItems, getCartItemsCount, aboutUs);
router.get('/search', getListedCategories, getCartItemsCount, getAllCartItems, getSearchProducts, categoryProductsPage);
router.get('/add-to-cart/:id', authenticateUser, addToCart);
router.get('/remove-cart-item/:id', authenticateUser, removeCartItem);

router.post('/change-cart-item-quantity', changeCartItemQty);
router.post('/apply-coupon', applyCoupon);
router.post('/place-order', authenticateUser, getListedCategories, getUserCart, getAllAddresses, placeOrder);
router.post('/verify-payment', verifyRazorpayPayment);

router.get('/:category', getListedCategories, getProductsOfSingleCategory, getNewProductsOfCategory, getCartItemsCount, getAllCartItems, categoryProductsPage);
router.get('/:category/:id', getListedCategories, getProductsOfSingleCategory, getNewProductsOfCategory, getProductItemById, getAllCartItems, getCartItemsCount, productDetailsPage);


module.exports = router;  