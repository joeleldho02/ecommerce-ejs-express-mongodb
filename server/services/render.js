
//------- HOME PAGE --------//
exports.homePage = (req, res) => {
    res.render('home',{
        categories: res.locals.categories
    });
};
exports.categoryProductsPage = (req, res) => {
    res.render('page-category-products', {
        categories: res.locals.categories,
        products : res.locals.products
    });
};
exports.productDetailsPage = (req, res) => {
    res.render('page-product-details', {
        categories: res.locals.categories,
        product: res.locals.product,
        relatedProducts: res.locals.products
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
    res.render('page-orders');
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
exports.userLogout = (req, res) => {
    req.session.destroy();
    res.redirect('/user');
};

//------- ORDERS SIDE --------//


