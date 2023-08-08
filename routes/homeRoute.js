const express = require('express');
const router = express.Router(); 
const productController = require('../server/controller/productController');
const categoryController = require('../server/controller/categoryController');
const cartController = require('../server/controller/cartController');
const serviceRender = require('../server/services/render');
const authController = require('../server/middleware/authenticate-user');

router.get('/', categoryController.getListedCategories, cartController.getCartItemsCount, serviceRender.homePage);
router.get('/cart', categoryController.getListedCategories, cartController.getAllCartItems, cartController.getCartItemsCount, (req, res) => {
    res.render('page-cart', {
        cartItems : res.locals.cartItems,
        subTotal : res.locals.subTotal,
        itemsCount : res.locals.itemsCount
    });
})

router.get('/checkout', authController.authenticateUser, (req, res) => {
    res.render('page-checkout', {
        cartItems : res.locals.cartItems,
        subTotal : res.locals.subTotal,
        itemsCount : res.locals.itemsCount
    });
});

router.get('/add-to-cart/:id', authController.authenticateUser, cartController.addToCart,  (req, res) => {
    res.send("adding to cart");
});
router.get('/remove-cart-item/:id', authController.authenticateUser, cartController.removeCartItem, (req, res) => {
    res.redirect('/cart');
});

router.get('/:category', categoryController.getListedCategories, productController.getProductsOfSingleCategory, cartController.getCartItemsCount, serviceRender.categoryProductsPage);
router.get('/:category/:id', categoryController.getListedCategories, productController.getProductsOfSingleCategory, productController.getProductItemById, cartController.getCartItemsCount, serviceRender.productDetailsPage);


module.exports = router;  