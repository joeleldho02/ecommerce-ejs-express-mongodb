const {Productdb} = require('../model/model');
const categoryController = require('./categoryController');

//add new product to DB
exports.addNewProduct = async (req, res) => {
    try{
        if (!req.body) {
            console.log("Product data not submitted");
            res.redirect('/admin/products');
        }
        else {
            await categoryController.getCategoryId(req.body.category)
                .then(catergoryId => {
                    const newProduct = new Productdb({
                        productName: req.body.productName,
                        description: req.body.description,
                        category: catergoryId,
                        brand: req.body.brand,
                        regularPrice: req.body.regularPrice,
                        salePrice: req.body.salePrice,
                        quantity: req.body.quantity,
                        images: req.files, 
                        updatedAt: Date.now(),
                    });
                    console.log(newProduct);
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
                            console.log(err);
                        });
                })
        }
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to add product to database",
            errStatus : 500
        });
        console.log(err);
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
                if(res.locals.categories){
                    data.forEach(product => {
                        const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(product.category) );
                        product.category = prodCategoryName[0].categoryName;
                    });    
                    res.locals.products = data;
                    next();
                }
                else{
                    res.locals.products = data;
                    // res.status(404).render('error', {
                    //     message: "Oops..! Page not available",
                    //     errStatus : 404
                    // }); 
                    // console.log("No categories received!");
                    next();
                }
            } else{
                next();
                // res.status(404).render('error', {
                //     message: "Oops..! Page not available",
                //     errStatus : 404
                // }); 
                console.log("No products available to show!");                  
            }                        
        })
        .catch(err => {
            res.status(500).render('error', {
                message: "Unable to retrieve data from database",
                errStatus : 500
            });
            console.log(err);
        });
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to retrieve data from database",
            errStatus : 500
        });
        console.log(err);
    }
};
//get edit product page and fill details of product in inputs
exports.getEditProductItemDetails = async function(req, res, next){
    try{
        console.log("ID : " + req.params.id);
        await Productdb.findOne({_id :req.params.id}).lean()
            .then(data => {
                if (!data) {
                    res.status(500).render('error', {
                        message: "Unable to find product info!",
                        errStatus : 500
                    });
                    console.log("Unable to find product info!");
                }
                else {
                    if(data !== null){
                        const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(data.category) );
                        data.category = prodCategoryName[0].categoryName;
                        res.locals.product = data;
                        //console.log(JSON.stringify(res.locals.product));
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
                console.log(err);
            });                
    } catch(err){
        console.log("5");
        res.status(404).render('error', {
            message: "Oops..! Page not available",
            errStatus : 404
        });   
        console.log(err);
    }
};
//update product item by product id in db
exports.updateProductItem = async (req, res) => {
    try{
        console.log(req.body);
        if (!req.body) {
            console.log("Data to update cannot be empty");
            return res.status(500).render('error', {
                message: "Data to update cannot be empty"
            });
        }
        await categoryController.getCategoryId(req.body.category)
                .then(catergoryId => {
                    const id = req.body.productID;
                    const product = new Productdb({
                        productName: req.body.productName,
                        description: req.body.description,
                        category: catergoryId,
                        brand: req.body.brand,
                        regularPrice: req.body.regularPrice,
                        salePrice: req.body.salePrice,
                        quantity: req.body.quantity,
                        // images: req.files,
                        updatedAt: Date.now(),
                        _id: id
                    });
                    Productdb.findByIdAndUpdate(id, product)
                    .then(data => {
                        if (!data) {
                            res.status(500).render('error', {
                                message: "Unable to update product",
                                errStatus : 500
                            });
                            console.log("Unable to update product");
                        }
                        else {
                            res.redirect('/admin/products');
                        }
                    })
                    .catch(err => {
                        res.status(500).render('error', {
                            message: "Error updating product in Database",
                            errStatus : 500
                        });
                        console.log(err);
                    });
                })   
    } catch(err){
        res.status(500).render('error', {
            message: "Error updating product in Database",
            errStatus : 500
        });
        console.log(err);
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
                console.log(err);
            });
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to delete product. Error deleting product from Database",
            errStatus : 500
        });            
        console.log(err);
    }
};
//get single product details by id
exports.getProductItemById = async (req, res, next) => {
    try{        
        //if(mongoose.Types.ObjectId.isValid(req.params.id)){}
        await Productdb.findOne({_id : req.params.id}).lean()
        .then(data => {
            if(data){
                if(data !== null){
                    const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(data.category) );
                    data.category = prodCategoryName[0].categoryName;
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
                console.log(err);
            }
        })
        .catch(err => {
            res.status(404).render('error', {
                message: "Oops..! Page not available",
                errStatus : 404
            });                
            console.log(err);
        });
    } catch(err){
        res.status(404).render('error', {
            message: "Oops..! Page not available",
            errStatus : 404
        });      
        console.log(err);
    }
};
//find and retrieve all product(s) of a single category
exports.getProductsOfSingleCategory = async (req, res, next) => {
    try{
        if(req.params.category){
            const prodCategoryId = res.locals.categories.filter( cat => cat.categoryName.toLowerCase() === req.params.category.toLowerCase());
            await Productdb.find({ category: prodCategoryId}).limit(8).lean()
            .then(data => {
                if(data.length !== 0){
                    data.forEach(product => {
                        const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(product.category) );
                        product.category = prodCategoryName[0].categoryName;
                    });                 
                    res.locals.products = data;
                    next();
                }
                else{
                    // res.status(404).render('error', {
                    //     message: "Oops..! Page not available",
                    //     errStatus : 404
                    // });                
                    console.log("Related products not available!");     
                    next();                             
                }
                
            })           
            .catch(err => {
                res.status(500).render('error', {
                    message: "Unable to retrieve data from database",
                    errStatus : 500
                });
                console.log("Unable to retrieve data from database! " + err); 
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
        console.log(err);
    }
};
