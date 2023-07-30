const express = require('express');
const router = express.Router(); 
const adminController = require('../server/controller/adminController');

router.get('/', function(req, res){
    res.render('admin-dashboard');
});

router.get('/products', function(req, res){
    res.render('page-products');
});

router.get('/customers', function(req, res){
    res.render('page-users');
});

router.get('/orders', function(req, res){
    res.render('page-orders');
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

router.get('/customers', function(req, res){
    res.render('adminUsers');
});

module.exports = router;  