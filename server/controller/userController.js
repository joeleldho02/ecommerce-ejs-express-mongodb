const {Userdb} = require('../model/model');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config({path:'config.env'});
const client = require('twilio')(process.env.ACCOUNTSID, process.env.AUTHTOKEN);

async function setSession(req, res){
    await Userdb.findOne({ email: req.session.loginEmail})
        .then(user => {
            if (user !== null){
                delete user.password
                delete req.session.loginEmail;
                delete req.session.loginErrMsg;
                delete req.session.loginOTP;
                delete req.session.loginErr;
                req.session.userLoggedIn = true;
                req.session.user = user;
                req.session.isAdmin = false;
                console.log(`User Logged in Succesfully : ${req.session.user.firstName + req.session.user.firstName}`)
                res.redirect('/user');
            }
            else {
                res.status(500).render('error', {
                    message: "Unable to get userdata from database",
                    errStatus : 500,
                    error:{stack: err.message}
                });
            }
            }).catch(err => {
                res.status(500).render('error', {
                    message: "Unable to get userdata from database",
                    errStatus : 500,
                    error:{stack: err.message}
                });
            });    
}

async function sendOTP(phone){
    let generatedOtp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = await bcrypt.hash(String(generatedOtp), 10);
    console.log(`Generated OTP : ${generatedOtp}`)
//-------------------- TWILIO OTP SENDER CODE ---------------------//
    // client.messages
    // .create({
    //     body: `JMJ Music House - OTP for Login is ${generatedOtp}`,
    //     from: '+17626002830',
    //     to: '+919656255604'
    // })
    // .catch(err=>console.log(err));
    return hashedOtp;
}

//User signup after email duplicate check and then add to db
exports.registerUser = async (req, res) => {
    console.log(req.body);
    if (!req.body) {
        console.log("No body submitted");
        res.redirect('/user/login');
    }
    else {
        await Userdb.findOne({ email: req.body.email })
        .then(user => {
            if (user !== null) {
                console.log("User already exsits!");
                res.status(500).render('error', {
                    message: "Oops..!! User with entered email ID already exsits.",
                    errStatus : 500,
                    error:{stack:""}
                });
                // res.render('add-user', {
                //     title:'Signup',
                //     signupErr: "Oops..!! User with entered email ID already exsits.",
                //     inputData: req.body
                // });
            }
            else {
                addUserDetails(req, res);
            }
            }).catch(err => {
                res.status(500).render('error', {
                    message: "Unable to add user to database",
                    errStatus : 500,
                    error:{stack: err.message}
                });
            });
    }
};
async function addUserDetails(req, res) {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new Userdb({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        password: hashedPassword,
        updatedAt: Date.now(),
    })
    user.save()
        .then(data => {
            console.log("Added new user data: " + data)
            delete data.password; 
            res.redirect('/user/login');
        })
        .catch(err => {
            res.status(500).render('error', {
                message: "Unable to add user to database",
                errStatus : 500,
                error:{stack: err.message}
            });
        });
}

//login user to home page
exports.userLogin = async function(req, res){
    //-------- CODE TO ADD ADMIN -----------//

           // req.session.userLoggedIn = true;        
           // req.session.isAdmin = true;
           // req.session.loggedUser = userData;     
           // res.redirect('/');
   try{
       const userData = await exports.loginAuthenticate(req.body);
       if(userData){
           delete userData.password;
           req.session.loginEmail = userData.email;
           req.session.loginOTP = await sendOTP(userData.phone);
           res.render('user-otp',{
                phone: userData.phone
            });
           //setSession(req, res, userData);
       }
   }catch(err){
       console.log("Login Error: " + err);
       res.render('user-login',{ errorMsg: err });
   }
};

//login validation user and admin
exports.loginAuthenticate = (body) => {
    return new Promise((resolve, reject) => {
        if (!body) {
            reject("Please input credentials");
        }
        else {
            Userdb.findOne({ email: body.email })
                .then(user => {
                    console.log(user);
                    if (user !== null) {
                        if(user.isActive){
                            bcrypt.compare(body.password, user.password)
                            .then((status) => {
                                if (status)
                                    resolve(user);
                                else
                                    reject("Password is incorrect!");
                                });
                            }
                        else
                            reject("User is blocked by the administrator! Kindly contact customer support for further details.");
                    }
                    else {
                        reject("No user found!");
                    }
                })
        }
    });
};

//login OTP verification
exports.loginOTPVerify = async function(req, res) {
    const otp = req.body.otp;
    bcrypt.compare(otp, req.session.loginOTP)
    .then((status) => {
        if(status)
            setSession(req, res);
        else{
            res.status(500).render('error', {
                message: "Oops..!! Wrong OTP.",
                errStatus : 500,
                error:{stack:""}
            });
        }
    })                    
};

//User logout
exports.userLogout = function(req, res){
    req.session.destroy();
    res.redirect('/user');
}