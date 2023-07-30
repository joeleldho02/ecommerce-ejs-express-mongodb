const express = require('express');
const router = express.Router(); 
const userController = require('../server/controller/userController');

router.get('/', function(req, res){
    if(req.session.userLoggedIn && !req.session.isAdmin)
        res.render('user-dashboard',{
            navTitle: 'Welcome ' + req.session.loggedUser.firstName,
            user: req.session.loggedUser
        });
    else
        res.redirect('/user/login');
});

router.get('/login', function(req, res){
    if(req.session.userLoggedIn && !req.session.isAdmin)
        res.redirect('/user');
    else
        res.render('user-login',{
            errMsg: req.session.loginErrMsg, 
            err: req.session.loginErr});
});

router.post('/login', userController.userLogin);
router.post('/verify-otp', userController.loginOTPVerify);

router.get('/signup', function(req, res){
    if(req.session.userLoggedIn && !req.session.isAdmin)
        res.redirect('/user');
    else
        res.render('user-signup');
});

router.post('/signup', userController.registerUser);

router.get('/logout', userController.userLogout);

module.exports = router;  