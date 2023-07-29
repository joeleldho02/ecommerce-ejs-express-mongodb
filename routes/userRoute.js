const express = require('express');
const router = express.Router(); 
const userController = require('../server/controller/userController');

router.get('/', function(req, res){
    res.render('userHome');
});

router.get('/login', function(req, res){
    res.render('userLogin');
});

router.post('/login', function(req, res){
    //res.send('login success');
    res.render('userHome');
    console.log(req.body);
});

router.get('/signup', function(req, res){
    res.render('userRegister');
});

router.get('/logout', function(req, res){
    res.render('userLogin');
});

module.exports = router;  