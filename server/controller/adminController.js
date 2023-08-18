const bcrypt = require('bcrypt');
const Admindb = require('../model/adminModel');


async function setSession(req, res, user){  
    delete req.session.loginEmail;
    delete req.session.loginErrMsg;
    delete req.session.loginOTP;
    delete req.session.loginErr;
    req.session.adminLoggedIn = true;
    req.session.adminUser = user;
    console.log(`Admin Logged in Succesfully : ${req.session.adminUser.name}`)
    res.redirect('/admin');
}

//login user to home page
exports.adminLogin = async function(req, res){
    try{
        const userData = await adminLoginAuthenticate(req.body);
        if(userData){
           delete userData.password;
           setSession(req, res, userData)
        }
        else{
            let err = "User not found!"
            res.render('admin-login', { errorMsg: err });
        }
    }catch(err){
        res.render('admin-login', { errorMsg: err });
    }
};
//admin login validation
 const adminLoginAuthenticate = (body) => {
    return new Promise((resolve, reject) => {
        if (!body) {
            reject("Please input credentials");
        }
        else {
            console.log(body);
            Admindb.findOne({email: body.email})
                .then(user => {
                    console.log(user);
                    if (user !== null) {
                        bcrypt.compare(body.password, user.password)
                            .then((status) => {
                                if (status)
                                    resolve(user);
                                else
                                    reject("Password is incorrect!");
                            })
                    }
                    else {
                        reject("No user found!");
                    }
                })
        }
    });
};
//admin logout
exports.adminLogout = function(req, res){
    req.session.destroy();
    res.redirect('/admin');
}