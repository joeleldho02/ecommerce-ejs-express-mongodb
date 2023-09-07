const Coupondb = require('../model/couponModel');

//generate coupon
function coupongenerator() {
    let coupon = '';
    const possible = 'ABCDEFGHIJKLMNOPQRST0123456789';
    for (let i = 0; i < 8; i++) {
        coupon += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return coupon;
}
//add new coupon to DB
exports.addCoupon = async (req, res, next) => {
    try{
        console.log(req.body);
        if (!req.body) {
            res.redirect('/admin/coupons');
        }
        else {            
            const {couponCode, description, discount, minAmount, maxDiscount, isListed} = req.body;
            const regex = new RegExp("^" + couponCode + "$");
            await Coupondb.findOne({ couponCode: { $regex: regex }, isDeleted: false })
                .then(async data => {
                    if (data !== null) {
                        console.log("Coupon code already exsits!");  
                        // res.redirect('/admin/coupons');
                        await getAllCategories()
                        .then(data => {
                            res.render('page-coupons', {
                                pageTitle: "Coupon Management",
                                coupons: data,
                                errMsg: "Oops..!! Coupon with entered code already exsits.",
                                inputData: req.body
                            });
                        })
                        .catch(err => {
                            res.status(500).render('error', {
                                message: "Unable to add coupon to database",
                                errStatus : 500
                            });
                            console.log(err);
                        });
                    }
                    else{
                        const newCoupon = new Coupondb({
                            couponCode: couponCode,
                            description: description,
                            discount: discount,
                            minAmount: minAmount,
                            maxDiscount: maxDiscount,
                            isListed: isListed === "on" ? true : false
                        })
                        await newCoupon.save()
                            .then(data => {
                                console.log(data);
                                res.redirect('/admin/coupons');
                            })
                            .catch(err => {
                                res.status(500).render('error', {
                                    message: "Unable to add coupon to database",
                                    errStatus : 500
                                });
                                console.log(err);
                            });
                    }
                })            
        }
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to add coupon to database",
            errStatus : 500
        });
        console.log(err);
    }
}
//find and retrieve all coupon(s) to display in table
exports.getAllCouponDetails = async (req, res, next) => {
    console.log("--------------------------------- > HERE1");
    try{
        const data = await getAllCoupons();
        if(data.length !== 0){
            console.log("Data received: " + data);
            res.locals.coupons = data;
        }
        else{
            console.log("List is empty");
            res.locals.coupons = [];
        }
        next();
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to retrieve data from database",
            errStatus : 500
        });
        console.log(err); 
    }
};
function getAllCoupons(){
    try{
        return new Promise((resolve, reject) => {
            Coupondb.find({isDeleted: false},{
                isDeleted: 0
                })
                .collation({locale: "en"})
                .sort({ couponCode: 1 }).lean()
                .then(data => {
                    if(data.length !== 0) { console.log("Data received: " + data);}
                    else { console.log("List is empty"); }
                    resolve(data);        
                })
                .catch(err => {
                    reject(null); 
                });
        });
    } catch{
        return null;                                                                
    }
}
function getCoupon(couponCode){
    try{
        return new Promise((resolve, reject) => {
            Coupondb.findOne({couponCode: couponCode, isDeleted: false, isListed: true},{
                isDeleted: 0
                }).lean()                
                .then(data => {
                    if(data !== null) { console.log("Data received: " + data);}
                    else { console.log("No coupon found!"); }
                    resolve(data);        
                })
                .catch(err => {
                    reject(null); 
                });
        });
    } catch{
        return null;                                                                
    }
}

//update coupon by coupon id in db
exports.updateCoupon = async (req, res, next) => {
    try{
        if (!req.body) {
            return res.status(500).render('error', {
                message: err || "Data to update cannot be empty"
            });
        }
        console.log(JSON.stringify(req.body));
        const {id, couponCode, description, discount, minAmount, maxDiscount, isListed} = req.body;
        const regex = new RegExp("^" + couponCode + "$");
        await Coupondb.findOne({ couponCode: { $regex: regex }, isDeleted: false, _id:{$ne: id} })
                .then( async data => {
                    if (data !== null) {
                        console.log("Coupon code already exsits!");  
                        await getAllCoupons()
                        .then(data => {
                            res.render('page-coupons', {
                                pageTitle: "Coupon Management",
                                coupons: data,
                                errMsg: "Oops..!! Coupon with entered code already exsits.",
                                inputData: req.body,
                                action: "edit"
                            });
                        })
                        .catch(err => {
                            res.status(500).render('error', {
                                message: "Unable to add coupon to database",
                                errStatus : 500
                            });
                            console.log(err);
                        });
                    } else{
                        const id = id;
                        console.log(req.body);
                        const editCoupon = new Coupondb({
                            couponCode: couponCode,
                            description: description,
                            discount: discount,
                            minAmount: minAmount,
                            maxDiscount: maxDiscount,
                            isListed: isListed === "on" ? true : false,
                            _id: id
                        })
                        await Coupondb.findByIdAndUpdate(id, editCoupon)
                            .then(data => {
                                if (!data) {
                                    res.status(500).render('error', {
                                        message: "Unable to update coupon",
                                        errStatus : 500
                                    });
                                }
                                else {
                                    //res.send(data);   
                                    const msg = "Coupon updated successfully!"
                                    res.redirect('/admin/coupons');
                                }
                            })
                            .catch(err => {
                                res.status(500).render('error', {
                                    message: "Error updating coupon in Database",
                                    errStatus : 500
                                });
                                console.log(err);
                            });                        
                    }
                })
    } catch(err){
        res.status(500).render('error', {
            message: "Error updating coupon in Database",
            errStatus : 500
        });
        console.log(err);
    }
};
//delete coupon with specified couponsID from DB
exports.deleteCoupon = async (req, res) => {
    try{
        if (!req.body) {
            return res.status(500).render('error', {
                message: "Coupon ID to delete cannot be empty",
                errStatus : 500
            });
        }
        const id = req.body.couponID;
        const editCoupon = {
            isDeleted: true,
            isListed: false,
            _id: id
        }
        await Coupondb.findByIdAndUpdate(id, editCoupon)
            .then(data => {
                if (!data) {
                    res.status(500).render('error', {
                        message: "Unable to delete coupon. Coupon not found!",
                        errStatus : 500
                    });
                }
                else {
                    console.log("Delete succes: " + data);
                    res.redirect('/admin/coupons');
                }
            })
            .catch(err => {
                res.status(500).render('error', {
                    message: "Unable to delete coupon. Error deleting coupon from Database",
                    errStatus : 500
                });
                console.log(err);
            });
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to delete coupon. Error deleting coupon from Database",
            errStatus : 500
        });
        console.log(err);
    }
};
//apply coupon
exports.applyCoupon = async (req, res) => {
    console.log(req.body);
    const orderTotal = Number(req.body.orderTotal);
    const coupon = await getCoupon(req.body.couponCode);
    console.log("Coupon : " + coupon);
    if(coupon){
        if(Object.keys(coupon).length !== 0){
            if(coupon.minAmount < orderTotal){
                let discount = coupon.discount*(orderTotal/100);
                if(discount > coupon.maxDiscount){
                    discount = coupon.maxDiscount;  
                }
                res.json({success: true, coupon: coupon, discount: discount});
            }
        }
        else{
            res.json({success: false, errMsg:"Invalid coupon code!"});
        }
    }
    else{
        res.json({success: false, errMsg:"Invalid coupon code!"});
    }
}