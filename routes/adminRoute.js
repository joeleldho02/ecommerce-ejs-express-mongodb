const express = require('express');
const router = express.Router(); 
const adminController = require('../server/controller/adminController');

//------- LOGIN / LOGOUT --------//
router.get('/', function(req, res){
    res.render('admin-dashboard');
});

router.get('/login', function(req, res){
    res.render('admin-login');
});

router.post('/login', function(req, res){
    //res.send('login success');
    console.log(req.body);
    res.render('admin-dashboard');
});

router.get('/logout', function(req, res){
    res.render('admin-login');
});

//------- PRODUCTS --------//
router.get('/products', adminController.getProducts);

router.get('/add-product', function(req, res){
    res.render('page-add-product');
});
router.get('/edit-product/:id',adminController.editProduct);

router.post('/add-product', adminController.addProduct);
router.post('/edit-product',adminController.updateProduct);
router.post('/delete-product', adminController.deleteProduct);

//------- CUSTOMERS --------//
router.get('/customers', adminController.getUsers);

router.post('/edit-user', adminController.updateUser); 
router.post('/delete-user', adminController.deleteUser);

//------- CUSTOMERS --------//
router.get('/category', adminController.getCategory);

router.post('/add-category', adminController.addCategory);
router.post('/edit-category', adminController.updateCategory);
router.post('/delete-category', adminController.deleteCategory);




//------- ORDERS --------//
router.get('/orders', function(req, res){
    res.render('page-orders');
});

module.exports = router;  