const express = require('express');
const router = express.Router(); 
const homeController = require('../server/controller/homeController');
const adminController = require('../server/controller/adminController');

router.get('/', adminController.getCategories, function(req, res){
    //res.redirect('/admin');
    res.render('home',{
        categories: res.locals.categories
    });
});
router.get('/:category',adminController.getCategories, homeController.getProducts, function(req, res){
    //res.redirect('/admin');
    res.render('page-category-products', {
        categories: res.locals.categories,
        products : res.locals.products
    });
});
router.get('/:category/:id',adminController.getCategories, homeController.getProductById, homeController.getProducts, function(req, res){
    //res.redirect('/admin');
    res.render('page-product-details', {
        categories: res.locals.categories,
        product: res.locals.product,
        relatedProducts: res.locals.products
    });
});

module.exports = router;  