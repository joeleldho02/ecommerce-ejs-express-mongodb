const express = require('express');
const router = express.Router(); 
const path = require('path');
const adminController = require('../server/controller/adminController');
const userController = require('../server/controller/userController');
const productController = require('../server/controller/productController');
const categoryController = require('../server/controller/categoryController');
const authController = require('../server/middleware/authenticate-admin');
const uploadController = require('../server/middleware/upload-image');
const serviceRender = require('../server/services/render');




//------- LOGIN / LOGOUT --------//
router.get('/', serviceRender.adminDashboardPage);
router.get('/login', serviceRender.adminLoginPage);
router.get('/logout', authController.authenticateAdmin, serviceRender.adminLogout);

router.post('/login', adminController.adminLogin);




//------- PRODUCTS --------//
router.get('/products', authController.authenticateAdmin, productController.getAllProducts, serviceRender.getAdminProductPage);
router.get('/add-product', authController.authenticateAdmin, categoryController.getListedCategories, serviceRender.getAddProductPage);
router.get('/edit-product/:id', authController.authenticateAdmin, categoryController.getListedCategories, productController.getEditProductItemDetails, serviceRender.getEditProductPage);

router.post('/add-product', authController.authenticateAdmin, uploadController.uploadProductImage.array('productImage', 5), productController.addNewProduct);// , uploadController.resizeImages
router.post('/edit-product', authController.authenticateAdmin, productController.updateProductItem);
router.post('/delete-product', authController.authenticateAdmin, productController.deleteProductItem);




//------- CUSTOMERS --------//
router.get('/customers', authController.authenticateAdmin, userController.getAllUsers, serviceRender.getAdminUsersPage);

router.post('/edit-user', authController.authenticateAdmin, userController.updateSinlgleUser); 
router.post('/delete-user', authController.authenticateAdmin, userController.deleteUser);




//------- CATEGORY --------//
router.get('/category', authController.authenticateAdmin, categoryController.getAllCategoryDetails, serviceRender.getAdminCategoryPage);

router.post('/add-category', authController.authenticateAdmin, categoryController.addCategory);
router.post('/edit-category', authController.authenticateAdmin, categoryController.updateCategory);
router.post('/delete-category', authController.authenticateAdmin, categoryController.deleteCategory);




//------- ORDERS --------//
router.get('/orders', authController.authenticateAdmin, serviceRender.getAdminOrdersPage);


module.exports = router;  