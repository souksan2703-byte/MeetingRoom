
const express = require("express");
const router = express.Router();

// ນຳເຂົ້າຟັງຊັນ Login
const { login } = require("../controllers/authController");

// ນຳເຂົ້າ Middleware ກວດສອບ Token ແລະ Role
const {
  verifyToken,
  checkRole
} = require("../middleware/authMiddleware");

// ລະບົບເຂົ້າສູ່ລະບົບ
router.post("/login", login);

// ທົດສອບການກວດສອບ Token
router.get("/me", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "ກວດສອບ Token ສຳເລັດ",
    user: req.user
  });
});

// ທົດສອບສິດການເຂົ້າໃຊ້ງານ Admin
router.get(
  "/admin-check",
  verifyToken,
  checkRole("Admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "ທ່ານມີສິດ Admin",
      user: req.user
    });
  }
);

module.exports = router;
