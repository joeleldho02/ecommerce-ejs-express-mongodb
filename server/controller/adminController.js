const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config({path:'config.env'});
const bcrypt = require('bcrypt');
const {Userdb, Admindb, Categorydb, Productdb} = require('../model/model');

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
//admin logout
exports.adminLogout = function(req, res){
    req.session.destroy();
    res.redirect('/admin');
}



//find and retrieve all user(s) to display in table
exports.getUsers = (req, res) => {
    Userdb.find({},{ firstName: 1, lastName: 1, email: 1, phone: 1, isActive: 1}).collation({locale: "en"})
        .sort({ firstName: 1, lastName: 1 }).lean()
        .then(data => {
            console.log("Data received: " + data);
            res.render('page-users', {
                users: data,
                //alertMsg: req.query.status
            });
        })
        .catch(err => {
            res.status(400).render('error', {
                message: "Unable to retrieve data from database",
                errStatus : 400,
                error:{stack: err.message || ""}
            });
        });
    // }
};
//update user by user id in db
exports.updateUser = (req, res) => {
    if (!req.body) {
        return res.status(500).render('error', {
            message: err.message || "Data to update cannot be empty"
        });
    }
    const id = req.body.id;
    const user = new Userdb({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        isActive: req.body.isActive,
        updatedAt: Date.now(),
        _id: id
    })
    Userdb.findByIdAndUpdate(id, user)
        .then(data => {
            if (!data) {
                res.status(500).render('error', {
                    message: "Unable to update user",
                    errStatus : 500,
                    error:{stack: err.message || ""}
                });
            }
            else {
                //res.send(data);   
                const msg = "User details updated successfully!";
                console.log(msg);
                res.redirect('/admin/customers');
            }
        })
        .catch(err => {
            res.status(500).render('error', {
                message: "Error updating user in Database",
                errStatus : 500,
                error:{stack: err.message || ""}
            });
        });
};
//delete user with specified userID from DB
exports.deleteUser = (req, res) => {
    if (!req.body) {
        return res.status(500).render('error', {
            message: "User ID to delete cannot be empty",
            errStatus : 500,
            error:{stack:""}
        });
    }
    const id = req.body.userID;
    console.log("ID for delete: " + id);
    Userdb.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(500).render('error', {
                    message: "Unable to delete user. User data not found!",
                    errStatus : 500,
                    error:{stack:""}
                });
            }
            else {
                console.log("Delete succes: " + data);
                res.redirect('/admin/customers');
            }
        })
        .catch(err => {
            res.status(500).render('error', {
                message: "Unable to delete user. Error deleting user in Database",
                errStatus : 500,
                error:{stack:err.message || ""}
            });
        });
};



//add new product to DB
exports.addProduct = async (req, res) => {
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
            images: req.body.productImage,
            updatedAt: Date.now(),
        })
        newProduct.save()
            .then(data => {
                console.log("Added new product: " + data)
                //res.redirect('back');
                res.redirect('/admin/products');
            })
            .catch(err => {
                res.status(500).render('error', {
                    message: "Unable to add product to database",
                    errStatus : 500,
                    error:{stack: err.message}
                });
            });
    }
}
//find and retrieve all product(s) to display in table
exports.getProducts = (req, res) => {
    Productdb.find({},{
        productName: 1,
        description: 1,
        category: 1,
        salePrice: 1,
        quantity: 1,
        images: 1,
    })
        .collation({locale: "en"})
        .sort({ category: 1, productName: 1 }).lean()
        .then(data => {
            console.log("Data received: " + data);
            res.render('page-products', {
                products: data,
                //alertMsg: req.query.status
            });
        })
        .catch(err => {
            res.status(400).render('error', {
                message: "Unable to retrieve data from database",
                errStatus : 400,
                error:{stack: err.message || ""}
            });
        });
    // }
};
//get edit product page and fill details of product in input
exports.editProduct = async function(req, res){
    console.log(req.params.id);
    if(req.params.id){
        await Productdb.findById(req.params.id).lean()
        .then(data => {
            console.log(data);
            if (!data) {
                res.status(500).render('error', {
                    message: "Unable to find product info!",
                    errStatus : 500,
                    error:{stack:""}
                });
            }
            else {
                res.render('page-add-product', {
                    title:'Edit product',       
                    navTitle: 'Edit user',
                    product: data,
                });
            }
        })
        .catch(err => {
            res.status(500).render('error', {
                message: "Error finding product in Database!",
                errStatus : 500,
                error:{stack:err.message || ""}
            });
        });                
    } 
    else
        res.redirect('back');
};
//update product by product id in db
exports.updateProduct = (req, res) => {
    if (!req.body) {
        return res.status(500).render('error', {
            message: err.message || "Data to update cannot be empty"
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
        images: req.body.productImage,
        updatedAt: Date.now(),
        _id: id
    })
    Productdb.findByIdAndUpdate(id, product)
        .then(data => {
            if (!data) {
                res.status(500).render('error', {
                    message: "Unable to update product",
                    errStatus : 500,
                    error:{stack: err.message || ""}
                });
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
                errStatus : 500,
                error:{stack: err.message || ""}
            });
        });
};
//delete product with specified productID from DB
exports.deleteProduct = (req, res) => {
    if (!req.body) {
        return res.status(500).render('error', {
            message: "Product ID to delete cannot be empty",
            errStatus : 500,
            error:{stack:""}
        });
    }
    const id = req.body.userID;
    console.log("ID for delete: " + id);
    Productdb.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(500).render('error', {
                    message: "Unable to delete product. Product not found!",
                    errStatus : 500,
                    error:{stack:""}
                });
            }
            else {
                console.log("Delete succes: " + data);
                res.redirect('/admin/products');
            }
        })
        .catch(err => {
            res.status(500).render('error', {
                message: "Unable to delete product. Error deleting product from Database",
                errStatus : 500,
                error:{stack:err.message || ""}
            });
        });
};



//add new category to DB
exports.addCategory = async (req, res) => {
    console.log(req.body);
    if (!req.body) {
        console.log("Category data not submitted");
        res.redirect('/admin/category');
    }
    else {
        const newCategory = new Categorydb({
            categoryName: req.body.categoryName,
            description: req.body.description,
            isListed: req.body.isListed
        })
        newCategory.save()
            .then(data => {
                console.log("Added new category: " + data)
                //res.redirect('back');
                res.redirect('/admin/category');
            })
            .catch(err => {
                res.status(500).render('error', {
                    message: "Unable to add category to database",
                    errStatus : 500,
                    error:{stack: err.message}
                });
            });
    }
}
//find and retrieve all category(s) to display in table
exports.getCategory = (req, res) => {
    Categorydb.find({},{
        categoryName: 1,
        description: 1,
        isListed: 1
    })
        .collation({locale: "en"})
        .sort({ categoryName: 1 }).lean()
        .then(data => {
            console.log("Data received: " + data);
            res.render('page-category', {
                categories: data,
                //alertMsg: req.query.status
            });
        })
        .catch(err => {
            res.status(400).render('error', {
                message: "Unable to retrieve data from database",
                errStatus : 400,
                error:{stack: err.message || ""}
            });
        });
    // }
};
//update category by category id in db
exports.updateCategory = (req, res) => {
    if (!req.body) {
        return res.status(500).render('error', {
            message: err.message || "Data to update cannot be empty"
        });
    }
    const id = req.body.id;
    const user = new Categorydb({
        categoryName: req.body.categoryName,
        description: req.body.description,
        isListed: req.body.isListed,
        updatedAt: Date.now(),
        _id: id
    })
    Categorydb.findByIdAndUpdate(id, user)
        .then(data => {
            if (!data) {
                res.status(500).render('error', {
                    message: "Unable to update category",
                    errStatus : 500,
                    error:{stack: err.message || ""}
                });
            }
            else {
                //res.send(data);   
                const msg = "Category updated successfully!"
                res.redirect('/admin/category');
            }
        })
        .catch(err => {
            res.status(500).render('error', {
                message: "Error updating category in Database",
                errStatus : 500,
                error:{stack: err.message || ""}
            });
        });
};
//delete category with specified categoryID from DB
exports.deleteCategory = (req, res) => {
    if (!req.body) {
        return res.status(500).render('error', {
            message: "Category ID to delete cannot be empty",
            errStatus : 500,
            error:{stack:""}
        });
    }
    const id = req.body.categoryID;
    Categorydb.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(500).render('error', {
                    message: "Unable to delete category. Category not found!",
                    errStatus : 500,
                    error:{stack:""}
                });
            }
            else {
                console.log("Delete succes: " + data);
                res.redirect('/admin/category');
            }
        })
        .catch(err => {
            res.status(500).render('error', {
                message: "Unable to delete category. Error deleting category from Database",
                errStatus : 500,
                error:{stack:err.message || ""}
            });
        });
};