const Cartdb = require('../model/cartModel');
const Orderdb = require('../model/orderModel');
const Productdb = require('../model/productModel');
const mongoose = require('mongoose');
const {addWalletTransactionToDb, getUserWalletBalance} = require('./userController');
const {generateOrderRazorpay, verifyOrderPayment} = require('../helper/razorpay'); 
const invoiceHelper = require('../helper/invoicePDF'); 
const Userdb = require('../model/userModel');

exports.placeOrder = async (req, res, next) => {
    try{
        console.log(req.body);
        
        const {addressId, paymentMethod, totalAmount, discountAmount, discountCoupon} = req.body;
        if(addressId && paymentMethod){
            const userId = req.session.user._id;
            const cartProducts = res.locals.userCart.products;
            console.log("CART PRODUCTS LIST : " + cartProducts);
            console.log(JSON.stringify(cartProducts));

            const address = res.locals.addresses.filter(item => {
                return item._id.equals(addressId);
            });
            const orderId = String((new Date()).getTime()).slice(-6);

            const products = await Cartdb.aggregate([
                {$match: {customerId: new mongoose.Types.ObjectId(userId)}},
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
                    salePrice:'$productInfo.salePrice',
                    productName:'$productInfo.productName',
                    category:'$productInfo.category',
                    productImage:'$productInfo.images[0]'}
                }
            ]);

            if(products.length === 0){
                console.log(" No items in cart!!");
            } else{
                products.forEach(product => {
                    const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(product?.category[0]) );
                    console.log(JSON.stringify(prodCategoryName));
                    product.category[0] = prodCategoryName[0]?.categoryName;
                });  
            }

            console.log("CART products ::::::");
            console.log(JSON.stringify(products));
            const totalItems = cartProducts.reduce((tot, product)=>{
                return product.quantity + tot;
            },0)

            const updateOperations = []
			let isAvailable = true;
            let i = 0;
			for(const item of products) {
				if (item.quantity > item.productInfo[0].stock) {
					isAvailable = false;
                    console.log("1");
					break;
				}
                console.log("2");
				updateOperations.push({
					updateOne: {
						filter: { _id: item.productInfo[0]._id.toString() },
						update: { $inc: { stock: -item.quantity } },
					},
				});
                cartProducts[i].productName = item.productName[0];
                cartProducts[i].category = item.category[0];
                cartProducts[i].salePrice = item.salePrice[0];
                cartProducts[i].productImage = item.productImage[0];
                i++;
			}

            if (!isAvailable) return res.status(400).json({ status: false, errMsg: 'Some items are out of stock' })

            const result = await Productdb.bulkWrite(updateOperations);
			if (result.modifiedCount !== products.length) {
				return res.status(500).json({ status: false, errMsg: 'Something went wrong, Pls try again later' })
			}
            const tempOrder = {
                orderId: orderId,
                customerId: userId,
                paymentMethod: paymentMethod,
                products: cartProducts,
                shippingAddress: address[0],
                totalAmount : totalAmount,
                totalItems : totalItems,
                finalAmount: totalAmount
            };
            if(discountCoupon !== ""){
                tempOrder.coupon = discountCoupon;
                tempOrder.discount = discountAmount;
                tempOrder.totalAmount = Number(totalAmount) + Number(discountAmount);
            }
            const newOrder = new Orderdb(tempOrder);

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
            
            newOrder.save()
                .then(async (savedOrder) => {
                    console.log(savedOrder._id);
                    console.log(savedOrder);
                    if(Number(savedOrder.finalAmount) < 1)  
                        return res.json({status: false, errMsg:'Minimum amount should be ₹1'});
                    if(savedOrder.paymentMethod === 'COD'){
                        console.log("COD: "+savedOrder.paymentMethod);
                        await Cartdb.findOneAndDelete({customerId: req.session.user._id})
                            .then(async ()=>{
                                res.json({payment:true});  
                                console.log("Cleared user cart after order is placed!");
                            })
                            .catch(err => {
                                res.status(500).render('error', {
                                    message: "Unable to clear user cart after order is placed!",
                                    errStatus : 500
                                });
                                console.log(err);
                            });                                             
                    } else if(savedOrder.paymentMethod === 'RAZORPAY'){
                        const generatedOrder = await generateOrderRazorpay(savedOrder._id, savedOrder.finalAmount);
                        res.json({payment:false, method:"razorpay", razorpayOrder: generatedOrder, order: savedOrder});                       
                    } else if(savedOrder.paymentMethod === 'WALLET'){
                        console.log("WALLET: "+savedOrder.paymentMethod);
                        const walletBalance = await getUserWalletBalance(req.session.user._id);
                        if(walletBalance < savedOrder.finalAmount){
                            console.log("Wallet is short of money!");
                            res.json({payment:false, method:"wallet", errMsg:"Insufficent balance in wallet to process the order!"});
                        } else{
                            console.log("WALLET: " + savedOrder.paymentMethod);
                            await addWalletTransactionToDb(req.session.user._id, savedOrder.finalAmount*100, "D", "Debited for order")
                            const paymentDetails = {
                                walletBalance : await getUserWalletBalance(req.session.user._id),
                            }
                            exports.changePaymentStatus(savedOrder._id, paymentDetails, "PAID")
                                .then(async ()=>{
                                    res.json({status:true, method:"wallet"});
                                    await Cartdb.findOneAndDelete({customerId: req.session.user._id});
                                });
                        }
                    }              
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
};
exports.changePaymentStatus = (orderId, payment, status) => {
    const editOrder = {
        _id: orderId,
        paymentStatus: status,
        paymentDetails: payment
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
    try{
        verifyOrderPayment(req.body)
        .then(async ()=>{
            console.log("Payment SUCCESSFUL");
            exports.changePaymentStatus(req.body.order._id, req.body.payment, "PAID")
            .then(()=>{
                res.json({status:true});
            });
            await Cartdb.findOneAndDelete({customerId: req.session.user._id});
        }).catch((err)=>{
            console.log(err);
            res.json({status: false, errMsg:'Payment failed!'});
        });
    } catch(err){
        console.log(err);
        res.json({status: false, errMsg:'Payment failed!'});
    }
};

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
        if(order.length === 0){
            console.log(" No items in cart!!");
        } else{
            order.forEach(product => {
                delete product.customerInfo[0].password;
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
        const orderId = req.params.id;
        if(!orderId){
            return res.status(500).render('error', {
                message: "Error while updating order status!",
                errStatus : 500
            });
        }
        await Orderdb.findById(orderId)
            .then( async (order)=>{
                if(order !== null){
                    //re-stock ordered products
                    const updateOperations = [];
                    let i = 0;
                    for(const item of order.products) {
				        updateOperations.push({
				    	    updateOne: {
				    		    filter: { _id: item.productId.toString() },
				    		    update: { $inc: { stock: item.quantity } },
				    	    },
				        });
                        i++;
			        }
                    const result = await Productdb.bulkWrite(updateOperations);
                    if (result.modifiedCount !== order.products.length) {
                        return res.status(500).render('error', {
                            message: "Unable to return the order",
                            errStatus : 500
                        });
                    }
                    //refund payment
                    const editOrder = {
                        _id: orderId,
                        orderStatus: "CANCELLED"
                    };
                    if(order.paymentStatus === "PAID"){
                        const amount = order.finalAmount*100;
                        const remarks = "Refund of order"
                        await addWalletTransactionToDb(req.session.user._id, amount, "C", remarks)
                            .then((data)=>{
                                console.log(`Refund of amount "₹${data.amount}" is successful!`);
                                // res.json({status:true, data: data});
                                editOrder.paymentStatus = "REFUNDED";
                            })
                            .catch((err)=>{
                                console.log(`Refund of amount failed!`);
                                console.log(err);
                                // res.json({status: false, errMsg:'Payment failed!'});
                            });
                    } else{
                        editOrder.paymentStatus = "NOT PAID";
                    }                    
                    await Orderdb.findByIdAndUpdate(orderId, editOrder)
                            .then(data => {
                                if (!data) {
                                    res.status(500).render('error', {
                                        message: "Unable to cancel the order",
                                        errStatus : 500
                                    });
                                }
                                else {
                                    //res.send(data);   
                                    console.log("Order cancelled successfully!");
                                    res.redirect('/user?tab=orders');
                                }
                            })
                            .catch(err => {
                                res.status(500).render('error', {
                                    message: "Error cancelling the order",
                                    errStatus : 500
                                });
                                console.log(err.message);
                            });                  
                }
            }).catch(err =>{
                    console.log(err);
            });
    } catch(err){
        res.status(500).render('error', {
            message: "Error while updating order status!",
            errStatus : 500
        });
        console.log(err);
    }
};

exports.returnOrder = async (req, res, next) => {
    try{
        const orderId = req.params.id;
        if(!orderId){
            return res.status(500).render('error', {
                message: "Error while updating order status!",
                errStatus : 500
            });
        }
        await Orderdb.findById(orderId)
            .then( async (order)=>{
                if(order !== null){

                    //re-stock ordered products
                    const updateOperations = [];
                    let i = 0;
                    for(const item of order.products) {
				        updateOperations.push({
				    	    updateOne: {
				    		    filter: { _id: item.productId.toString() },
				    		    update: { $inc: { stock: item.quantity } },
				    	    },
				        });
                        i++;
			        }
                    const result = await Productdb.bulkWrite(updateOperations);
                    if (result.modifiedCount !== order.products.length) {
                        return res.status(500).render('error', {
                            message: "Unable to return the order",
                            errStatus : 500
                        });
                    } else{ console.log("Re-stocked all the ordered products!");}

                    //refund payment                    
                    const editOrder = {
                        _id: orderId,
                        orderStatus: "RETURNED"
                    };
                    if(order.paymentStatus === "PAID"){
                        const amount = order.finalAmount*100;
                        const remarks = "Refund of order"
                        await addWalletTransactionToDb(req.session.user._id, amount, "C", remarks)
                            .then((data)=>{
                                console.log(`Refund of amount "₹${data.amount}" is successful!`);
                                // res.json({status:true, data: data});
                                editOrder.paymentStatus = "REFUNDED";
                            })
                            .catch((err)=>{
                                console.log(`Refund of amount failed!`);
                                console.log(err);
                                // res.json({status: false, errMsg:'Payment failed!'});
                            });
                    } else{
                        editOrder.paymentStatus = "NOT PAID";
                    }                    
                    await Orderdb.findByIdAndUpdate(orderId, editOrder)
                            .then(data => {
                                if (!data) {
                                    res.status(500).render('error', {
                                        message: "Unable to cancel the order",
                                        errStatus : 500
                                    });
                                }
                                else {
                                    //res.send(data);   
                                    console.log("Order cancelled successfully!");
                                    res.redirect('back');
                                }
                            })
                            .catch(err => {
                                res.status(500).render('error', {
                                    message: "Error cancelling the order",
                                    errStatus : 500
                                });
                                console.log(err.message);
                            });                  
                }
            }).catch(err =>{
                    console.log(err);
            });
    } catch(err){
        res.status(500).render('error', {
            message: "Error while updating order status!",
            errStatus : 500
        });
        console.log(err);
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

exports.getOrderCount = async(req, res, next) => {
    try{
        if(req.session.adminLoggedIn === true){
            console.log("Getting Order Count------------>");
            const count = await Orderdb.countDocuments({});
            if(count){
                console.log("Count ::::::::::::::::::");
                res.locals.orderCount = count;
                console.log(res.locals.orderCount);
            }
            next();
        } else{
            next();
        }
    }catch(err){
        console.log(err);
        next();
    }
};

exports.getMonthlyOrdersForChart = async(req, res, next) => {
    try{
        if(req.session.adminLoggedIn === true){
            console.log("Getting Order Count------------>");
            const orderData = await Orderdb.aggregate([
                {
                    $group: {
                        _id: {  month: { '$month': "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        orderStats: { $push: { month: "$_id.month", count: "$count" } }
                    }
                },{
                    $project:{_id:0}
                }
            ]);

            const productData = await Orderdb.aggregate([
                {
                    $unwind: '$products'
                },
                {
                    $group: {
                        _id: { month: { '$month': "$createdAt" } },
                        count: { $sum: '$products.quantity' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        productStats: { $push: { month: "$_id.month", count: "$count" } }
                    }
                }, {
                    $project: { _id: 0 }
                }
            ]);
            const salesData = await Orderdb.aggregate([
                {
                    $group: {
                        _id: {  month: { '$month': "$createdAt" } },
                        count: { $sum: '$finalAmount' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        saleStats: { $push: { month: "$_id.month", count: "$count" } }
                    }
                },{
                    $project:{_id:0}
                }
            ]);

            const monthlyOrderData = [0,0,0,0,0,0,0,0,0,0,0,0];
            const monthlyProductData = [0,0,0,0,0,0,0,0,0,0,0,0];
            const monthlySalesData = [0,0,0,0,0,0,0,0,0,0,0,0];

            const orderStats = orderData[0]?.orderStats || [];
            const productStats = productData[0]?.productStats || [];
            const saleStats = salesData[0]?.saleStats || [];

            orderStats.forEach((item)=>{
                monthlyOrderData[item.month-1] = item.count;
            })
            productStats.forEach((item)=>{
                monthlyProductData[item.month-1] = item.count;
            })
            saleStats.forEach((item)=>{
                monthlySalesData[item.month-1] = item.count/10000;
            })

            console.log(monthlyOrderData);
            console.log(monthlyProductData);
            console.log(monthlySalesData);

            res.json({
                status: true, 
                orderData: monthlyOrderData,
                productData: monthlyProductData,
                salesData: monthlySalesData,
            });
        } else{
            res.json({status: false});
        }
    }catch(err){
        console.log(err);
        res.json({status: false});
    }
};

exports.getTotalRevenue = async(req, res, next) => {
    try{
        if(req.session.adminLoggedIn === true){
            console.log("Getting Total Revenue------------>");
            const data = await Orderdb.aggregate([
                {
                    $match:{orderStatus:{$nin:['CANCELLED', 'RETURNED']}, paymentStatus:{$nin:['PENDING', 'REFUNDED']}}
                },
                {
                    $group:{_id:null, totalRevenue: { $sum: "$finalAmount" }}
                },
                {
                    $project:{_id:0}
                }
            ]);
            const totalRevenue = data[0].totalRevenue;
            if(totalRevenue){
                console.log("total Revenue ::::::::::::::::::");
                res.locals.totalRevenue = totalRevenue;
                console.log(res.locals.totalRevenue);
            }
            next();
        } else{
            next();
        }
    }catch(err){
        console.log(err);
        next();
    }
};

exports.getMonthlyTotalRevenue = async(req, res, next) => {
    try{
        if(req.session.adminLoggedIn === true){
            console.log("Getting Monthly Total Revenue------------>");
            const month = new Date().getMonth() + 1;
            const data = await Orderdb.aggregate([
                {
                    $match:{
                        orderStatus:{$nin:['CANCELLED', 'RETURNED']}, 
                        paymentStatus:{$nin:['PENDING', 'REFUNDED']},
                        "$expr": { 
                            "$eq": [ { "$month": "$createdAt" }, month] 
                        } 
                    }
                },
                {
                    $group:{_id:null, totMonthlyRevenue: { $sum: "$finalAmount" }}
                },
                {
                    $project:{_id:0}
                }                
            ]);
            const totalMonthlyRevenue = data[0]?.totMonthlyRevenue || 0;
            console.log("total Monthly Revenue ::::::::::::::::::");
            res.locals.totalMonthlyRevenue = totalMonthlyRevenue;
            console.log(res.locals.totalMonthlyRevenue);
            next();
        } else{
            next();
        }
    }catch(err){
        console.log(err);
        next();
    }
};

exports.getOrderCountPercent = async(req, res, next) => {
    try{
        if(req.session.adminLoggedIn === true){
            console.log("Getting Order Count Percent------------>");   
            const month = new Date().getMonth() + 1;    
            const data = await Orderdb.aggregate([
                {
                    $match: {
                        "$expr": { 
                            "$eq": [ { "$month": "$createdAt" }, month] 
                        } 
                    }
                },
                {
                    $group:{_id:{ status:'$orderStatus'}, count: {$sum :1}}
                },
                {
                    $project:{_id:0, count:1, status:'$_id.status'}
                },
                {
                    $sort: { status : 1}
                }
            ]);
            if(data){
                console.log("Order Count Percent ::::::::::::::::::");
                res.locals.orderCountPercent = data;
                console.log(res.locals.orderCountPercent);
            }
            next();
        } else{
            next();
        }
    }catch(err){
        console.log(err);
        next();
    }
};

exports.getCategoryPerformance = async(req, res, next) => {
    try{
        if(req.session.adminLoggedIn === true){
            console.log("Getting Category Performancet------------>"); 
            const month = new Date().getMonth() + 1;
            const data = await Orderdb.aggregate([
                {
                    $match: {
                        "$expr": {
                            "$eq": [{ "$month": "$createdAt" }, month]
                        }
                    }
                },
                {
                    $unwind:'$products'  
                },
                {
                    $group: { _id: { category: '$products.category' }, count: { $sum: 1 } }
                },
                {
                    $project: { _id: 0, category: '$_id.category', count: 1 }
                },
                {
                    $sort: { category: 1 }
                }
            ]);
            if(data){
                console.log("Category Performance ::::::::::::::::::");
                res.locals.categoryPerformance = data;
                console.log(res.locals.categoryPerformance);
            }
            next();
        } else{
            next();
        }
    }catch(err){
        console.log(err);
        next();
    }
};

// exports.generatePdf = async (req, res, next) => {
//     const puppeteer = require('puppeteer');
//     const fs = require('fs');

//     async function generatePDF(url, outputFile){
//         try{
//             //launch browser
//             const browser = await puppeteer.launch({headless: false});
//             const page = await browser.newPage();

//             // //navigate to page
//             // await page.goto(url, { waitUntil: 'networkidle0' });
//             const html = fs.readFileSync('sample.html', 'utf-8');
//             await page.setContent(html, { waitUntil: 'domcontentloaded' });

//             //To reflect CSS used for screens instead of print
//             await page.emulateMediaType('screen');

//             //generate pdf
//             await page.pdf({
//                 path: outputFile, 
//                 format: 'A4',
//                 margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
//                 printBackground: true
//             });

//             //close browser
//             await browser.close();
//             res.send("PDF Saved!");
//         } catch(err){
//             console.log(err);
//         }
//     }

//     const url = "http://localhost:8080/user/order-invoice/64ec2da84314998bc93bd41d";
//     const outputFile = Date.now() + "out1.pdf";
//     generatePDF(url, outputFile);
// };

exports.generatePdf = async (req, res, next) => {
    const ejs = require('ejs');
    ejs.compile()
}

exports.getOrderSales = async (req, res, next) => {
    try{
        let query;
        let defaultDate = new Date().getFullYear() + "-" +  Number(new Date().getMonth() + 1) + "-" + new Date().getDate();
        console.log(defaultDate);

        if(Object.keys(req.query).length !== 0){
            console.log("YES");
            console.log(req.query.start, req.query.end, req.query.duration);
            if(req.query.start !== "" && req.query.end !== ""){
                let start = new Date(req.query.start), end = new Date(req.query.end);
                if(start.getTime() === end.getTime()) 
                    end.setDate(end.getDate() + 1); 
                query = {createdAt:{"$gte": start, "$lte": end }};
            } else if(req.query.duration !== ""){
                if(req.query.duration === "Today"){
                    let start = new Date(defaultDate), end = new Date(defaultDate);
                    end.setDate(end.getDate() + 1);
                    query = {createdAt:{"$gte": start, "$lte": end }};
                } else if(req.query.duration === "Week"){
                    let start = new Date(), end = new Date();
                    start.setDate(start.getDate() - 7);
                    query = {createdAt:{"$gte": start, "$lte": end }};
                } else if(req.query.duration === "Month"){
                    let start = new Date(), end = new Date();
                    start.setMonth(start.getMonth() - 1);
                    query = {createdAt:{"$gte": start, "$lte": end }};
                } else if(req.query.duration === "Year"){
                    let start = new Date(), end = new Date();
                    start.setYear(start.getYear() - 1);
                    query = {createdAt:{"$gte": start, "$lte": end }};
                }
            } else{
                query = {};
            }
            console.log(query);
        } else {
            console.log("NO");
            let start = new Date(defaultDate), end = new Date(defaultDate);
            end.setDate(end.getDate() + 1);
            query = {createdAt:{"$gte": start, "$lte": end }};
        }
        console.log(query);

        if(req.session.adminLoggedIn === true){
            console.log("Getting Order Sales------------>");
            await Orderdb.find(query)
            .sort({createdAt: -1}).lean()
            .then(data => {
                //console.log(data);
                if(data !== null || data.length !== 0){
                    console.log("Getting Order Sales------------>");
                    res.locals.orders = data;  
                    next(); 
                }
            })
        } else{
            next(); 
        }
    }catch(err){        
        next(); 
        console.log(err);
    }
};

exports.generateInvoicePDF = (req, res, next) => {
    const fs = require('fs');
    const path = require('path');
    const order = res.locals.order;
    const products = []
    order.forEach((product)=>{
        return products.push({
            "quantity": String(product?.products?.quantity),
            "description": String(product?.productInfo[0]?.productName),
            "price": String(product?.products?.salePrice),
            "tax-rate" : "0"
        });
    })
    const data = {
        "client": {
            "company": String(order[0]?.customerInfo[0]?.firstName) + " " + String(order[0]?.customerInfo[0]?.lastName),
            "address": String(order[0]?.shippingAddress?.addressLine1) + " " + String(order[0]?.shippingAddress?.addressLine2),
            "city": String(order[0]?.shippingAddress?.city),
            "country": String(order[0]?.shippingAddress?.state) + " " + String(order[0]?.shippingAddress?.country),
            "zip": String(order[0]?.shippingAddress?.pincode),
        },
        images: {
            logo: fs.readFileSync(path.join(__dirname, "../../public/assets/imgs/theme/logo.png"), 'base64'),
        },    
        "sender": {
            "company": "JMJ Music House",
            "address": "White Field",
            "city": "Bangalore",
            "country": "India",
            "zip": "",
            "custom1": "650013",
            "email" : "orders@jmjmusichouse.com"
        },
        "information": {
            "number": order[0]?._id,
            "date": order[0]?.createdAt.toLocaleDateString(),
        },
        "products": products,
        "bottomNotice": "JMJ Music House 2023",
        "settings": {
            "currency": "INR",
        },
    };
    res.json(data);
}

