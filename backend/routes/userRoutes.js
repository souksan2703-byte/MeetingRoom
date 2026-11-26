
const express = require("express");
const router = express.Router();

const {
  createUser,
  getUsers,
  updateUser
} = require("../controllers/userController");

const {
  verifyToken,
  checkRole
} = require("../middleware/authMiddleware");

// ກວດສອບ Token ທຸກ Route
router.use(verifyToken);

// ດຶງລາຍຊື່ Users
router.get("/", checkRole("Admin"), getUsers);

// ສ້າງ User ໃໝ່
router.post("/", checkRole("Admin"), createUser);

// ແກ້ໄຂຂໍ້ມູນ User
router.put("/:id", checkRole("Admin"), updateUser);

module.exports = router;
