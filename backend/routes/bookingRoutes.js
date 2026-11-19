const express = require("express");
const router = express.Router();

const {
  getAllBookings,
  createBooking,
  approveBooking,
  rejectBooking
} = require("../controllers/bookingController");

const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// ກວດສອບ Token ກ່ອນເຂົ້າໃຊ້ API
router.use(verifyToken);

// ດຶງລາຍການຈອງ (Admin ເທົ່ານັ້ນ)
router.get("/", checkRole("Admin"), getAllBookings);

// ສ້າງການຈອງ (Doctor ແລະ Staff)
router.post("/", checkRole("Doctor", "Staff"), createBooking);

// ອະນຸມັດການຈອງ (Admin ເທົ່ານັ້ນ)
router.put("/:id/approve", checkRole("Admin"), approveBooking);

// ປະຕິເສດການຈອງ (Admin ເທົ່ານັ້ນ)
router.put("/:id/reject", checkRole("Admin"), rejectBooking);
module.exports = router;