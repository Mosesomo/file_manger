const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const validateToken = asyncHandler(async (req, res, next) => {
    let token
    let authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
            if (err) {
                res.status(401).json({Error: "unauthorized"});
                throw new Error('Unauthourized');
            }
            req.user = decoded.user;
            next();
        });
    } else {
        res.status(401).json({Error: "User not authorized or token expired"})
        throw new Error("Token expired")
    }
});

module.exports = validateToken;