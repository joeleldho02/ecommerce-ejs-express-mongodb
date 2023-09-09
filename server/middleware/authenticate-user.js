const Userdb = require('../model/userModel');

exports.authenticateUser = async (req, res, next) => {
    console.log("Authenticating User ----->");
    if(req.session.userLoggedIn === true){
        await Userdb.findOne({ email: req.session.user.email},{isActive:1})
        .then(user => {
            if (user !== null) {   
                console.log("--------------->> User Status : " + user.isActive);           
                if(user.isActive)
                    next();
                else{
                    req.session.destroy();
                    res.status(500).render('error', {
                        message: "Oops..!! User is blocked by the administrator! Kindly contact customer support for further details.",
                        errStatus : 500,
                        error:{stack:""}
                    });
                }
            }
            else{
                let err = "User info is not found in database. Please singup to continue."
                console.log("Login Error: " + err);
                res.redirect('/user/signup');
            }
        }).catch(err => {
                res.status(500).render('error', {
                    message: "Unable to authenticate user right now. Please try again some time later",
                    errStatus : 500,
                    error:{stack: err}
                });
        }); 
    }
    else{
        if(!req.originalUrl.includes('add-to-cart') && !req.originalUrl.includes('add-to-wishlist'))
            req.session.returnTo = req.originalUrl;
        res.redirect('/user/login');
        //next();
    }   
};