const express = require("express");
const router = express.Router();

const {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom
} = require("../controllers/roomController");

const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// ກວດສອບ Token ກ່ອນເຂົ້າໃຊ້ API ຫ້ອງປະຊຸມ
router.use(verifyToken);

// ດຶງລາຍການຫ້ອງປະຊຸມ
router.get("/", getAllRooms);

// ເພີ່ມຫ້ອງປະຊຸມ (Admin ເທົ່ານັ້ນ)
router.post("/", checkRole("Admin"), createRoom);

// ແກ້ໄຂຂໍ້ມູນຫ້ອງປະຊຸມ (Admin ເທົ່ານັ້ນ)
router.put("/:id", checkRole("Admin"), updateRoom);

// ລຶບຫ້ອງປະຊຸມ (Admin ເທົ່ານັ້ນ)
router.delete("/:id", checkRole("Admin"), deleteRoom);

module.exports = router;
