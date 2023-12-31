const userController = require('../controller/userController');

//------- HOME PAGE --------//
exports.homePage = (req, res) => {
    res.render('home',{
        user: req.session.user,
        categories: res.locals.categories,
        banners: res.locals.banners,
        cartItems : res.locals.cartItems,
        subTotal : res.locals.subTotal,
        itemsCount : res.locals.itemsCount,
        wishlistCount : res.locals.wishlistCount,
        featuredProds : res.locals.featuredProds,
        newArrivalProds : res.locals.newArrivalProds,
    });
};
exports.categoryProductsPage = (req, res) => {
    const url = require('url')
    const urlParts = url.parse(req.url)
    console.log("Original :" + req.originalUrl);
    console.log("URL:" + urlParts.pathname);
    if((res.locals.categories.length === 0 || !res.locals.products) && urlParts.pathname === '/search'){
        res.render('page-category-products', {
            user: req.session.user,
            categories: res.locals.categories,
            products : res.locals.products,
            newProducts : res.locals.newProducts,
            cartItems : res.locals.cartItems,
            subTotal : res.locals.subTotal,
            itemsCount : res.locals.itemsCount,
            wishlistCount : res.locals.wishlistCount,
            totalCount : res.locals.totalCount,
            category : res.locals.category,
            c : req.query?.c,
            p : req.query?.p,
        });
    } else if(res.locals.categories.length === 0 || !res.locals.products){
        res.status(404).render('error', {
                        message: "Oops..! Page not available",
                        errStatus : 404
                    });
    } else{
        res.render('page-category-products', {
            user: req.session.user,
            categories: res.locals.categories,
            products : res.locals.products,
            newProducts : res.locals.newProducts,
            cartItems : res.locals.cartItems,
            subTotal : res.locals.subTotal,
            itemsCount : res.locals.itemsCount,
            wishlistCount : res.locals.wishlistCount,
            currentPage : res.locals.currentPage,
            totalPages : res.locals.totalPages,
            totalCount : res.locals.totalCount,
            category : res.locals.category,
            query : req.query,
            urlPath : urlParts.pathname || '/',
            sort : req.query?.sort,
            limit : req.query?.limit,
            c : req.query?.c,
            p : req.query?.p,
        });
    }    
};
exports.productDetailsPage = (req, res) => {
    res.render('page-product-details', {
        user: req.session.user,
        categories: res.locals.categories,
        product: res.locals.product,
        newProducts : res.locals.newProducts,
        relatedProducts: res.locals.products,
        cartItems : res.locals.cartItems,
        subTotal : res.locals.subTotal,
        itemsCount : res.locals.itemsCount,
        wishlistCount : res.locals.wishlistCount,
        currentPage : res.locals.currentPage,
        totalPages : res.locals.totalPages,
    });
};
exports.getUserCartPage = (req, res) => {
    res.render('page-cart', {
        user: req.session.user,
        categories: res.locals.categories,
        cartItems : res.locals.cartItems,
        subTotal : res.locals.subTotal,
        itemsCount : res.locals.itemsCount,
        wishlistCount : res.locals.wishlistCount,
    });
};
exports.getUserWishlistPage = (req, res) => {
    res.render('page-wishlist', {
        user: req.session.user,
        categories: res.locals.categories,
        cartItems : res.locals.cartItems,
        subTotal : res.locals.subTotal,
        itemsCount : res.locals.itemsCount,
        wishlistCount : res.locals.wishlistCount,
        wishlistItems : res.locals.wishlistItems,
    });
};
exports.getUserCheckoutPage = (req, res) => {
    if(res.locals.cartItems.length === 0){
        res.redirect('/');
    } else{
        res.render('page-checkout', {
            user: req.session.user,
            categories: res.locals.categories,
            cartItems : res.locals.cartItems,
            subTotal : res.locals.subTotal,
            itemsCount : res.locals.itemsCount,
            wishlistCount : res.locals.wishlistCount,
            addresses: res.locals.addresses,
            walletBalance: res.locals.walletBalance
        });
    }    
};
exports.getOrderPlacedPage = (req, res) => {
    res.render('page-order-placed',{
        user: req.session.user,
        categories: res.locals.categories,        
        itemsCount : res.locals.itemsCount,
        wishlistCount : res.locals.wishlistCount,
        cartItems : res.locals.cartItems,
        order: res.locals.order,
    });
};
exports.contactUs = (req, res) => {
    res.render('page-contact',{
        user: req.session.user,
        categories: res.locals.categories,
        cartItems : res.locals.cartItems,
        subTotal : res.locals.subTotal,
        itemsCount : res.locals.itemsCount,
        wishlistCount : res.locals.wishlistCount,
    });
};
exports.aboutUs = (req, res) => {
    res.render('page-about',{
        user: req.session.user,
        categories: res.locals.categories,
        cartItems : res.locals.cartItems,
        subTotal : res.locals.subTotal,
        itemsCount : res.locals.itemsCount,
        wishlistCount : res.locals.wishlistCount,
    });
};

//------- ADMIN SIDE --------//
exports.adminLoginPage = (req, res) => {
    if(req.session.adminLoggedIn === true)
        res.redirect('/admin');
    else if(req.session.userLoggedIn === true)
        res.redirect('/user');
    else
        res.render('admin-login');
};
exports.adminDashboardPage = (req, res) => {
    if(req.session.adminLoggedIn === true)
        res.render('admin-dashboard',{
            pageTitle: "Dashboard",
            orderCount: res.locals.orderCount,
            productCount: res.locals.productCount,
            categoryCount: res.locals.categoryCount,
            totalRevenue: res.locals.totalRevenue,
            totalMonthlyRevenue: res.locals.totalMonthlyRevenue,
            orderCountPercent: res.locals.orderCountPercent,
            newUsers: res.locals.newUsers,
            categoryPerformance: res.locals.categoryPerformance,
            monthlyOrderStats: res.locals.monthlyOrderStats,
        });
    else if(req.session.userLoggedIn === true)
        res.redirect('/user');
    else    
        res.redirect('/admin/login');
};
exports.adminLogout = (req, res) => {
    req.session.destroy();
    res.render('admin-login');
};
exports.getAdminOrdersPage = (req, res) => {
    res.render('page-order', {
        pageTitle: "Order Management",
        orders: res.locals.orders
    });
};
exports.getAdminViewOrderPage = (req, res) => {
    res.render('page-view-order', {
        pageTitle: "Order Management",
        categories: res.locals.categories,
        subTotal : res.locals.subTotal,
        order: res.locals.order
    });
};
exports.getAdminProductPage = (req, res) => {
    res.render('page-products', {
        pageTitle: "Product Management",
        products: res.locals.products
    });
};
//get add product page
exports.getAddProductPage = (req, res) => {
    res.render('page-add-product',{
        pageTitle: "Product Management",
        categories: res.locals.categories
    });
};
exports.getEditProductPage = (req, res) => {
    res.render('page-add-product', {
        pageTitle: "Product Management",
        categories: res.locals.categories,
        product: res.locals.product
    });
    console.log(JSON.stringify(res.locals.product));
    console.log(JSON.stringify(res.locals.product.productName));
    console.log(res.locals.product.productName);
};
exports.getAdminUsersPage = (req, res) => {
    res.render('page-users', {
        pageTitle: "Customer Management",
        users: res.locals.users
    });
};
exports.getAdminCategoryPage = (req, res) => {
    res.render('page-category', {
        pageTitle: "Category Management",
        categories: res.locals.categories
    });
};
exports.getAdminCouponPage = (req, res) => {
    res.render('page-coupons', {
        pageTitle: "Coupon Management",
        coupons: res.locals.coupons
    });
};
exports.getAdminBannerPage = (req, res) => {
    res.render('page-banners', {
        pageTitle: "Banner Management",
        banners: res.locals.banners
    });
};
exports.getAdminSalesPage = (req, res) => {
    if(Object.keys(req.query).length !== 0){
        console.log("YES");
        res.render('page-sales', {
            pageTitle: "Sales Report",
            salesData: res.locals.orders,
            categories: res.locals.categories,
            startDate: req.query.start,
            endDate: req.query.end,
            duration: req.query.duration,
        });
    } else {
        console.log("NO");
        res.render('page-sales', {
            pageTitle: "Sales Report",
            salesData: res.locals.orders,
            categories: res.locals.categories,
        });
    }
};

//------- USER SIDE --------//
exports.userDashboardPage =async (req, res) => {
    if(req.session.userLoggedIn === true)
        res.render('user-dashboard',{
            navTitle: 'Welcome ' + req.session.user.firstName,
            user: req.session.user,
            categories: res.locals.categories,
            cartItems : res.locals.cartItems,
            subTotal : res.locals.subTotal,
            itemsCount : res.locals.itemsCount,
            wishlistCount : res.locals.wishlistCount,
            addresses : res.locals.addresses,
            orders: res.locals.orders,
            walletDetails: res.locals.walletDetails,
            walletBalance: res.locals.walletBalance,
            openTab: req.query.tab,
        });
    else if(req.session.adminLoggedIn === true)
        res.redirect('/admin');
    else
        res.redirect('/user/login');
};
exports.userLoginPage = (req, res) => {
    if(req.session.userLoggedIn === true)
        res.redirect('/user');
    // else if(req.session.adminLoggedIn === true)
    //     res.redirect('/admin');
    else
        res.render('user-login',{
            errMsg: req.session.loginErrMsg, 
            err: req.session.loginErr,   
            categories: res.locals.categories,});
};
exports.userSignupPage = (req, res) => {
    if(req.session.userLoggedIn === true)
        res.redirect('/user');
    else
        res.render('user-signup',{    
            categories: res.locals.categories,
        });
};
exports.userVerifyOtpPage = (req, res) => {
    if(req.session.userLoggedIn === true)
        res.redirect('/user');
    else
        res.render('user-otp',{
            phone: req.session.signupPhone,   
            categories: res.locals.categories,
        });
}
exports.userLogout = (req, res) => {
    req.session.destroy();
    res.redirect('/user');
};
exports.getUserOrderDetailsPage = (req, res) => {
    res.render('user-order-view', {
        user: req.session.user,
        categories: res.locals.categories,
        cartItems : res.locals.cartItems,
        itemsCount : res.locals.itemsCount,
        wishlistCount : res.locals.wishlistCount,
        order: res.locals.order,
        totalAmount : res.locals.subTotal
    })
}
exports.getUserOrderInvoicePage = (req, res) => {
    res.render('user-order-invoice', {
        user: req.session.user,
        categories: res.locals.categories,
        cartItems : res.locals.cartItems,
        itemsCount : res.locals.itemsCount,
        wishlistCount : res.locals.wishlistCount,
        order: res.locals.order,
        totalAmount : res.locals.subTotal
    })
}



//------- ORDERS SIDE --------//


