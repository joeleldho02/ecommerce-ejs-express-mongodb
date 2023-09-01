const express = require('express');
const router = express.Router(); 
const path = require('path');
const adminController = require('../server/controller/adminController');
const userController = require('../server/controller/userController');
const productController = require('../server/controller/productController');
const categoryController = require('../server/controller/categoryController');
const orderController = require('../server/controller/orderController');
const couponController = require('../server/controller/couponController');
const bannerController = require('../server/controller/bannerController');
const authController = require('../server/middleware/authenticate-admin');
const uploadController = require('../server/middleware/upload-image');
const serviceRender = require('../server/services/render');


//------- LOGIN / LOGOUT --------//
router.get('/', orderController.getOrderCount, productController.getProductCount,
            categoryController.getCategoryCount, orderController.getTotalRevenue, 
            orderController.getMonthlyTotalRevenue, orderController.getOrderCountPercent,
            userController.getNewUsers, orderController.getCategoryPerformance, serviceRender.adminDashboardPage);
router.get('/login', serviceRender.adminLoginPage);
router.get('/logout', authController.authenticateAdmin, serviceRender.adminLogout);

router.post('/login', adminController.adminLogin);


//------- PRODUCTS --------//
router.get('/products', authController.authenticateAdmin, categoryController.getListedCategories, productController.getAllProducts, serviceRender.getAdminProductPage);
router.get('/add-product', authController.authenticateAdmin, categoryController.getListedCategories, serviceRender.getAddProductPage);
router.get('/edit-product/:id', authController.authenticateAdmin, categoryController.getListedCategories, productController.getEditProductItemDetails, serviceRender.getEditProductPage);

router.post('/add-product', authController.authenticateAdmin, uploadController.uploadProductImage.array('productImage', 5), productController.addNewProduct);// , uploadController.resizeImages
router.post('/edit-product', authController.authenticateAdmin, uploadController.uploadProductImage.array('productImage', 5), productController.updateProductItem);
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
router.get('/orders/:id', authController.authenticateAdmin, categoryController.getListedCategories, orderController.getSingleOrderDetails, serviceRender.getAdminViewOrderPage)
router.get('/orders', authController.authenticateAdmin, orderController.getAllUsersOrders, serviceRender.getAdminOrdersPage);
router.post('/update-order', orderController.updateOrderStatus);

//------- COUPONS --------//
router.get('/coupons', authController.authenticateAdmin, couponController.getAllCouponDetails, serviceRender.getAdminCouponPage);

router.post('/add-coupon', authController.authenticateAdmin, couponController.addCoupon);
router.post('/edit-coupon', authController.authenticateAdmin, couponController.updateCoupon);
router.post('/delete-coupon', authController.authenticateAdmin, couponController.deleteCoupon);

//------- BANNERS --------//
router.get('/banners', authController.authenticateAdmin, bannerController.getAllBannerDetails, serviceRender.getAdminBannerPage);

router.post('/add-banner', authController.authenticateAdmin, uploadController.uploadBannerImage.single('image'), bannerController.addBanner);
router.post('/edit-banner', authController.authenticateAdmin, uploadController.uploadBannerImage.single('image'), bannerController.updateBanner);
router.post('/delete-banner', authController.authenticateAdmin, bannerController.deleteBanner);

//------- SALES --------//
router.get('/sales', authController.authenticateAdmin, categoryController.getListedCategories, orderController.getOrderSales, serviceRender.getAdminSalesPage);
// router.post('/get-report', authController.authenticateAdmin, orderController.getOrderSales);
router.get('/get-monthly-order-stats', authController.authenticateAdmin, orderController.getMonthlyOrdersForChart);

module.exports = router;  