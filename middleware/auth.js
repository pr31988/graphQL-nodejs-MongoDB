const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
    //const authHeader = req.get('Authorization');
    const authHeader = req.headers.authorization;
    if(!authHeader){
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1];
    let decodeToken;
    try{
        decodeToken = jwt.verify(token, 'somesupersecreate');
    } catch(err) {
        req.isAuth = false;
        return next();
    }
    if (!decodeToken) {
        req.isAuth = false;
        return next();
    }
    req.userId = decodeToken.userId;
    req.isAuth = true;
    next();
};