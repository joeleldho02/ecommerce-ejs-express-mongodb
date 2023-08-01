const express = require('express');
const router = express.Router(); 
const path = require('path');
const bodyParser=require('body-parser');
const adminController = require('../server/controller/adminController');
const authController = require('../server/middleware/authenticate-admin');

const multer  = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, path.join(__dirname,'../public/img/products'));
    },
    filename: function(req, file, cb){
        const name = Date.now() + "-" + file.originalname;
        cb(null, name);
    }
})
const upload = multer({ storage: storage });

//------- LOGIN / LOGOUT --------//
router.get('/', function(req, res){
    if(req.session.loggedIn && req.session.isAdmin)
        res.render('admin-dashboard');
    else if(req.session.loggedIn)
        res.redirect('/user');
    else    
        res.redirect('/admin/login');
});

router.get('/login', function(req, res){
    if(req.session.loggedIn && req.session.isAdmin)
        res.redirect('/admin');
    else if(req.session.loggedIn)
        res.redirect('/user');
    else
        res.render('admin-login');
});

router.post('/login', adminController.adminLogin);

router.get('/logout', function(req, res){
    req.session.destroy();
    res.render('admin-login');
});



//------- PRODUCTS --------//
router.get('/products', authController.authenticateAdmin, adminController.getProducts);

router.get('/add-product', authController.authenticateAdmin, adminController.getCategories, function(req, res){
    res.render('page-add-product',{categories: res.locals.categories});
});
router.get('/edit-product/:id', authController.authenticateAdmin, adminController.getCategories, adminController.editProduct);

router.post('/add-product', upload.array('productImage', 5), adminController.addProduct);
router.post('/add-product', adminController.addProduct);
router.post('/edit-product', bodyParser.urlencoded(), adminController.updateProduct);
router.post('/delete-product', adminController.deleteProduct);



//------- CUSTOMERS --------//
router.get('/customers', authController.authenticateAdmin, adminController.getUsers);

router.post('/edit-user', adminController.updateUser); 
router.post('/delete-user', adminController.deleteUser);




//------- CUSTOMERS --------//
router.get('/category', authController.authenticateAdmin, adminController.getCategory);

router.post('/add-category', adminController.addCategory);
router.post('/edit-category', adminController.updateCategory);
router.post('/delete-category', adminController.deleteCategory);




//------- ORDERS --------//
router.get('/orders', authController.authenticateAdmin, function(req, res){
    res.render('page-orders');
});

module.exports = router;  