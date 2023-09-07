const express = require('express');
const router = express.Router(); 
const {adminLogin} = require('../server/controller/adminController');
const {buildPDF} = require('../server/helper/invoicePDF');
const {authenticateAdmin} = require('../server/middleware/authenticate-admin');
const {getNewUsers, getAllUsers, updateSinlgleUser, deleteUser} = require('../server/controller/userController');
const {getAllCouponDetails, addCoupon, updateCoupon, deleteCoupon} = require('../server/controller/couponController');
const {getAllBannerDetails, addBanner, updateBanner, deleteBanner} = require('../server/controller/bannerController');
const {getCategoryCount, getListedCategories, getAllCategoryDetails, addCategory, updateCategory, deleteCategory} = require('../server/controller/categoryController');
const {getProductCount, getAllProducts, getEditProductItemDetails, addNewProduct, updateProductItem, deleteProductItem} = require('../server/controller/productController');
const {uploadProductImage, uploadBannerImage, resizeImages} = require('../server/middleware/upload-image');
const {getOrderCount, getTotalRevenue, getMonthlyTotalRevenue, getOrderCountPercent, getCategoryPerformance, getSingleOrderDetails, getAllUsersOrders, updateOrderStatus, getOrderSales, getMonthlyOrdersForChart} = require('../server/controller/orderController');
const {adminDashboardPage, adminLoginPage, adminLogout, getAdminProductPage, getAddProductPage, getEditProductPage, getAdminUsersPage, getAdminCategoryPage, getAdminViewOrderPage, getAdminOrdersPage, getAdminCouponPage, getAdminBannerPage, getAdminSalesPage} = require('../server/services/render');


//------- LOGIN / LOGOUT --------//
router.get('/', getOrderCount, getProductCount, getCategoryCount, getTotalRevenue, getMonthlyTotalRevenue, getOrderCountPercent,getNewUsers, getCategoryPerformance, adminDashboardPage);
router.get('/login', adminLoginPage);
router.get('/logout', authenticateAdmin, adminLogout);

router.post('/login', adminLogin);


//------- PRODUCTS --------//
router.get('/products', authenticateAdmin, getListedCategories, getAllProducts, getAdminProductPage);
router.get('/add-product', authenticateAdmin, getListedCategories, getAddProductPage);
router.get('/edit-product/:id', authenticateAdmin, getListedCategories, getEditProductItemDetails, getEditProductPage);

router.post('/add-product', authenticateAdmin, uploadProductImage.array('productImage', 5), addNewProduct); // , resizeImages
router.post('/edit-product', authenticateAdmin, uploadProductImage.array('productImage', 5), updateProductItem);
router.post('/delete-product', authenticateAdmin, deleteProductItem);


//------- CUSTOMERS --------//
router.get('/customers', authenticateAdmin, getAllUsers, getAdminUsersPage);

router.post('/edit-user', authenticateAdmin, updateSinlgleUser); 
router.post('/delete-user', authenticateAdmin, deleteUser);


//------- CATEGORY --------//
router.get('/category', authenticateAdmin, getAllCategoryDetails, getAdminCategoryPage);

router.post('/add-category', authenticateAdmin, addCategory);
router.post('/edit-category', authenticateAdmin, updateCategory);
router.post('/delete-category', authenticateAdmin, deleteCategory);


//------- ORDERS --------//
router.get('/orders/:id', authenticateAdmin, getListedCategories, getSingleOrderDetails, getAdminViewOrderPage)
router.get('/orders', authenticateAdmin, getAllUsersOrders, getAdminOrdersPage);

router.post('/update-order', updateOrderStatus);

//------- COUPONS --------//
router.get('/coupons', authenticateAdmin, getAllCouponDetails, getAdminCouponPage);

router.post('/add-coupon', authenticateAdmin, addCoupon);
router.post('/edit-coupon', authenticateAdmin, updateCoupon);
router.post('/delete-coupon', authenticateAdmin, deleteCoupon);

//------- BANNERS --------//
router.get('/banners', authenticateAdmin, getAllBannerDetails, getAdminBannerPage);

router.post('/add-banner', authenticateAdmin, uploadBannerImage.single('image'), addBanner);
router.post('/edit-banner', authenticateAdmin, uploadBannerImage.single('image'), updateBanner);
router.post('/delete-banner', authenticateAdmin, deleteBanner);

//------- SALES --------//
router.get('/sales', authenticateAdmin, getListedCategories, getOrderSales, getAdminSalesPage);
router.get('/get-monthly-order-stats', authenticateAdmin, getMonthlyOrdersForChart);
router.get('/sales-pdf', (req,res,next)=>{
    const stream = res.writeHead(200, {
        'Content-Type' : 'application/pdf',
        'Content-Disposition' : 'attachment;filename=salesReport.pdf',
    });
    buildPDF(
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
});

module.exports = router;  