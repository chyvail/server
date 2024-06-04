const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");

const authRoute = require("./routes/auth.js");

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve static files from public

// Routes
app.use("/auth", authRoute);

// Mongoose Setup
const PORT = 5000;
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "Properties",
    //useNewURLParser: true, // tells Mongoose how to undeerstand the MongoDB connection
    //useUnifiedTopology: true,
    // these two are how to tell Mongoose to use improved methods of connecting to db, Old ways may cause problems
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running at PORT ${PORT}`));
  })
  .catch((err) => console.log(`${err}. Did not Connect`));
