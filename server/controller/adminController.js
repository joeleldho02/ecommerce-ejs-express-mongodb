const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config({path:'config.env'});
const bcrypt = require('bcrypt');
const {Admindb, Userdb} = require('../model/model');

//admin create jwt token
exports.createToken = function(req, res){
    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
  
    try {
        const token = req.header(tokenHeaderKey);
  
        const verified = jwt.verify(token, jwtSecretKey);
        if(verified){
            return res.send("Successfully Verified");
        }else{
            // Access Denied
            return res.status(401).send(error);
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }
}

//admin login validation
exports.adminLoginAuthenticate = (body) => {
    return new Promise((resolve, reject) => {
        if (!body) {
            reject("Please input credentials");
        }
        else {
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

//find and retrieve all user(s) to display in table
exports.find = (req, res) => {
    Userdb.find({ firstName: 1, lastName: 1, email: 1, phone: 1, isActive: 1}).collation({locale: "en"})
        .sort({ firstName: 1, lastName: 1 }).lean()
        .then(user => {
            res.render('show-users', {
                style: 'show-users.css',
                title: 'Admin Panel',
                navTitle: 'Admin Panel',
                loggedIn: true,
                users: user,
                //alertMsg: req.query.status
            });
        })
        .catch(err => {
            res.status(400).render('error', {
                message: err.message || "Unable to retrieve data from database"
            });
        });
    // }
};



//Admin logout
exports.adminLogout = function(req, res){
    req.session.destroy();
    res.redirect('/admin');
}

