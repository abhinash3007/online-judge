const express = require("express");
const route=express.Router();
const { getUserSubmissions} = require("../controllers/submissionController");
const { verifyUser } = require("../middleware/verifyUser");

route.get("/user/:id", verifyUser, getUserSubmissions);

module.exports = route;