const express = require('express');
const router = express.Router(); 
const productController = require('../server/controller/productController');
const categoryController = require('../server/controller/categoryController');
const serviceRender = require('../server/services/render');

router.get('/', categoryController.getListedCategories, serviceRender.homePage);
router.get('/:category', productController.getProductsOfSingleCategory, categoryController.getListedCategories, serviceRender.categoryProductsPage);
router.get('/:category/:id', productController.getProductItemById, productController.getProductsOfSingleCategory, categoryController.getListedCategories, serviceRender.productDetailsPage);

module.exports = router;  