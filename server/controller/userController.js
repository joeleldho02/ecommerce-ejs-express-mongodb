const {Userdb} = require('../model/model');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config({path:'.env'});
const client = require('twilio')(process.env.TWILIO_ACCOUNTSID, process.env.TWILIO_AUTHTOKEN);

async function setSession(req, res, userData){
    try{         
            delete req.session.signupEmail;
            delete req.session.signupPhone;
            delete req.session.loginErrMsg;
            delete req.session.loginOTP;
            delete req.session.loginErr;
            delete req.session.registeredUser;
            req.session.loggedIn = true;
            req.session.user = userData;
            req.session.isAdmin = false;
            console.log(`User Logged in Succesfully : ${userData.firstName + userData.lastName}`);
            if(res.locals.requestFrom){
                res.redirect(res.locals.requestFrom);
                delete res.locals.requestFrom;
            } 
            else         
                res.redirect('/user'); 
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to get userdata from database",
            errStatus : 500
        });
        console.log(err.message);
    }
}
async function sendOTP(phone){
    try{
        let generatedOtp = Math.floor(100000 + Math.random() * 900000);
        const hashedOtp = await bcrypt.hash(String(generatedOtp), 10);
        console.log(`Generated OTP : ${generatedOtp}`)
    //-------------------- TWILIO OTP SENDER CODE ---------------------//
        // client.messages
        // .create({
        //     body: `JMJ Music House - OTP for Login is ${generatedOtp}`,
        //     from: '+17626002830',
        //     to: '+919656255604' //to: phone ---> send to user phone number
        // })
        // .catch(err=>console.log(err));

        return hashedOtp;
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to send OTP. Please try again later",
            errStatus : 500
        });
        console.log("Unable to send OTP. Please try again later" + err.message);
    }
}

//User signup after email duplicate check and then add to db
exports.registerUser = async (req, res) => {
    try{
        console.log(req.body);
        if (!req.body) {
            console.log("No body submitted");
            res.redirect('/user/login');
        }
        else {
            await Userdb.findOne({ email: req.body.email })
                .then(async user => {
                    if (user !== null) {
                        console.log("User already exsits!");    
                        res.render('user-signup', {
                            signupErr: "Oops..!! User with entered email ID already exsits.",
                            inputData: req.body
                        });
                    }
                    else {
                        req.session.registeredUser = req.body;
                        req.session.signupEmail = req.body.email;
                        req.session.signupPhone = req.body.phone;
                        req.session.loginOTP = await sendOTP(req.body.phone);
                        res.redirect('/user/verify-otp');
                    }
                }).catch(err => {
                    res.status(500).render('error', {
                        message: "Unable to add user to database",
                        errStatus : 500
                    });
                    console.log(err.message);
                });
        }
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to add user to database",
            errStatus : 500
        });
        console.log(err.message);
    }
};
async function addUserDetails(req, res) {
    try{
        const registeredUser = req.session.registeredUser
        const hashedPassword = await bcrypt.hash(registeredUser.password, 10);
        const user = new Userdb({
            firstName: registeredUser.firstName,
            lastName: registeredUser.lastName,
            email: registeredUser.email,
            phone: registeredUser.phone,
            password: hashedPassword,
            updatedAt: Date.now(),
        })
        user.save()
            .then(async data => {
                console.log("Added new user data: " + data)
                delete data.password;     
                setSession(req, res, data);     
            })
            .catch(err => {
                res.status(500).render('error', {
                    message: "Unable to add user to database",
                    errStatus : 500
                });
                console.log(err.message);
            });
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to add user to database",
            errStatus : 500
        });
        console.log(err.message);
    }
}

//login user to home page
exports.userLogin = async function(req, res){
    try{
        const userData = await loginAuthenticate(req.body);
        if(userData){
            delete userData.password;
            // req.session.signupEmail = userData.email;
            // req.session.loginOTP = await sendOTP(userData.phone);
            // res.render('user-otp',{
            //     phone: userData.phone
            // });            
            setSession(req, res, userData);
        }
        else{
            console.log("Login Error: " + err);
            res.render('user-login',{ errorMsg: err });
        }
    }catch(err){
        console.log("Login Error: " + err);
        res.render('user-login',{ errorMsg: err });
    }
};
//login authenticatin user
const loginAuthenticate = (body) => {
    return new Promise((resolve, reject) => {
        if (!body) {
            reject("Please input credentials");
        }
        else {
            try{
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
            } catch{
                reject("No user found!");
            }
        }
    });
};
//login OTP verification
exports.loginOTPVerify = async function(req, res) {
    try{
        const otp = req.body.otp;
        bcrypt.compare(otp, req.session.loginOTP)
            .then((status) => {
            if(status){
                addUserDetails(req, res)
            }
            else{
                res.status(400).render('error', {
                    message: "Oops..!! Wrong OTP.",
                    errStatus : 400
                });
                console.log("Oops..!! Wrong OTP.");
            }
        })    
    } catch{
        res.status(500).render('error', {
            message: "Unable to verify OTP",
            errStatus : 500
        });
        console.log("Unable to verify OTP");
    }           
};

//find and retrieve all user(s) to display in table
exports.getAllUsers = (req, res, next) => {
    try{
        Userdb.find({},{ password: 0, cart: 0, wishlist: 0, address: 0}).collation({locale: "en"})
        .sort({ firstName: 1, lastName: 1 }).lean()
        .then(data => {
            if(data.length !== 0){
                console.log("Data received: " + data);
                res.locals.users = data;
            }
            else{
                console.log("List is empty");
                res.locals.users = [];
            }
            next();            
        })
        .catch(err => {
            res.status(500).render('error', {
                message: "Unable to retrieve data from database",
                errStatus : 500
            });
            console.log(err.message);
        });
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to retrieve data from database",
            errStatus : 500
        });
        console.log(err.message);
    }
};
//update single user by user_id in db
exports.updateSinlgleUser = (req, res) => {
    try{
        if (!req.body) {
            console.log("Data to update cannot be empty");
            return res.status(500).render('error', {
                message: "Data to update cannot be empty",
                errStatus : 500
            });
        }
        const id = req.body.id;
        const user = new Userdb({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            isActive: req.body.isActive === "on" ? true : false,
            updatedAt: Date.now(),
            _id: id
        })
        Userdb.findByIdAndUpdate(id, user)
            .then(data => {
                if (!data) {
                    res.status(500).render('error', {
                        message: "Unable to update user",
                        errStatus : 500
                    });
                    console.log("Unable to update user");
                }
                else {
                    const msg = "User details updated successfully!";
                    console.log(msg);
                    res.redirect('/admin/customers');
                }
            })
            .catch(err => {
                res.status(500).render('error', {
                    message: "Error updating user in Database",
                    errStatus : 500
                });
                console.log(err.message);
            });
    } catch(err){
        res.status(500).render('error', {
            message: "Error updating user in Database",
            errStatus : 500
        });
        console.log(err.message);
    }
};
//delete user with specified user_id from DB
exports.deleteUser = (req, res) => {
    try{
        if (!req.body) {
            console.log("User ID to delete cannot be empty");
            return res.status(500).render('error', {
                message: "User ID to delete cannot be empty",
                errStatus : 500
            });
        }
        const id = req.body.userID;
        console.log("ID for delete: " + id);
        Userdb.findByIdAndDelete(id)
            .then(data => {
                if (!data) {
                    res.status(500).render('error', {
                        message: "Unable to delete user. User data not found!",
                        errStatus : 500
                    });
                    console.log("Unable to delete user. User data not found!");
                }
                else {
                    console.log("Delete succes: " + data);
                    res.redirect('/admin/customers');
                }
            })
            .catch(err => {
                res.status(500).render('error', {
                    message: "Unable to delete user. Error deleting user in Database",
                    errStatus : 500
                });
                console.log(err.message);
            });
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to delete user. Error deleting user in Database",
            errStatus : 500
        });
        console.log(err.message);
    }
};