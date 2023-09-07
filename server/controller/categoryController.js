const Categorydb = require('../model/categoryModel');

//add new category to DB
exports.addCategory = async (req, res, next) => {
    try{
        console.log(req.body);
        if (!req.body) {
            res.redirect('/admin/category');
        }
        else {
            const {categoryName, description, slug, isListed} = req.body;
            const regex = new RegExp("^" + categoryName + "$");
            await Categorydb.findOne({ categoryName: { $regex: regex, $options: 'i' }, isDeleted: false })
                .then(async data => {
                    if (data !== null) {
                        console.log("Category name already exsits!");  
                        // res.redirect('/admin/category');
                        await getAllCategories()
                        .then(data => {
                            res.render('page-category', {
                                pageTitle: "Category Management",
                                categories: data,
                                errMsg: "Oops..!! Category with entered name already exsits.",
                                inputData: req.body
                            });
                        })
                        .catch(err => {
                            res.status(500).render('error', {
                                message: "Unable to add category to database",
                                errStatus : 500
                            });
                            console.log(err);
                        });
                    }
                    else{
                        const newCategory = new Categorydb({
                            categoryName: categoryName,
                            description: description,
                            slug: slug,
                            isListed: isListed === "on" ? true : false
                        })
                        await newCategory.save()
                            .then(data => {
                                res.redirect('/admin/category');
                            })
                            .catch(err => {
                                res.status(500).render('error', {
                                    message: "Unable to add category to database",
                                    errStatus : 500
                                });
                                console.log(err);
                            });
                    }
                })            
        }
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to add category to database",
            errStatus : 500
        });
        console.log(err);
    }
}
//find and retrieve all category(s) to display in table
exports.getAllCategoryDetails = (req, res, next) => {
    console.log("--------------------------------- > HERE1");
    try{
        Categorydb.find({isDeleted: false},{
            categoryName: 1,
            description: 1,
            slug:1,
            isListed: 1
            })
            .collation({locale: "en"})
            .sort({ categoryName: 1 }).lean()
            .then(data => {
                if(data.length !== 0){
                    console.log("Data received: " + data);
                    res.locals.categories = data;
                }
                else{
                    console.log("List is empty");
                    res.locals.categories = [];
                }
                next();           
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

function getAllCategories(){
    console.log("--------------------------------- > HERE3");
    try{
        return new Promise((resolve, reject) => {
            Categorydb.find({isDeleted: false},{
                categoryName: 1,
                description: 1,
                slug:1,
                isListed: 1
                })
                .collation({locale: "en"})
                .sort({ categoryName: 1 }).lean()
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
//get listed categories from the db 
exports.getListedCategories = async (req, res, next) => {
    try{
        await Categorydb.find({isDeleted: false}, {categoryName: 1, isListed:1})
        .collation({locale: "en"})
        .sort({ categoryName: 1 }).lean()
        .then(data => {
            if(data.length !== 0){
                console.log("Data received: " + data);
                res.locals.categories = data;
            }
            else{
                console.log("List is empty");
                res.locals.categories = [];
            }
            next();
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
//get category id of single category 
exports.getCategoryId = (categoryName) => {
    return new Promise((resolve, reject) => {
        try{
            Categorydb.findOne({categoryName: categoryName})
            .then(data => {
                console.log("ID : " + data._id);
                if(data !== null){
                    resolve(data._id)
                }
                else{
                    reject();
                }
            })
            .catch(() => {
                reject();
            });
        } catch{
            reject();
        }        
    });        
};

//update category by category id in db
exports.updateCategory = async (req, res, next) => {
    try{
        if (!req.body) {
            return res.status(500).render('error', {
                message: err.message || "Data to update cannot be empty"
            });
        }
        
        const {id, categoryName, description, slug, isListed} = req.body;
        console.log(JSON.stringify(req.body));
        const regex = new RegExp("^" + categoryName + "$");
        await Categorydb.findOne({ categoryName: { $regex: regex, $options: 'i' }, isDeleted: false, _id:{$ne: id} })
                .then( async data => {
                    if (data !== null) {
                        console.log("Category name already exsits!");   
                        // res.redirect('/admin/category');  
                        await getAllCategories()
                        .then(data => {
                            res.render('page-category', {
                                pageTitle: "Category Management",
                                categories: data,
                                errMsg: "Oops..!! Category with entered name already exsits.",
                                inputData: req.body,
                                action: "edit"
                            });
                        })
                        .catch(err => {
                            res.status(500).render('error', {
                                message: "Unable to add category to database",
                                errStatus : 500
                            });
                            console.log(err);
                        });
                    } else{
                        const id = id;
                        console.log(req.body);
                        const category = {
                            categoryName: categoryName,
                            description: description,
                            slug: slug,
                            isListed: isListed === "on" ? true : false,
                            updatedAt: Date.now(),
                            _id: id
                        }
                        await Categorydb.findByIdAndUpdate(id, category)
                            .then(data => {
                                if (!data) {
                                    res.status(500).render('error', {
                                        message: "Unable to update category",
                                        errStatus : 500
                                    });
                                }
                                else {
                                    const msg = "Category updated successfully!"
                                    res.redirect('/admin/category');
                                    console.log(msg);
                                }
                            })
                            .catch(err => {
                                res.status(500).render('error', {
                                    message: "Error updating category in Database",
                                    errStatus : 500
                                });
                                console.log(err.message);
                            });                        
                    }
                })
    } catch(err){
        res.status(500).render('error', {
            message: "Error updating category in Database",
            errStatus : 500
        });
        console.log(err.message);
    }
};
//delete category with specified categoryID from DB
exports.deleteCategory = (req, res) => {
    try{
        if (!req.body) {
            return res.status(500).render('error', {
                message: "Category ID to delete cannot be empty",
                errStatus : 500
            });
        }
        const id = req.body.categoryID;
        const category = {
            isDeleted: true,
            isListed: false,
            updatedAt: Date.now(),
            _id: id
        }
        Categorydb.findByIdAndUpdate(id, category)
            .then(data => {
                if (!data) {
                    res.status(500).render('error', {
                        message: "Unable to delete category. Category not found!",
                        errStatus : 500
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
                    errStatus : 500
                });
                console.log(err.message);
            });
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to delete category. Error deleting category from Database",
            errStatus : 500
        });
        console.log(err.message);
    }
};

exports.getCategoryCount = async(req, res, next) => {
    try{
        if(req.session.adminLoggedIn === true){
            console.log("Getting Category Count------------>");
            const count = await Categorydb.countDocuments({isDeleted: false});
            if(count){
                console.log("Category Count ::::::::::::::::::");
                res.locals.categoryCount = count;
                console.log(res.locals.categoryCount);
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

