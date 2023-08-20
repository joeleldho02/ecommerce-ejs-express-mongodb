const Cartdb = require('../model/cartModel');
const Orderdb = require('../model/orderModel');
const Productdb = require('../model/productModel');
const mongoose = require('mongoose');
const paymentHelper = require('../helper/razorpay'); 

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
            const orderId = String((new Date()).getTime()).slice(-6);

            // const products = await Cartdb.aggregate([
            //     {$match: {customerId: new mongoose.Types.ObjectId(userId)}},
            //     {$unwind: '$products'},
            //     {$lookup: {
            //         from: 'products',
            //         localField: 'products.productId',
            //         foreignField: '_id',
            //         as: 'productInfo'}
            //     }   
            // ]);
            console.log("CART products ::::::");
            console.log(JSON.stringify(products));
            const totalItems = products.reduce((tot, product)=>{
                return product.quantity + tot;
            },0)
            // products.forEach((product)=>{

            // })
            // const product = await Productdb.findOne({_id: req.body.prodId}).lean();
            // if(product !== null){
            //     if(item.quantity > product.stock){
            //         return res.json({status: true, msg:"Unable to add product quantity! Quantity exceeds available stock."});
            //     }
            // }
    
            console.log("Total Items in order : " + totalItems);
            const newOrder = new Orderdb({
                orderId: orderId,
                customerId: userId,
                paymentMethod: req.body.paymentMethod,
                products: products,
                shippingAddress: address[0],
                totalAmount : req.body.totalAmount,
                totalItems : totalItems,
            })
            console.log("New ORDER : " + newOrder);

            /////////////////
            // const placeOrder = newOrder.save();
            // const deleteCart = await Cartdb.findOneAndDelete({customerId: req.session.user._id});
            // const changeStock = await Productdb.updateMany({})
            // Promise.allSettled([placeOrder(), deleteCart(), changeStock()])
            // .then((data)=>{
            //     // console.log(JSON.stringify(data));
            //     console.log("Cleared user cart after order is placed!");
            //     res.redirect('/place-order')
            // })
            // .catch(err => {
            //     res.status(500).render('error', {
            //         message: "Unable to place order!",
            //         errStatus : 500
            //     });
            //     console.log(err);
            // });
            //////////////////////////////
            // exports.updateDisplayOrder = async keyValPairArr => {
            //     try {
            //         let data = await ContestModel.collection.update(
            //             { _id: { $in: keyValPairArr.map(o => o.id) } },
            //             [{
            //                 $set: {
            //                     displayOrder: {
            //                         $let: {
            //                             vars: { obj: { $arrayElemAt: [{ $filter: { input: keyValPairArr, as: "kvpa", cond: { $eq: ["$$kvpa.id", "$_id"] } } }, 0] } },
            //                             in:"$$obj.displayOrder"                                    
            //                         }
            //                     }
            //                 }
            //             }],
            //             { runValidators: true, multi: true }
            //             )            
            //         return data;
            //     } catch (error) {
            //         throw error;
            //     }
            // }
            //////////////////////////////
            
            newOrder.save()
                .then(async (savedOrder) => {
                    await Cartdb.findOneAndDelete({customerId: req.session.user._id})
                    .then(async ()=>{
                        console.log("Cleared user cart after order is placed!");
                        console.log(savedOrder._id);
                        console.log(savedOrder);
                        if(savedOrder.paymentMethod === 'COD'){
                            console.log("COD: "+savedOrder.paymentMethod);
                            res.json({payment:true});                            
                        } else if(savedOrder.paymentMethod === 'RAZORPAY'){
                            console.log("RAZORPAY: "+savedOrder.paymentMethod);
                            const generatedOrder = await paymentHelper.generateRazorpay(savedOrder._id, savedOrder.totalAmount)
                            console.log("GENERATED ORDER : "+generatedOrder);
                            res.json(generatedOrder);                            
                        }
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
exports.changePaymentStatus = (orderId) => {
    const editOrder = {
        _id: orderId,
        paymentStatus: "PAID"
    }
    return new Promise((resolve, reject) => {
        Orderdb.findByIdAndUpdate(orderId, editOrder)
        .then(()=>{
            resolve();
        })
        .catch(err =>{
            reject(err);
        })
    })
};
exports.verifyRazorpayPayment = (req, res)=>{
    console.log(req.body);
    paymentHelper.verifyPayment(req.body).then(()=>{
        console.log("ORDER: ID :" + req.body.order.receipt);
        console.log("Payment SUCCESSFUL");
        orderController.changePaymentStatus(req.body.order.receipt).then(()=>{
            console.log("STATUS PAID");
            res.json({status:true});
        });
    }).catch((err)=>{
        console.log(err);
        res.json({status: false, errMsg:'Payment failed!'});
    });
}

exports.getAllUsersOrders = async (req, res, next) => {
    try{
        if(req.session.adminLoggedIn === true){
            console.log("Getting Orders------------>");
            await Orderdb.find()
                .sort({createdAt: -1}).lean()
                .then(data => {
                    console.log(data);
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
        if(req.session.userLoggedIn === true){
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

exports.getSingleOrderDetails = async (req, res, next) => {
    try{
        console.log(" PRAMASSSSSSSSSSSSSSSSSSS");
        console.log(req.params.id);
        const orderId = { _id: new mongoose.Types.ObjectId(req.params.id)};
        let order = await Orderdb.aggregate([
            {$match: orderId},
            {$unwind: '$products'},
            {$lookup: {
                     from: 'products',
                     localField: 'products.productId',
                     foreignField: '_id',
                     as: 'productInfo'}
            },
            {$lookup: {
                from: 'users',
                localField: 'customerId',
                foreignField: '_id',
                as: 'customerInfo'}
            }
        ]);
        console.log("CART ::::::");
        console.log(JSON.stringify(order));
        delete order.customerInfo.password;
        if(order.length === 0){
            console.log(" No items in cart!!");
        } else{
            order.forEach(product => {
                const prodCategoryName = res.locals.categories.filter(cat => cat._id.equals(product.productInfo.category));
                product.productInfo.category = prodCategoryName[0]?.categoryName;
            });  
            res.locals.subTotal = order.reduce((sum, item) =>{
                return sum + (item.quantity*item.salePrice);
            },0)
            console.log(res.locals.subTotal);
        }
        console.log("Order Items of user: " + order);
        res.locals.order = order;
        next(); 
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to retrieve data from database",
            errStatus : 500
        });
        console.log(err);
    }
}

exports.getOrderSummaryDetails = async (req, res, next) => {
    try{
        const customerId = { customerId: new mongoose.Types.ObjectId(req.session.user._id)};
        let order = await Orderdb.aggregate([
            {$match: customerId},
            {$sort: {createdAt: -1}},
            {$limit : 1},
            {$unwind: '$products'},
            {$lookup: {
                     from: 'products',
                     localField: 'products.productId',
                     foreignField: '_id',
                     as: 'productInfo'}
            }
        ]);
        console.log("SUMARY ::::::");
        console.log(JSON.stringify(order));

        if(order.length === 0){
            console.log(" No items in cart!!");
        } else{
            order.forEach(product => {
                const prodCategoryName = res.locals.categories.filter(cat => cat._id.equals(product.productInfo.category));
                product.productInfo.category = prodCategoryName[0]?.categoryName;
            });  
            res.locals.subTotal = order.reduce((sum, item) =>{
                return sum + (item.quantity*item.salePrice);
            },0)
            console.log(res.locals.subTotal);
        }
        console.log("Order Items of user: " + order);
        res.locals.order = order;
        next(); 
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to retrieve data from database",
            errStatus : 500
        });
        console.log(err);
    }
}

exports.getOrderDetails = async (req, res, next) => {
    try{
        if(req.session.userLoggedIn === true || req.session.adminLoggedIn === true){
            let customerId;
            if(req.path.startsWith('/orders')){
                customerId = {};
            }else{
                customerId = {customerId: new mongoose.Types.ObjectId(req.session.user._id)};
            }
            console.log(customerId);
            let orderItems = await Orderdb.aggregate([
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
            console.log("ORDER ::::::");
            console.log(orderItems)
            console.log(JSON.stringify(orderItems))
            if(orderItems.length === 0){
                console.log(" No items in order!!");
            } else{
                orderItems.forEach(product => {
                    const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(product.productInfo[0].category) );
                    product.productInfo[0].category = prodCategoryName[0]?.categoryName;
                });  
                res.locals.subTotal = orderItems.reduce((sum, item) =>{
                    return sum + (item.quantity*item.salePrice);
                },0)
                console.log(res.locals.subTotal);
            }
            console.log("Order Items of user: " + orderItems);
            res.locals.order = orderItems;
            next(); 
         }
        //   else{
        //     res.locals.requestFrom = "/user/cart";
        //     res.redirect('/user/login');
        // }
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

exports.updateOrderStatus = async (req, res, next) => {
    try{
        console.log(req.body);
        const orderID = req.body.orderID;
        const orderStatus = req.body.orderStatus;
        const editOrder = {
            _id: orderID,
            orderStatus: orderStatus
        }
        await Orderdb.findByIdAndUpdate(orderID, editOrder)
            .then(()=>{
                res.redirect('/admin/orders');
                //next();
            })
            .catch(err =>{
                console.log("Error while updating order status!" + err);
            })
    }catch(err){
        res.status(500).render('error', {
            message: "Error while updating order status!",
            errStatus : 500
        });
        console.log(err);
    }
};