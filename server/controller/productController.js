const Productdb = require('../model/productModel');
const categoryController = require('./categoryController');
const mongoose = require('mongoose');
 
//add new product to DB
exports.addNewProduct = async (req, res) => {
    try{
        console.log(req.body);
        console.log(req.files);
        console.log(JSON.stringify(req.body));
        if (!req.body) {
            console.log("Product data not submitted");
            res.redirect('/admin/products');
        } 
        else if(req.files.length <= 0){
            console.log("Product images not submitted");
            res.redirect('/admin/products');
        } 
        else {
            
            const {productName, category, shortDescription, description, brand, regularPrice, salePrice, taxRate, stock, tags, sku} = req.body;
            await categoryController.getCategoryId(category)
                .then(catergoryId => {                    
                    const imageFiles = req.files.map(file => {
                        return file.filename;
                    });
                    const newProduct = new Productdb({
                        productName: productName,
                        shortDescription: shortDescription,
                        description: description,
                        category: catergoryId,
                        brand: brand,
                        regularPrice: regularPrice,
                        salePrice: salePrice,
                        taxRate: taxRate,
                        stock: stock,
                        tags: tags,
                        SKU:sku,
                        images: imageFiles, 
                        updatedAt: Date.now()
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
        Productdb.find({isDeleted: false},{review: 0, rating: 0})
        .collation({locale: "en"})
        .sort({ category: 1, productName: 1 }).lean()
        .then(data => {
            if(data.length !== 0){
                if(res.locals.categories){
                    data.forEach(product => {
                        const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(product.category) );
                        product.category = prodCategoryName[0]?.categoryName;
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
        console.log("LENGTH OF IMAGES : " + req.files.length);
        console.log(req.body);
        if (!req.body) {
            console.log("Data to update cannot be empty");
            return res.status(500).render('error', {
                message: "Data to update cannot be empty"
            });
        }       
        const {productName, category, shortDescription, description, brand, regularPrice, salePrice, taxRate, stock, tags, sku} = req.body;
        await categoryController.getCategoryId(category)
                .then(catergoryId => {
                    const id = req.body.productID;
                    let imageFiles = [];
                    const product = {
                        productName: productName,
                        shortDescription: shortDescription,
                        description: description,
                        category: catergoryId,
                        brand: brand,
                        regularPrice: regularPrice,
                        salePrice: salePrice,
                        taxRate: taxRate,
                        stock: stock,
                        tags: tags,
                        SKU:sku,
                        updatedAt: Date.now(),
                        _id: id
                    };
                    if(req.files.length > 0){
                        imageFiles = req.files.map(file => {
                            return file.filename;
                        });
                        product.images = imageFiles;
                    } else if (req.body.productImage){
                        product.images = req.body.productImage;
                    }
                    console.log("EDITED PRODUCT --------> " + product);
                    console.log(JSON.stringify(product));
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
        const id = req.body.productID;
        const product = {
            isDeleted:true,
            updatedAt: Date.now(),
            _id: id
        };
        Productdb.findByIdAndUpdate(id, product)
                    .then(data => {
                        if (!data) {
                            res.status(500).render('error', {
                                message: "Unable to delete product",
                                errStatus : 500
                            });
                            console.log("Unable to delete product");
                        }
                        else {
                            console.log("Delete succes: " + data);
                            res.redirect('/admin/products');
                        }
                    })
                    .catch(err => {
                        res.status(500).render('error', {
                            message: "Error deleteing product in Database",
                            errStatus : 500
                        });
                        console.log(err);
                    });
        // Productdb.findByIdAndDelete(id)
        //     .then(data => {
        //         if (!data) {
        //             res.status(500).render('error', {
        //                 message: "Unable to delete product. Product not found!",
        //                 errStatus : 500
        //             });
        //             console.log("Unable to delete product. Product not found!");
        //         }
        //         else {
        //             console.log("Delete succes: " + data);
        //             res.redirect('/admin/products');
        //         }
        //     })
        //     .catch(err => {
        //         res.status(500).render('error', {
        //             message: "Unable to delete product. Error deleting product from Database",
        //             errStatus : 500
        //         });            
        //         console.log(err);
        //     });
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
        await Productdb.findOne({_id : req.params.id, isDeleted: false}).lean()
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
                console.log("Unable to retrieve data from database");
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
            res.locals.category = req.params.category;
            let prodCategoryId = res.locals.categories.filter( cat => cat.categoryName.toLowerCase() === req.params.category.toLowerCase());
            prodCategoryId = prodCategoryId[0]?._id;
            console.log("CATEGORY ID : RELATED PRODUCTS : " + prodCategoryId);
            //console.log(JSON.stringify(prodCategoryId));
            
            console.log(req.query);

            const totalCount = await Productdb.countDocuments({ category: prodCategoryId, isDeleted: false});
            const limit = parseInt(req.query.limit) || 3;
            const totalPages = Math.ceil(totalCount/limit) || 1;
            let currentPage = parseInt(req.query.page) - 1 || 0; 
            if(currentPage !== 0)
                currentPage = (currentPage+1) > totalPages ? 0 : (currentPage+1);
            let sort = req.query.sort || {};  
            if(sort === "p-asc"){
                sort = {salePrice: 1};
            } else if(sort === "p-desc") {
                sort = {salePrice: -1};
            } else {
                sort = {};
            }
            console.log(totalCount);
            console.log(limit);
            console.log(totalPages);
            console.log(currentPage); 

            await Productdb.find({ category: prodCategoryId, isDeleted: false})
            .skip(limit*currentPage)
            .limit(limit)
            .sort(sort)
            .lean()
            .then(data => {                
                // console.log(JSON.stringify(data));
                if(data.length !== 0){
                    console.log("111111");
                    data.forEach(product => {
                        const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(product?.category) );
                        product.category = prodCategoryName[0]?.categoryName;
                    });                 
                    console.log("2222");
                    res.locals.products = data;
                    // res.locals.currentPage = limit >= totalCount ? 0 : (currentPage+1);
                    res.locals.currentPage = currentPage+1;
                    res.locals.totalPages = totalPages;
                    res.locals.totalCount = totalCount;
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

//search and retrieve product(s)
exports.getSearchProducts = async (req, res, next) => {
    try{
        console.log(req.query);  
        let prodCategoryId, query;
        const regex = new RegExp(req.query.p);
        if(req.query.c && req.query.c !== ""){
            prodCategoryId = res.locals.categories.filter( cat => cat.categoryName.toLowerCase() === req.query?.c.toLowerCase());
            res.locals.category = prodCategoryId[0]?.categoryName;
            prodCategoryId = prodCategoryId[0]?._id;
            query = {
                category: prodCategoryId,               
                $or:[
                    {productName: { $regex: regex, $options: 'i' }}, 
                    {brand: { $regex: regex, $options: 'i' }}, 
                    {shortDescription: { $regex: regex, $options: 'i' }}, 
                    {description: { $regex: regex, $options: 'i' }}, 
                ],
                isDeleted: false
            };
        } else {
            query = {
                $or:[
                    {productName: { $regex: regex, $options: 'i' }}, 
                    {brand: { $regex: regex, $options: 'i' }}, 
                    {shortDescription: { $regex: regex, $options: 'i' }}, 
                    {description: { $regex: regex, $options: 'i' }}, 
                ],
                isDeleted: false
            };
        }
        console.log("CATEGORY ID : RELATED PRODUCTS : " + prodCategoryId);
        const totalCount = await Productdb.countDocuments(query);
        const limit = parseInt(req.query.limit) || 3;
        const totalPages = Math.ceil(totalCount/limit) || 1;
        let currentPage = parseInt(req.query.page) - 1 || 0;
        if(currentPage !== 0 && (currentPage+1) > totalPages)
            currentPage = 0;
        let sort = req.query.sort || {};  
        if(sort === "p-asc"){
            sort = {salePrice: 1};
        } else if(sort === "p-desc") {
            sort = {salePrice: -1};
        } else {
            sort = {};
        }          
        console.log(totalCount);
        console.log(limit);
        console.log(totalPages);
        console.log(currentPage); 
        console.log(query); 

        
        res.locals.totalCount = totalCount;

        await Productdb.find(query)
        .skip(limit*currentPage)
        .limit(limit)
        .sort(sort)
        .lean()
        .then(data => {
            if(data.length !== 0){
                data.forEach(product => {
                    const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(product?.category) );
                    product.category = prodCategoryName[0]?.categoryName;
                });                 
                res.locals.products = data;
                res.locals.totalPages = totalPages;
                res.locals.currentPage = currentPage+1;
                next();
            }
            else{         
                console.log("Search products not available!");     
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
    } catch(err){
        res.status(404).render('error', {
            message: "Unable to retrieve data from database",
            errStatus : 404
        });
        console.log(err);
    }
};

//find and retrieve featured product(s) to display in table
exports.getFeaturedProducts = (req, res, next) => {
    try{
        Productdb.find({isDeleted: false},{review: 0, rating: 0})
        .limit(8).lean()
        .then(data => {
            if(data.length !== 0){
                if(res.locals.categories){
                    data.forEach(product => {
                        const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(product.category) );
                        product.category = prodCategoryName[0]?.categoryName;
                    });    
                    res.locals.featuredProds = data;
                    next();
                }
                else{
                    res.locals.featuredProds = data;
                    next();
                }
            } else{
                next();
                console.log("No featured products available to show!");                  
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
//find and retrieve 12 product(s) of a single category
exports.getNewArrivalProducts = async (req, res, next) => {
    try{
        await Productdb.find({isDeleted: false})
        .sort({createdAt: -1})
        .limit(7).lean()
        .then(data => {                
            console.log(JSON.stringify(data));
            if(data.length !== 0){
                data.forEach(product => {
                    const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(product.category) );
                    product.category = prodCategoryName[0]?.categoryName;
                });                 
                res.locals.newArrivalProds = data;
                next();
            }
            else{
                res.locals.newArrivalProds = data;
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
    } catch(err){
        res.status(404).render('error', {
            message: "Unable to retrieve data from database",
            errStatus : 404
        });
        console.log(err);
    }
};
//find and retrieve 3 product(s) of a single category
exports.getNewProductsOfCategory = async (req, res, next) => {
    try{
        if(req.params.category){
            const prodCategoryId = res.locals.categories.filter( cat => cat.categoryName.toLowerCase() === req.params.category.toLowerCase());
            console.log("CATEGORY ID : RELATED PRODUCTS : " + prodCategoryId);
            console.log(JSON.stringify(prodCategoryId));
            await Productdb.find({ category: prodCategoryId, isDeleted: false})
            .sort({createdAt: -1}).limit(3).lean()
            .then(data => {                
                console.log(JSON.stringify(data));
                if(data.length !== 0){
                    data.forEach(product => {
                        const prodCategoryName = res.locals.categories.filter( cat => cat._id.equals(product.category) );
                        product.category = prodCategoryName[0]?.categoryName;
                    });                 
                    res.locals.newProducts = data;
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

exports.getProductCount = async(req, res, next) => {
    try{
        if(req.session.adminLoggedIn === true){
            console.log("Getting Product Count------------>");
            const count = await Productdb.countDocuments({isDeleted: false});
            if(count){
                console.log("Product Count ::::::::::::::::::"+ count);
                res.locals.productCount = count;
                console.log(res.locals.productCount);
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