
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { getPool } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);

// Test API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Meeting Room API is running"
  });
});

// Test Database
app.get("/api/health", async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        DB_NAME() AS databaseName,
        GETDATE() AS serverTime
    `);

    res.json({
      success: true,
      message: "Database connected successfully",
      data: result.recordset[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log("--------------------------------");
  console.log("Meeting Room Backend");
  console.log(`Server running: http://localhost:${PORT}`);
  console.log("--------------------------------");
});
