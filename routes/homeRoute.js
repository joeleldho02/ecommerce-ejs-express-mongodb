const express = require('express');
const router = express.Router(); 
const productController = require('../server/controller/productController');
const categoryController = require('../server/controller/categoryController');
const cartController = require('../server/controller/cartController');
const orderController = require('../server/controller/orderController');
const userController = require('../server/controller/userController');
const serviceRender = require('../server/services/render');
const authController = require('../server/middleware/authenticate-user');

router.get('/', categoryController.getListedCategories, cartController.getCartItemsCount, serviceRender.homePage);
router.get('/cart', categoryController.getListedCategories, cartController.getAllCartItems, cartController.getCartItemsCount, serviceRender.getUserCartPage);
router.get('/checkout', authController.authenticateUser, categoryController.getListedCategories, cartController.getAllCartItems, cartController.getCartItemsCount, userController.getAllAddresses, serviceRender.getUserCheckoutPage);
router.get('/place-order', authController.authenticateUser, categoryController.getListedCategories, cartController.getCartItemsCount, orderController.getOrderSummaryDetails, serviceRender.getOrderPlacedPage);

router.get('/add-to-cart/:id', cartController.addToCart);
router.get('/remove-cart-item/:id', authController.authenticateUser, cartController.removeCartItem);
router.post('/change-cart-item-quantity', cartController.changeCartItemQty);


router.post('/place-order', authController.authenticateUser, categoryController.getListedCategories, cartController.getUserCart, userController.getAllAddresses, orderController.placeOrder);

router.get('/:category', categoryController.getListedCategories, productController.getProductsOfSingleCategory, cartController.getCartItemsCount, serviceRender.categoryProductsPage);
router.get('/:category/:id', categoryController.getListedCategories, productController.getProductsOfSingleCategory, productController.getProductItemById, cartController.getCartItemsCount, serviceRender.productDetailsPage);


module.exports = router;  