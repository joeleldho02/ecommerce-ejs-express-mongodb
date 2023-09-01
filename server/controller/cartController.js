const Cartdb = require('../model/cartModel');
const Userdb = require('../model/userModel');
const Productdb = require('../model/productModel');
const mongoose = require('mongoose');

exports.getUserCart = async (req, res, next) => {
    try{
        if(req.session.user){
            let cart = await Cartdb.findOne({customerId: req.session.user._id}).lean();
            console.log("Items : " + cart);
            if(cart){
                res.locals.userCart = cart;
                next();
            }
            else{
                next();
            }
        }else{
            res.locals.requestFrom = "/user/cart";
            res.redirect('/user/login');
        }
    } catch(err){
        next();
    }
};

//find and retrieve all product(s) to display in table
exports.getAllCartItems = async (req, res, next) => {
    try{
        if(req.session.user){
            let cartItems = await Cartdb.aggregate([
                {$match: { customerId: new mongoose.Types.ObjectId(req.session.user._id)}},
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
            ]);
            console.log(JSON.stringify(cartItems));
            if(cartItems.length === 0){
                console.log(" No items in cart!!");
            } else{
                cartItems.forEach(product => {
                    const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(product.productInfo[0]?.category) );
                    console.log(JSON.stringify(prodCategoryName));
                    product.productInfo[0].category = prodCategoryName[0]?.categoryName;
                });  
                res.locals.subTotal = cartItems.reduce((sum, item) =>{
                    return sum + (item.quantity*item.salePrice);
                },0)
                console.log(res.locals.subTotal);
            }
            console.log("Cart Items of user: " + cartItems);
            res.locals.cartItems = cartItems;
            next(); 
        } else{
            // res.locals.requestFrom = "/user/cart";
            // res.redirect('/user/login');
            next(); 
        }
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to retrieve data from database",
            errStatus : 500
        });
        console.log(err);
    }
};

//
// exports.addItemToUserCart = async (req, res) => {
//     console.log("ADDING TO CART -------->");
//     const prodId = req.params.id;
//     const qty = req.query.qty;
//     let cart = {};
//     console.log("QTY : " + qty);
//     // if(!req.session.user || req.session.isAdmin){
//     //     return res.json({status: false});
//     // }
//     const userCart = await Userdb.findOne({_id: req.session.user._id},{cart:1, _id:0}).lean().cart;
//     console.log(userCart);
//     if(userCart.length === 0){
//         console.log("New cart created!!");
//         const product = await Productdb.findOne({_id : req.params.id},{productName:1, salePrice:1, category:1}).lean();
//         if(product !== null){
//             userCart.push({
//                 productId: prodId, 
//                 quantity: qty ?? 1,
//                 productName: product.productName,
//                 salePrice: product.salePrice,
//                 category: product.category
//             }); 
//         }                  
//     } else{
//         console.log("Cart already exists!");
//         let flag = 0;
//         for(item of userCart){
//             if(item.productId.equals(new mongoose.Types.ObjectId(prodId)) ){
//                 flag = 1;
//                 item.quantity += Number(qty ?? 1);
//                 break;
//             }
//         }
//         if(flag === 0){
//             userCart.push({productId: prodId, quantity: qty ?? 1});   
//         }
//     }
//     console.log(userCart);
//     const user = {cart: userCart, _id: req.session.user._id};
//     Userdb.findByIdAndUpdate(req.session.user._id, user)
//         .then(()=>{
//             res.json({status: true});
//         })
//         .catch(err => {
//             res.status(500).render('error', {
//                 message: "Unable to add product to cart",
//                 errStatus : 500
//             });
//             console.log(err);
//         });   
// };


//
exports.addToCart = async (req, res, next) => {
    //res.send("Adding to cart");
    console.log("ADDING TO CART -------->");
    const prodId = req.params.id;
    const qty = req.query.qty;
    console.log("QTY : " + qty);
    if(!req.session.user || req.session.isAdmin){
        return res.json({status: false});
    }
    const userCart = await Cartdb.findOne({customerId: req.session.user._id}).lean();
    if(userCart === null){
        const products = [];
        products.push({
            productId: prodId,
            quantity: qty ?? 1
        });
        const newCart = new Cartdb({
            customerId: req.session.user._id,
            products: products
        });
        console.log(newCart);
        newCart.save()
            .then(data => {
                //res.redirect('/admin/category');
                //res.redirect('back');
                res.json({status: true});
            })
            .catch(err => {
                res.status(500).render('error', {
                    message: "Unable to add product to cart",
                    errStatus : 500
                });
                console.log(err);
            });
    } else{
        console.log("Cart already exists!");
        //res.send("Product added to cart!")
        let flag = 0;
        for(item of userCart.products){
            if(item.productId.equals(new mongoose.Types.ObjectId(prodId)) ){
                flag = 1;
                item.quantity += Number(qty ?? 1);
                break;
            }
        }
        if(flag === 0){
            userCart.products.push({productId: prodId, quantity: qty ?? 1});   
        }
        const editCart = new Cartdb(userCart);
        Cartdb.findByIdAndUpdate(userCart._id, editCart)
            .then(()=>{
                //res.redirect('back');
                //res.send("Product added to existing cart!")
                res.json({status: true});
            })
            .catch(err => {
                res.status(500).render('error', {
                    message: "Unable to add product to cart",
                    errStatus : 500
                });
                console.log(err);
            });
    }
};

exports.removeCartItem = async (req, res, next) => {
    console.log("REMOVING CART ITEM -------->");
    const prodId = req.params.id;
    await Cartdb.findOneAndUpdate({customerId: req.session.user._id}, {
        $pull:{products: {productId: new mongoose.Types.ObjectId(prodId)}}
        })
        .then(()=>{
            console.log("removed item from cart");
            res.redirect('/cart');
        })
        .catch(err => {
            res.status(500).render('error', {
                message: "Unable to remove item from cart",
                errStatus : 500
            });
            console.log(err);
        });
};

exports.getCartItemsCount = async (req, res, next) => {
    if(req.session.userLoggedIn === true){
        let cart = await Cartdb.findOne({customerId: req.session.user._id}).lean();
        console.log("Items : " + cart);
        if(cart){
            let count = cart.products.reduce((tot, item)=> {
                return tot + item.quantity;
            }, 0);
            console.log("Items count: " + count);
            res.locals.itemsCount = count;
        }
        next();
    } else{
        next();
    }
    
}

exports.getTotalAmount = async (req, res, next) => {
    try{
        let total = await Cartdb.aggregate([
            {$match: { customerId: req.session.user._id}},
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
            },
            {$group: {
                _id: null,
                total:{$sum:{$multiply:['quantity', 'salePrice']}}
            }}
        ])
        console.log(JSON.stringify(total));
        console.log("Total Amount of cart: " + total); 
        //res.locals.totalAmt = total;
        next();
    } catch(err){

    }
}

exports.changeCartItemQty = async (req, res) => {
    try{
        console.log(req.body);
        if (!req.body) {
            return res.status(500).render('error', {
                message: err || "Data to update cannot be empty"
            });
        }
        console.log("CHANGING PRODUCT QTY TO CART -------->");
        console.log(req.body);
        const userCart = await Cartdb.findOne({customerId: req.session.user._id}).lean();
        if(userCart !== null){
            for(item of userCart.products){
                if(item.productId.equals(new mongoose.Types.ObjectId(req.body.prodId)) ){  
                        item.quantity += Number(req.body.count);
                        console.log(item.quantity);
                        const product = await Productdb.findOne({_id: req.body.prodId}).lean();
                        if(product !== null){
                            console.log("1111");
                            if(item.quantity > product.stock){
                                return res.json({status: false, msg:"Unable to add product quantity! Quantity exceeds available stock."});
                            }
                        }
                        break;
                }
            }            
            const editCart = new Cartdb(userCart);
            Cartdb.findByIdAndUpdate(userCart._id, editCart)
                .then(()=>{
                    //res.redirect('back');
                    //res.send("Product count changed to existing cart!")
                    res.json({status: true});
                })
                .catch(err => {
                    res.status(500).render('error', {
                        message: "Unable to add product to cart",
                        errStatus : 500
                    });
                    console.log(err);
                });
        }else{
            res.json({status: false});
        }
    }catch(err){
        res.status(500).render('error', {
            message: "Unable to add product to cart",
            errStatus : 500
        });
        console.log(err);
    }
}
