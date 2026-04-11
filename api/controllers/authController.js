const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const User = require("../models/user");

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
        return res.status(200).json({message: "Login successful"});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

module.exports.register = async (req, res) => {
    const {name, email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(user) {
            return res.status(400).json({message: "User already exists"});
        }
        if(!name || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({name, email, password: hashedPassword});
        await newUser.save();
        return res.status(201).json({message: "User registered successfully"});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

