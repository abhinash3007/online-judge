const express = require("express");
const route=express.Router();
const {login, register, logout, getUser, updateProfile, getUserByPoints, getUserWithMostCorrectSubmissions} = require("../controllers/authController");
const { verifyUser } = require("../middleware/verifyUser");

route.post("/login", login);
route.post("/logout", logout);
route.post("/register", register);
route.get("/getUser/:id",verifyUser, getUser);
route.put("/updateProfile/:id",verifyUser, updateProfile);
route.get("/mostPoints", getUserByPoints);
route.get("/correctSubmissions", getUserWithMostCorrectSubmissions);

module.exports = route;