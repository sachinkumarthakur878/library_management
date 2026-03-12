require("dotenv").config();
const express = require('express'); 
const app = express(); 
const cors = require('cors'); 
const mongoose = require("mongoose");
const users = require("./routes/user.js") 
const books = require("./routes/books.js")
const admin = require("./routes/admin.js")
const librarian = require("./routes/librarian.js")
const home = require("./routes/home.js")

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(express.json()); // Parse JSON
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use("/users",users);
app.use("/books",books);
app.use("/admin",admin);
app.use("/librarian",librarian);
app.use("/home",home);

app.get("/", (req, res) => {
    res.send("API is running...");
  });
  
  const PORT = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
     mongoose.connect(uri);
     
     console.log("DB Connected")
  });