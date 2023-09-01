const express = require('express');
const router = express.Router(); 
const productController = require('../server/controller/productController');
const categoryController = require('../server/controller/categoryController');
const cartController = require('../server/controller/cartController');
const orderController = require('../server/controller/orderController');
const userController = require('../server/controller/userController');
const couponController = require('../server/controller/couponController');
const bannerController = require('../server/controller/bannerController');
const serviceRender = require('../server/services/render');
const authController = require('../server/middleware/authenticate-user');

router.get('/', categoryController.getListedCategories, cartController.getCartItemsCount, bannerController.getAllBannerDetails, productController.getFeaturedProducts, productController.getNewArrivalProducts, serviceRender.homePage);
router.get('/cart', authController.authenticateUser, categoryController.getListedCategories, cartController.getAllCartItems, cartController.getCartItemsCount, serviceRender.getUserCartPage);
router.get('/checkout', authController.authenticateUser, categoryController.getListedCategories, cartController.getAllCartItems, cartController.getCartItemsCount, userController.getAllAddresses, userController.getWalletBalance, serviceRender.getUserCheckoutPage);
router.get('/place-order', authController.authenticateUser, categoryController.getListedCategories, cartController.getCartItemsCount, orderController.getOrderSummaryDetails, serviceRender.getOrderPlacedPage);
router.get('/contact', categoryController.getListedCategories, cartController.getAllCartItems, cartController.getCartItemsCount, serviceRender.contactUs);
router.get('/search', categoryController.getListedCategories, cartController.getCartItemsCount, cartController.getAllCartItems, productController.getSearchProducts, serviceRender.categoryProductsPage);
router.get('/add-to-cart/:id', authController.authenticateUser, cartController.addToCart);
router.get('/remove-cart-item/:id', authController.authenticateUser, cartController.removeCartItem);

router.post('/change-cart-item-quantity', cartController.changeCartItemQty);
router.post('/apply-coupon', couponController.applyCoupon);
router.post('/place-order', authController.authenticateUser, categoryController.getListedCategories, cartController.getUserCart, userController.getAllAddresses, orderController.placeOrder);
router.post('/verify-payment', orderController.verifyRazorpayPayment);

router.get('/:category', categoryController.getListedCategories, productController.getProductsOfSingleCategory, productController.getNewProductsOfCategory, cartController.getCartItemsCount, cartController.getAllCartItems, serviceRender.categoryProductsPage);
router.get('/:category/:id', categoryController.getListedCategories, productController.getProductsOfSingleCategory, productController.getNewProductsOfCategory, productController.getProductItemById, cartController.getAllCartItems, cartController.getCartItemsCount, serviceRender.productDetailsPage);


module.exports = router;  