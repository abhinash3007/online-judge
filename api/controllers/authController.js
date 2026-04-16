const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

module.exports.login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).json({message: "Invalid password"});
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
        res.cookie("access_token", token, {httpOnly: false});

        return res.status(200).json({message: "Login successful", token});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

module.exports.register = async (req, res) => {
    const {name, email, password} = req.body;
    try {
        if(!name || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }
        const user = await User.findOne({email});
        if(user) {
            return res.status(400).json({message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({name, email, password: hashedPassword});
        await newUser.save();
        return res.status(201).json({message: "User registered successfully"});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

