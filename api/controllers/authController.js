const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

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

        return res.status(200).json({message: "Login successful", token, user: {id: user._id, name: user.name, email: user.email}});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

module.exports.logout = (req, res) => {
    // Must use the same options the cookie was set with, otherwise the browser keeps it
    res.clearCookie("access_token", {httpOnly: false});
    return res.status(200).json({message: "Logout successful"});
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

module.exports.updateProfile = async (req, res) => {
    const {name, photoUrl} = req.body;
    try {
        const user = await User.findById(req.user.id);
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        user.name = name || user.name;
        user.photoUrl = photoUrl || user.photoUrl;
        await user.save();
        return res.status(200).json({message: "Profile updated successfully", user});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

module.exports.getUser = async (req, res) => {
    try {
        // Look up the user named in the URL (/getUser/:id), not the logged-in user from the token.
        const { id } = req.params;
        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({user});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}
