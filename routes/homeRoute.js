const express = require('express');
const router = express.Router(); 
const productController = require('../server/controller/productController');
const categoryController = require('../server/controller/categoryController');
const serviceRender = require('../server/services/render');

router.get('/', categoryController.getListedCategories, serviceRender.homePage);
router.get('/cart', (req, res) => {
    res.render('page-cart');
})
router.get('/:category', categoryController.getListedCategories, productController.getProductsOfSingleCategory, serviceRender.categoryProductsPage);
router.get('/:category/:id', categoryController.getListedCategories, productController.getProductsOfSingleCategory, productController.getProductItemById, serviceRender.productDetailsPage);


module.exports = router;  