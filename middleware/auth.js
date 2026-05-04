// Checking if user is logged in
const isAuthenticated = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    }
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
    res.status(403).send('Acess denied:Please stop snooping');
};


module.exports = {isAuthenticated, isAdmin, isSalesperson}