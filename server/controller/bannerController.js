const Bannerdb = require('../model/bannerModel');

//add new banner to DB
exports.addBanner = async (req, res, next) => {
    try{
        console.log(req.body);
        console.log(req.file);
        if (!req.body) {
            res.redirect('/admin/banners');
        }
        else {
            const newBanner = new Bannerdb({
                title: req.body.title,
                description: req.body.description,
                link: req.body.link,
                location: req.body.location,
                image: req.file.filename,
                isActive: req.body.isActive === "on" ? true : false
            })
            await newBanner.save()
                .then(data => {
                    console.log(data);
                    res.redirect('/admin/banners');
                })
                .catch(err => {
                    res.status(500).render('error', {
                        message: "Unable to add banner to database",
                        errStatus : 500
                });
                    console.log(err);
            });
        } 
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to add banner to database",
            errStatus : 500
        });
        console.log(err);
    }
};

function getAllBanners(){
    try{
        return new Promise((resolve, reject) => {
            Bannerdb.find({})
                .collation({locale: "en"})
                .sort({ title: 1 }).lean()
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
//find and retrieve all banner(s) to display in table
exports.getAllBannerDetails = async (req, res, next) => {
    try{
        const data = await getAllBanners();
        if(data.length !== 0){
            console.log("Data received: " + data);
            res.locals.banners = data;
        }
        else{
            console.log("List is empty");
            res.locals.banners = [];
        }
        next();
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to retrieve data from database",
            errStatus : 500
        });
        console.log(err); 
    }
};
//update banner by banner id in db
exports.updateBanner = async (req, res, next) => {
    try{
        if (!req.body) {
            return res.status(500).render('error', {
                message: err || "Data to update cannot be empty"
            });
        }
        console.log(req.body);
        const id = req.body.id;

        const editBanner = {
            title: req.body.title,
            description: req.body.description,
            link: req.body.link,
            location: req.body.location,
            isActive: req.body.isActive === "on" ? true : false,
            _id: id
        };
        if(req.file){
            editBanner.image = req.file.filename;
        } 
        await Bannerdb.findByIdAndUpdate(id, editBanner)
            .then(data => {
                if (!data) {
                    res.status(500).render('error', {
                        message: "Unable to update banner",
                        errStatus : 500
                    });
                }
                else {
                    res.redirect('/admin/banners');
                }
            })
            .catch(err => {
                res.status(500).render('error', {
                    message: "Error updating banner in Database",
                    errStatus : 500
                });
                console.log(err);
            });      
    } catch(err){
        res.status(500).render('error', {
            message: "Error updating banner in Database",
            errStatus : 500
        });
        console.log(err);
    }
};
//delete banner with specified bannerID from DB
exports.deleteBanner = async (req, res) => {
    try{
        if (!req.body) {
            return res.status(500).render('error', {
                message: "Banner ID to delete cannot be empty",
                errStatus : 500
            });
        }
        const id = req.body.bannerID;
        await Bannerdb.findByIdAndDelete(id)
            .then(data => {
                if (!data) {
                    res.status(500).render('error', {
                        message: "Unable to delete banner. Banner not found!",
                        errStatus : 500
                    });
                    console.log("Unable to delete banner. Banner not found!");
                }
                else {
                    console.log("Delete succes: " + data);
                    res.redirect('/admin/banners');
                }
            })
            .catch(err => {
                res.status(500).render('error', {
                    message: "Unable to delete banner. Error deleting banner from Database",
                    errStatus : 500
                });            
                console.log(err);
            });
    } catch(err){
        res.status(500).render('error', {
            message: "Unable to delete banner. Error deleting banner from Database",
            errStatus : 500
        });
        console.log(err);
    }
};