
//------- HOME PAGE --------//
exports.homePage = (req, res) => {
    res.render('home',{
        categories: res.locals.categories,

    });
};
exports.categoryProductsPage = (req, res) => {
    if(res.locals.categories.length === 0){
        res.status(404).render('error', {
                        message: "Oops..! Page not available",
                        errStatus : 404
                    });
    } else{
        res.render('page-category-products', {
            categories: res.locals.categories,
            products : res.locals.products,
            cartItems : res.locals.cartItems,
            subTotal : res.locals.subTotal,
            itemsCount : res.locals.itemsCount
        });
    }    
};
exports.productDetailsPage = (req, res) => {
    res.render('page-product-details', {
        categories: res.locals.categories,
        product: res.locals.product,
        relatedProducts: res.locals.products,
        cartItems : res.locals.cartItems,
        subTotal : res.locals.subTotal,
        itemsCount : res.locals.itemsCount
    });
};
exports.getUserCartPage = (req, res) => {
    res.render('page-cart', {
        categories: res.locals.categories,
        cartItems : res.locals.cartItems,
        subTotal : res.locals.subTotal,
        itemsCount : res.locals.itemsCount
    });
};
exports.getUserCheckoutPage = (req, res) => {
    res.render('page-checkout', {
        categories: res.locals.categories,
        cartItems : res.locals.cartItems,
        subTotal : res.locals.subTotal,
        itemsCount : res.locals.itemsCount,
        addresses: res.locals.addresses
    });
};
exports.getOrderPlacedPage = (req, res) => {
    res.render('page-order-placed',{
        categories: res.locals.categories,        
        itemsCount : res.locals.itemsCount,
    });
};

//------- ADMIN SIDE --------//
exports.adminLoginPage = (req, res) => {
    if(req.session.loggedIn && req.session.isAdmin)
        res.redirect('/admin');
    else if(req.session.loggedIn)
        res.redirect('/user');
    else
        res.render('admin-login');
};
exports.adminDashboardPage = (req, res) => {
    if(req.session.loggedIn && req.session.isAdmin)
        res.render('admin-dashboard');
    else if(req.session.loggedIn)
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
        orders: res.locals.orders
    });
};
exports.getAdminViewOrderPage = (req, res) => {
    res.render('page-view-order', {
        categories: res.locals.categories,
        subTotal : res.locals.subTotal,
        order: res.locals.order
    });
};

exports.getAdminProductPage = (req, res) => {
    res.render('page-products', {
        products: res.locals.products
    });
};
//get add product page
exports.getAddProductPage = (req, res) => {
    res.render('page-add-product',{
        categories: res.locals.categories
    });
};
exports.getEditProductPage = (req, res) => {
    res.render('page-add-product', {
        categories: res.locals.categories,
        product: res.locals.product
    });
    console.log(JSON.stringify(res.locals.product));
    console.log(JSON.stringify(res.locals.product.productName));
    console.log(res.locals.product.productName);
};
exports.getAdminUsersPage = (req, res) => {
    res.render('page-users', {
        users: res.locals.users
    });
};
exports.getAdminCategoryPage = (req, res) => {
    res.render('page-category', {
        categories: res.locals.categories,
    });
};

//------- USER SIDE --------//
exports.userDashboardPage = (req, res) => {
    if(req.session.loggedIn && !req.session.isAdmin)
        res.render('user-dashboard',{
            navTitle: 'Welcome ' + req.session.user.firstName,
            user: req.session.user,
            categories: res.locals.categories,
            cartItems : res.locals.cartItems,
            subTotal : res.locals.subTotal,
            itemsCount : res.locals.itemsCount,
            addresses : res.locals.addresses,
            orders: res.locals.orders
        });
    else if(req.session.loggedIn)
        res.redirect('/admin');
    else
        res.redirect('/user/login');
};
exports.userLoginPage = (req, res) => {
    if(req.session.loggedIn && !req.session.isAdmin)
        res.redirect('/user');
    else if(req.session.loggedIn)
        res.redirect('/admin');
    else
        res.render('user-login',{
            errMsg: req.session.loginErrMsg, 
            err: req.session.loginErr});
};
exports.userSignupPage = (req, res) => {
    if(req.session.loggedIn && !req.session.isAdmin)
        res.redirect('/user');
    else if(req.session.loggedIn)
        res.redirect('/admin');
    else
        res.render('user-signup');
};
exports.userVerifyOtpPage = (req, res) => {
    if(req.session.loggedIn && !req.session.isAdmin)
        res.redirect('/user');
    else if(req.session.loggedIn)
        res.redirect('/admin');
    else
        res.render('user-otp',{
            phone: req.session.signupPhone
        });
}
exports.userLogout = (req, res) => {
    req.session.destroy();
    res.redirect('/user');
};
exports.getUserOrderDetailsPage = (req, res) => {
    res.render('user-order-view', {
        categories: res.locals.categories,
        cartItems : res.locals.cartItems,
        itemsCount : res.locals.itemsCount,
        order: res.locals.order,
        totalAmount : res.locals.subTotal
    })
}



//------- ORDERS SIDE --------//


