const {Productdb} = require('../model/model');
const mongoose = require('mongoose');

//add new product to DB
exports.addNewProduct = async (req, res) => {
    try{
        console.log(req.body);
        if (!req.body) {
            console.log("Product data not submitted");
            res.redirect('/admin/products');
        }
        else {
            const newProduct = new Productdb({
                productName: req.body.productName,
                description: req.body.description,
                category: req.body.category,
                brand: req.body.brand,
                regularPrice: req.body.regularPrice,
                salePrice: req.body.salePrice,
                quantity: req.body.quantity,
                images: req.files, 
                updatedAt: Date.now(),
            })
            newProduct.save()
                .then(data => {
                    console.log("Added new product: " + data);
                    res.redirect('/admin/products');
                })
                .catch(err => {
                    res.status(500).render('error', {
                        message: "Unable to add product to database",
                        errStatus : 500
                    });
                    console.log(err.message);
                });
        }
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to add product to database",
            errStatus : 500
        });
        console.log(err.message);
    }
}
//find and retrieve all product(s) to display in table
exports.getAllProducts = (req, res, next) => {
    try{
        Productdb.find({},{review: 0, rating: 0})
        .collation({locale: "en"})
        .sort({ category: 1, productName: 1 }).lean()
        .then(data => {
            if(data.length !== 0){
                console.log("Data received: " + data);
                res.locals.products = data;
                next();
            } else{
                res.status(404).render('error', {
                    message: "Oops..! Page not available",
                    errStatus : 404
                }); 
                console.log("Oops..! Page not available");                  
            }                        
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
//get edit product page and fill details of product in inputs
exports.getEditProductItemDetails = async function(req, res, next){
    try{
        await Productdb.find({id :req.params.id}).lean()
            .then(data => {
                if (!data) {
                    res.status(500).render('error', {
                        message: "Unable to find product info!",
                        errStatus : 500
                    });
                    console.log("Unable to find product info!");
                }
                else {
                    if(data.length !== 0){
                        res.locals.product = data;
                        next();
                    } else{
                        res.status(404).render('error', {
                            message: "Oops..! Page not available",
                            errStatus : 404
                        });      
                        console.log("Oops..! Page not available");
                    }        
                }
            })
            .catch(err => {
                res.status(404).render('error', {
                    message: "Oops..! Page not available",
                    errStatus : 404
                });   
                console.log(err.message);
            });                
    } catch(err){
        res.status(404).render('error', {
            message: "Oops..! Page not available",
            errStatus : 404
        });   
        console.log(err.message);
    }
};
//update product item by product id in db
exports.updateProductItem = (req, res) => {
    try{
        console.log(req.body);
    console.log(req.body.productName);
    if (!req.body) {
        console.log("Data to update cannot be empty");
        return res.status(500).render('error', {
            message: "Data to update cannot be empty"
        });
    }
    const id = req.body.productID;
    const product = new Productdb({
        productName: req.body.productName,
        description: req.body.description,
        category: req.body.category,
        brand: req.body.brand,
        regularPrice: req.body.regularPrice,
        salePrice: req.body.salePrice,
        quantity: req.body.quantity,
        // images: req.files,
        updatedAt: Date.now(),
        _id: id
    });

    console.log(product);
    console.log(id);
    Productdb.findByIdAndUpdate(id, product)
        .then(data => {
            console.log(data);
            if (!data) {
                res.status(500).render('error', {
                    message: "Unable to update product",
                    errStatus : 500
                });
                console.log("Unable to update product");
            }
            else {
                //res.send(data);   
                const msg = "Product details updated successfully!"
                res.redirect('/admin/products');
            }
        })
        .catch(err => {
            res.status(500).render('error', {
                message: "Error updating product in Database",
                errStatus : 500
            });
            console.log(err.message);
        });
    } catch(err){
        res.status(500).render('error', {
            message: "Error updating product in Database",
            errStatus : 500
        });
        console.log(err.message);
    }
};
//delete product item with specified productID from DB
exports.deleteProductItem = (req, res) => {
    try{
        if (!req.body) {
            return res.status(500).render('error', {
                message: "Product ID to delete cannot be empty",
                errStatus : 500
            });
        }
        const id = req.body.userID;
        console.log("ID for delete: " + id);
        Productdb.findByIdAndDelete(id)
            .then(data => {
                if (!data) {
                    res.status(500).render('error', {
                        message: "Unable to delete product. Product not found!",
                        errStatus : 500
                    });
                    console.log("Unable to delete product. Product not found!");
                }
                else {
                    console.log("Delete succes: " + data);
                    res.redirect('/admin/products');
                }
            })
            .catch(err => {
                res.status(500).render('error', {
                    message: "Unable to delete product. Error deleting product from Database",
                    errStatus : 500
                });            
                console.log(err.message);
            });
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to delete product. Error deleting product from Database",
            errStatus : 500
        });            
        console.log(err.message);
    }
};
//get single product details by id
exports.getProductItemById = async (req, res, next) => {
    try{        
        //if(mongoose.Types.ObjectId.isValid(req.params.id)){}
        await Productdb.find({id : req.params.id}).lean()
        .then(data => {
            if(data){
                if(data !== null){
                    console.log("Product retrieved: " + data);
                    res.locals.product = data;
                    next();
                } else{
                    res.status(404).render('error', {
                        message: "Oops..! Page not available",
                        errStatus : 404
                    });                
                    console.log("Oops..! Page not available");
                }                
            } else{
                res.status(500).render('error', {
                    message: "Unable to retrieve data from database",
                    errStatus : 500,
                });
                console.log(err.message);
            }
        })
        .catch(err => {
            res.status(404).render('error', {
                message: "Oops..! Page not available",
                errStatus : 404
            });                
            console.log(err.message);
        });
    } catch(err){
        res.status(404).render('error', {
            message: "Oops..! Page not available",
            errStatus : 404
        });      
        console.log(err.message);
    }
};
//find and retrieve all product(s) of a single category
exports.getProductsOfSingleCategory = async (req, res, next) => {
    try{
        if(req.params.category){
            console.log(req.params.category);
            const category = new RegExp(req.params.category);
            console.log(category);
            await Productdb.find({ category: { $regex: category, $options: 'i' }}).lean()
            .then(data => {
                if(data.length !== 0){
                    console.log("Products retrieved: " + data);
                    res.locals.products = data;
                    next();
                }
                else{
                    res.status(404).render('error', {
                        message: "Oops..! Page not available",
                        errStatus : 404
                    });                
                    console.log("Oops..! Page not available");                                  
                }
                
            })           
            .catch(err => {
                res.status(500).render('error', {
                    message: "Unable to retrieve data from database",
                    errStatus : 500
                });
                console.log("Unable to retrieve data from database"); 
            });
        }else{
            res.status(404).render('error', {
                message: "Oops..! Page not available",
                errStatus : 404
            });
        }        
    } catch(err){
        res.status(404).render('error', {
            message: "Unable to retrieve data from database",
            errStatus : 404
        });
        console.log(err.message);
    }
};
