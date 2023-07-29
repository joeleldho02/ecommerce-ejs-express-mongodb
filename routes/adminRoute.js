const express = require('express');
const router = express.Router(); 
const adminController = require('../server/controller/adminController');

router.get('/', function(req, res){
    res.render('adminHome');
});

router.get('/login', function(req, res){
    res.render('adminLogin');
});

router.post('/login', function(req, res){
    //res.send('login success');
    res.render('adminHome');
    console.log(req.body);
});

router.get('/logout', function(req, res){
    res.render('adminLogin');
});


router.get('/customers', function(req, res){
    res.render('adminUsers');
});

module.exports = router;  