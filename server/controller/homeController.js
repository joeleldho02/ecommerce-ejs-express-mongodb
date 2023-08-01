const {Userdb, Admindb, Categorydb, Productdb} = require('../model/model');

//get single product
exports.getProductById = async (req, res, next) => {
    await Productdb.findById(req.params.id).lean()
        .then(data => {
            console.log("Product retrieved: " + data);
            res.locals.product = data;
            next();
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

//find and retrieve all product(s) of a single category
exports.getProducts = async (req, res, next) => {
    console.log(req.params.category);
    await Productdb.find({category: req.params.category}).lean()
        .then(data => {
            console.log("Products retrieved: " + data);
            res.locals.products = data;
            next();
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
