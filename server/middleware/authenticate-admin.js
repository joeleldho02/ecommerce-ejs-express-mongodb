//
exports.authenticateAdmin = (req, res, next) => {
    console.log("Authenticating Admin ----->");
    if(req.session.user !== undefined && req.session.isAdmin){
        next();
    } 
    else if(req.session.user !== undefined && !req.session.isAdmin){
        res.redirect('/');
    }
    else{
        res.redirect('/admin/login');
    }
};