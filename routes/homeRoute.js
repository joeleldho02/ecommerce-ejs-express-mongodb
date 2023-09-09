const express = require('express');
const router = express.Router(); 
const {authenticateUser} = require('../server/middleware/authenticate-user');
const {applyCoupon} = require('../server/controller/couponController');
const {getAllBannerDetails} = require('../server/controller/bannerController');
const {getListedCategories} = require('../server/controller/categoryController');
const {getAllAddresses, getWalletBalance} = require('../server/controller/userController');
const {getOrderSummaryDetails, placeOrder, verifyRazorpayPayment} = require('../server/controller/orderController');
const {getCartItemsCount, getAllCartItems, changeCartItemQty, addToCart, removeCartItem, getUserCart, addItemToUserCart, removeUserCartItem, getAllWishlistItems, addItemToWishlist, getWishItemsCount} = require('../server/controller/cartController');
const {homePage, getUserCartPage, getUserCheckoutPage, getOrderPlacedPage, contactUs, categoryProductsPage, productDetailsPage, aboutUs, getUserWishlistPage} = require('../server/services/render');
const {getFeaturedProducts, getSearchProducts, getProductsOfSingleCategory, getNewProductsOfCategory, getNewArrivalProducts, getProductItemById} = require('../server/controller/productController');

router.get('/', getListedCategories, getCartItemsCount, getWishItemsCount, getAllBannerDetails, getFeaturedProducts, getNewArrivalProducts, homePage);
router.get('/cart', authenticateUser, getListedCategories, getAllCartItems, getWishItemsCount, getCartItemsCount, getUserCartPage);
router.get('/wishlist', authenticateUser, getListedCategories, getAllCartItems, getWishItemsCount, getCartItemsCount, getAllWishlistItems, getUserWishlistPage);
router.get('/checkout', authenticateUser, getListedCategories, getAllCartItems, getCartItemsCount, getWishItemsCount, getAllAddresses, getWalletBalance, getUserCheckoutPage);
router.get('/place-order', authenticateUser, getListedCategories, getCartItemsCount, getWishItemsCount, getOrderSummaryDetails, getOrderPlacedPage);
router.get('/contact', getListedCategories, getAllCartItems, getCartItemsCount, getWishItemsCount, contactUs);
router.get('/about', getListedCategories, getAllCartItems, getCartItemsCount, getWishItemsCount, aboutUs);
router.get('/search', getListedCategories, getCartItemsCount, getAllCartItems, getWishItemsCount, getSearchProducts, categoryProductsPage);
router.get('/add-to-cart/:id', authenticateUser, addToCart);
router.get('/remove-cart-item/:id', authenticateUser, removeCartItem);
router.get('/add-to-wishlist/:id', authenticateUser, addItemToWishlist);

router.post('/change-cart-item-quantity', changeCartItemQty);
router.post('/apply-coupon', applyCoupon);
router.post('/place-order', authenticateUser, getListedCategories, getUserCart, getAllAddresses, placeOrder);
router.post('/verify-payment', verifyRazorpayPayment);

router.get('/:category', getListedCategories, getProductsOfSingleCategory, getNewProductsOfCategory, getCartItemsCount, getWishItemsCount, getAllCartItems, categoryProductsPage);
router.get('/:category/:id', getListedCategories, getProductsOfSingleCategory, getNewProductsOfCategory, getProductItemById, getAllCartItems, getWishItemsCount, getCartItemsCount, productDetailsPage);


module.exports = router;  