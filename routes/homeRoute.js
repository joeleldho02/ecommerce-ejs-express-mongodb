const express = require('express');
const router = express.Router(); 
const homeController = require('../server/controller/homeController');

router.get('/', function(req, res){
    //res.redirect('/admin');
    res.render('home');
});

module.exports = router;  