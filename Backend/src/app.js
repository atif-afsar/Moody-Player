const express = require("express");
const cors = require("cors");
const songRoutes = require("./routes/song.routes");
const connectDB = require("./db/db");

const app = express(); // ✅ Initialize app first

app.use(cors());       // ✅ Then use middleware
app.use(express.json());

connectDB();           // ✅ Then connect to DB (if needed)

app.use("/", songRoutes); // ✅ Mount routes

module.exports = app;  // ✅ Export app
