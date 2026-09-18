const express = require("express");
const route=express.Router();
const {login, register, logout} = require("../controllers/authController");

route.post("/login", login);
route.post("/logout", logout);
route.post("/register", register);

module.exports = route;