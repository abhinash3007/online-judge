const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports.verifyUser = async (req, res, next) => {
    try{
        // Prefer the explicit Authorization header so a stale cookie can never override a fresh login
        const token = req.headers.authorization?.split(" ")[1] || req.cookies.access_token;
        if(!token){
            return res.status(401).json({message: "No token provided"});
        }
        const decoded =  jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        req.user = user;
        next();
    }
    catch(err){
        return res.status(401).json({message: "Invalid token"});
    }
}