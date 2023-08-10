const Cartdb = require('../model/cartModel');
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
            ])
            if(cartItems.length === 0){
                console.log(" No items in cart!!");
            } else{
                cartItems.forEach(product => {
                    const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(product.productInfo[0].category) );
                    console.log(JSON.stringify(prodCategoryName));
                    product.productInfo[0].category = prodCategoryName[0].categoryName;
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
};

//
exports.addToCart = async (req, res, next) => {
    //res.send("Adding to cart");
    console.log("ADDING TO CART -------->");
    const prodId = req.params.id;
    const qty = req.query.qty;
    console.log("QTY : " + qty);
    const userCart = await Cartdb.findOne({customerId: req.session.user._id}).lean();
    if(userCart === null){
        const newCart = new Cartdb({
            customerId: req.session.user._id,
            products: [{
                productId: prodId,
                quantity: qty ?? 1
            }]
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
                item.quantity += Number(qty);
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
            next();
            //res.send("Product added to existing cart!")
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
    if(req.session.user){
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

// exports.changeCartProductQty = async (req, res) => {
//     try{
//         if (!req.body) {
//             return res.status(500).render('error', {
//                 message: err || "Data to update cannot be empty"
//             });
//         }
//         console.log("CHANGING PRODUCT QTY TO CART -------->");
//         console.log(req.body);
//     }catch(err){
//         res.status(500).render('error', {
//             message: "Unable to add product to cart",
//             errStatus : 500
//         });
//         console.log(err);
//     }
// }
