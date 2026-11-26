
const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/authMiddleware");

// ກວດສອບ Token ກ່ອນເຂົ້າໃຊ້ Dashboard
router.use(verifyToken);

// GET /api/dashboard
router.get("/", getDashboardStats);

module.exports = router;
