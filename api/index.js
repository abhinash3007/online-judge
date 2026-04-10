require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");

const DB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected to database");
    }
    catch (err) {
        console.log(err, "error in connecting to database");
        process.exit(1); 
    }
} 
DB();
app.listen(5000, () => {
    console.log("server is running on port 5000");
})