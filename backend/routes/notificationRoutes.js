
const express = require("express");
const router = express.Router();

// ນຳເຂົ້າ Notification Controller
const {
  getNotifications,
  getUnreadCount,
  markAsRead
} = require("../controllers/notificationController");

// ກວດສອບ Token
const { verifyToken } = require("../middleware/authMiddleware");

// ທຸກ API ຕ້ອງ Login ກ່ອນ
router.use(verifyToken);

// ດຶງລາຍການແຈ້ງເຕືອນ
router.get("/", getNotifications);

// ນັບຈຳນວນແຈ້ງເຕືອນທີ່ຍັງບໍ່ອ່ານ
router.get("/unread-count", getUnreadCount);

// ໝາຍວ່າອ່ານແລ້ວ
router.put("/:id/read", markAsRead);

module.exports = router;
