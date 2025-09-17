require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/userRoutes"));

// Start server after DB connection
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
