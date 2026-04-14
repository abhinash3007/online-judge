require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const auth = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const cors = require("cors");
app.use(express.json());
app.use(cors());
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
app.use("/api/auth", auth);
app.use("/api/questions", questionRoutes);

app.listen(5000, () => {
    console.log("server is running on port 5000");
})