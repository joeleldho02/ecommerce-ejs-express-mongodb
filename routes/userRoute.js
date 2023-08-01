const express = require('express');
const router = express.Router(); 
const userController = require('../server/controller/userController');
const authController = require('../server/middleware/authenticate-user');

router.get('/', authController.authenticateUser, function(req, res){
    if(req.session.loggedIn && !req.session.isAdmin)
        res.render('user-dashboard',{
            navTitle: 'Welcome ' + req.session.user.firstName,
            user: req.session.user,
        });
    else if(req.session.loggedIn)
        res.redirect('/admin');
    else
        res.redirect('/user/login');
});

router.get('/login', function(req, res){
    if(req.session.loggedIn && !req.session.isAdmin)
        res.redirect('/user');
    else if(req.session.loggedIn)
        res.redirect('/admin');
    else
        res.render('user-login',{
            errMsg: req.session.loginErrMsg, 
            err: req.session.loginErr});
});

router.post('/login', userController.userLogin);
router.post('/verify-otp', userController.loginOTPVerify);

router.get('/signup', function(req, res){
    if(req.session.loggedIn && !req.session.isAdmin)
        res.redirect('/user');
    else if(req.session.loggedIn)
        res.redirect('/admin');
    else
        res.render('user-signup');
});

router.post('/signup', userController.registerUser);

router.get('/logout', userController.userLogout);

module.exports = router;  