const Cartdb = require('../model/cartModel');
const Orderdb = require('../model/orderModel');
const mongoose = require('mongoose');

exports.placeOrder = async (req, res, next) => {
    try{
        console.log(req.body);
        if(req.body.addressId && req.body.paymentMethod){
            const addressId = req.body.addressId;
            const userId = req.session.user._id;
            const products = res.locals.userCart.products;
            const address = res.locals.addresses.filter(item => {
                return item._id.equals(addressId);
            });

            const newOrder = new Orderdb({
                customerId: userId,
                paymentMethod: req.body.paymentMethod,
                products: products,
                shippingAddress: address[0],
                totalAmount : req.body.totalAmount
            })
            console.log("New ORDER : " + newOrder);
            newOrder.save()
                .then(async () => {
                    await Cartdb.findOneAndDelete({customerId: req.session.user._id})
                    .then(()=>{
                        console.log("CLeared user cart after order is placed!");
                        res.redirect('/place-order')
                    })
                    .catch(err => {
                        res.status(500).render('error', {
                            message: "Unable to clear user cart after order is placed!",
                            errStatus : 500
                        });
                        console.log(err);
                    });
                })
                .catch(err => {
                    res.status(500).render('error', {
                        message: "Unable to place order",
                        errStatus : 500
                    });
                    console.log(err);
                });
        } else {
            res.status(500).render('error', {
                message: "Unable to place order",
                errStatus : 500
            });
            console.log("Unable to place order");
        }
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to place order",
            errStatus : 500
        });
        console.log(err);
    }
}

exports.getAllUsersOrders = async (req, res, next) => {
    try{
        if(req.session.isAdmin){
            await Orderdb.find()
                .sort({createdAt: -1}).lean()
                .then(data => {
                    if(data !== null || data.length !== 0){
                        res.locals.orders = data;
                    }
                    next();
                })
        } else{
            next();
        }
    }catch(err){
        next();
    }
};

exports.getAllOrdersOfUser = async (req, res, next) => {
    try{
        if(req.session.user){
            await Orderdb.find({customerId: req.session.user._id})
                .sort({createdAt: -1}).lean()
                .then(data => {
                    if(data !== null || data.length !== 0){
                        res.locals.orders = data;
                    }
                    next();
                })
        } else{
            next();
        }
    }catch(err){
        next();
    }
};

exports.getOrderDetails = async (req, res, next) => {
    try{
        if(req.session.user){
            let customerId;
            if(req.session.isAdmin){
                customerId = {}
            } else{
                customerId = { customerId: new mongoose.Types.ObjectId(req.session.user._id)}
            }
            let cartItems = await Orderdb.aggregate([
                {$match: customerId},
                {$unwind: '$products'},
                {$lookup: {
                         from: 'products',
                         localField: 'products.productId',
                         foreignField: '_id',
                         as: 'productInfo'}
                },
                {$project: {
                    productInfo : 1, 
                    quantity:'$products.quantity', 
                    _id:0, 
                    salePrice:'$productInfo.salePrice'}
                }
            ])
            if(cartItems.length === 0){
                console.log(" No items in cart!!");
            } else{
                cartItems.forEach(product => {
                    const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(product.productInfo[0].category) );
                    console.log(JSON.stringify(prodCategoryName));
                    product.productInfo[0].category = prodCategoryName[0]?.categoryName;
                });  
                res.locals.subTotal = cartItems.reduce((sum, item) =>{
                    return sum + (item.quantity*item.salePrice);
                },0)
                console.log(res.locals.subTotal);
            }
            console.log("Cart Items of user: " + cartItems);
            res.locals.order = cartItems;
            next(); 
        } else{
            res.locals.requestFrom = "/user/cart";
            res.redirect('/user/login');
        }
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to retrieve data from database",
            errStatus : 500
        });
        console.log(err);
    }
}

exports.cancelOrder = async (req, res, next) => {
    try{

    }catch(err){

    }
};

exports.editOrderStatus = async (req, res, next) => {
    try{

    }catch(err){

    }
};