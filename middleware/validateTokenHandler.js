const asynchandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asynchandler(async (req, res, next) => {
    let token;
  
    if (req.cookies && req.cookies.accesstoken) {
        token = req.cookies.accesstoken;
    }
    if (!token) {
        res.status(401);
        throw new Error("Token is missing");
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            res.status(401);
            throw new Error("User not authorized");
        }
        req.user = decoded;
        console.log(decoded);
        next();
    });
});

module.exports = validateToken;
