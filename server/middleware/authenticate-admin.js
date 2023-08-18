//
exports.authenticateAdmin = (req, res, next) => {
    console.log("Authenticating Admin ----->");
    if(req.session.adminLoggedIn === true){
        next();
    } 
    else if(req.session.userLoggedIn === true){
        res.redirect('/');
    }
    else{
        res.redirect('/admin/login');
    }
};