'use strict'

const jwt = require('jsonwebtoken')
const User = require('../models/User');

module.exports = function(req,res,next){
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send('Access denied. No token provided')

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET,{ignoreExpiration : true});
        // console.log(decoded)
        req.user = decoded;
        req.user.token = token;

        if(decoded.role == 'user'){
            next()
        }else{
            return res.status(400).send("Permission denied");
        }
      
    }catch(err){
        return res.status(400).send('Invalid token')
    }
}