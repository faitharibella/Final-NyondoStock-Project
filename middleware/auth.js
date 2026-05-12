// Checking if user is logged in
const isAuthenticated = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

//checking if admin is logged in
const isAdmin = (req,res,next) =>{
    if(req.isAuthenticated() && req.user.role === "Admin"){
        return next();
    }
    res.status(403).send('Access denied:Stop tresspassing');
};

//checking if salesperson exists
const isSalesperson = (req,res,next) =>{
    if(req.isAuthenticated() && req.user.role === "Salesperson"){
        return next();
    }
    res.status(403).send('Access denied:Please stop snooping');
};

//checking if manager exists
const isManager = (req,res,next) =>{
    if(req.isAuthenticated() && req.user.role === "Manager"){
        return next();
    }
    res.status(403).send('Access denied:You are not a manager');
};


module.exports = {isAuthenticated, isAdmin, isSalesperson, isManager}