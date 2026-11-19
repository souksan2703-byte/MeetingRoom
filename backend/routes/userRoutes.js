const express = require("express");
const router = express.Router();

const { createUser } = require("../controllers/userController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// ກວດສອບ Token ກ່ອນເຂົ້າໃຊ້ API
router.use(verifyToken);

// ເພີ່ມບັນຊີ Doctor ແລະ Staff (Admin ເທົ່ານັ້ນ)
router.post("/", checkRole("Admin"), createUser);

module.exports = router;
