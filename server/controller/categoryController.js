const {Categorydb} = require('../model/model');

//add new category to DB
exports.addCategory = async (req, res) => {
    try{
        console.log(req.body);
        if (!req.body) {
            res.redirect('/admin/category');
        }
        else {
            const newCategory = new Categorydb({
                categoryName: req.body.categoryName,
                description: req.body.description,
                isListed: req.body.isListed === "on" ? true : false
            })
            newCategory.save()
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
    try{
        Categorydb.find({},{
            categoryName: 1,
            description: 1,
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
//get listed categories from the db 
exports.getListedCategories = async (req, res, next) => {
    try{
        await Categorydb.find({}, {categoryName: 1, isListed:1})
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
                console.log(data);
                console.log("ID : " + data._id);
                if(data !== null){
                    console.log("1");
                    resolve(data._id)
                }
                else{
                    reject();
                }
            })
            .catch(() => {
                console.log("3");
                reject();
            });
        } catch{
            console.log("4");
            reject();
        }        
    });        
};

//update category by category id in db
exports.updateCategory = (req, res) => {
    try{
        if (!req.body) {
            return res.status(500).render('error', {
                message: err.message || "Data to update cannot be empty"
            });
        }
        const id = req.body.id;
        const user = new Categorydb({
            categoryName: req.body.categoryName,
            description: req.body.description,
            isListed: req.body.isListed === "on" ? true : false,
            updatedAt: Date.now(),
            _id: id
        })
        Categorydb.findByIdAndUpdate(id, user)
            .then(data => {
                if (!data) {
                    res.status(500).render('error', {
                        message: "Unable to update category",
                        errStatus : 500
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
                    errStatus : 500
                });
                console.log(err.message);
            });
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
        Categorydb.findByIdAndDelete(id)
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