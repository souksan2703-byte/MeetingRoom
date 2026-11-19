
const { getPool, sql } = require("../config/db");

// ຟັງຊັນສະແດງລາຍການຫ້ອງປະຊຸມ
exports.getAllRooms = async (req, res) => {
  try {
    // ເຊື່ອມຕໍ່ຖານຂໍ້ມູນ
    const pool = await getPool();

    // ດຶງຂໍ້ມູນຫ້ອງປະຊຸມທັງໝົດ
    const result = await pool.request().query(`
      SELECT
        room_id,
        room_name,
        capacity,
        location,
        description,
        equipment,
        status,
        created_at,
        updated_at
      FROM Rooms
      ORDER BY room_id DESC
    `);

    // ສົ່ງຂໍ້ມູນກັບໄປ Frontend
    return res.json({
      success: true,
      message: "ດຶງຂໍ້ມູນຫ້ອງປະຊຸມສຳເລັດ",
      data: result.recordset
    });

  } catch (error) {
    console.error("Get rooms error:", error);

    return res.status(500).json({
      success: false,
      message: "ບໍ່ສາມາດດຶງຂໍ້ມູນຫ້ອງປະຊຸມໄດ້"
    });
  }
};

// ຟັງຊັນເພີ່ມຫ້ອງປະຊຸມ
exports.createRoom = async (req, res) => {
  try {
    // ຮັບຂໍ້ມູນຈາກ Frontend
    const {
      roomName,
      capacity,
      location,
      description,
      equipment
    } = req.body;

    // ກວດສອບຂໍ້ມູນທີ່ຈຳເປັນ
    if (!roomName || !roomName.trim()) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາປ້ອນຊື່ຫ້ອງປະຊຸມ"
      });
    }

    if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "ຈຳນວນຄວາມຈຸຕ້ອງເປັນຕົວເລກຫຼາຍກວ່າ 0"
      });
    }

    // ເຊື່ອມຕໍ່ຖານຂໍ້ມູນ
    const pool = await getPool();

    // ກວດສອບຊື່ຫ້ອງຊ້ຳ
    const existingRoom = await pool.request()
      .input("roomName", sql.NVarChar(150), roomName.trim())
      .query(`
        SELECT room_id
        FROM Rooms
        WHERE room_name = @roomName
      `);

    if (existingRoom.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "ຊື່ຫ້ອງປະຊຸມນີ້ມີແລ້ວ"
      });
    }

    // ບັນທຶກຂໍ້ມູນຫ້ອງໃໝ່
    const result = await pool.request()
      .input("roomName", sql.NVarChar(150), roomName.trim())
      .input("capacity", sql.Int, Number(capacity))
      .input("location", sql.NVarChar(255), location || null)
      .input("description", sql.NVarChar(sql.MAX), description || null)
      .input("equipment", sql.NVarChar(sql.MAX), equipment || null)
      .query(`
        INSERT INTO Rooms (
          room_name,
          capacity,
          location,
          description,
          equipment
        )
        OUTPUT INSERTED.room_id
        VALUES (
          @roomName,
          @capacity,
          @location,
          @description,
          @equipment
        )
      `);

    return res.status(201).json({
      success: true,
      message: "ເພີ່ມຫ້ອງປະຊຸມສຳເລັດ",
      roomId: result.recordset[0].room_id
    });

  } catch (error) {
    console.error("Create room error:", error);

    return res.status(500).json({
      success: false,
      message: "ບໍ່ສາມາດເພີ່ມຫ້ອງປະຊຸມໄດ້"
    });
  }
};

 // ຟັງຊັນແກ້ໄຂຂໍ້ມູນຫ້ອງປະຊຸມ
exports.updateRoom = async (req, res) => {
  try {
    // ຮັບ Room ID ຈາກ URL
    const roomId = Number(req.params.id);

    // ຮັບຂໍ້ມູນຈາກ Frontend
    const {
      roomName,
      capacity,
      location,
      description,
      equipment,
      status
    } = req.body;

    // ກວດສອບ Room ID
    if (!Number.isInteger(roomId) || roomId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Room ID ບໍ່ຖືກຕ້ອງ"
      });
    }

    // ກວດສອບຂໍ້ມູນ
    if (!roomName || !roomName.trim()) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາປ້ອນຊື່ຫ້ອງປະຊຸມ"
      });
    }

    if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "ຄວາມຈຸຂອງຫ້ອງບໍ່ຖືກຕ້ອງ"
      });
    }

    const validStatuses = ["Available", "Maintenance", "Inactive"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "ສະຖານະຫ້ອງບໍ່ຖືກຕ້ອງ"
      });
    }

    // ເຊື່ອມຕໍ່ຖານຂໍ້ມູນ
    const pool = await getPool();

    // ກວດສອບວ່າມີຫ້ອງປະຊຸມນີ້ຫຼືບໍ່
    const existingRoom = await pool.request()
      .input("roomId", sql.Int, roomId)
      .query(`
        SELECT room_id
        FROM Rooms
        WHERE room_id = @roomId
      `);

    if (existingRoom.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຫ້ອງປະຊຸມ"
      });
    }

    // ກວດສອບຊື່ຫ້ອງຊ້ຳກັບຫ້ອງອື່ນ
    const duplicateRoom = await pool.request()
      .input("roomName", sql.NVarChar(150), roomName.trim())
      .input("roomId", sql.Int, roomId)
      .query(`
        SELECT room_id
        FROM Rooms
        WHERE room_name = @roomName
          AND room_id <> @roomId
      `);

    if (duplicateRoom.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "ຊື່ຫ້ອງປະຊຸມນີ້ຖືກໃຊ້ແລ້ວ"
      });
    }

    // ອັບເດດຂໍ້ມູນຫ້ອງປະຊຸມ
    await pool.request()
      .input("roomId", sql.Int, roomId)
      .input("roomName", sql.NVarChar(150), roomName.trim())
      .input("capacity", sql.Int, Number(capacity))
      .input("location", sql.NVarChar(255), location || null)
      .input("description", sql.NVarChar(sql.MAX), description || null)
      .input("equipment", sql.NVarChar(sql.MAX), equipment || null)
      .input("status", sql.VarChar(30), status || "Available")
      .query(`
        UPDATE Rooms
        SET
          room_name = @roomName,
          capacity = @capacity,
          location = @location,
          description = @description,
          equipment = @equipment,
          status = @status,
          updated_at = GETDATE()
        WHERE room_id = @roomId
      `);

    return res.json({
      success: true,
      message: "ແກ້ໄຂຂໍ້ມູນຫ້ອງສຳເລັດ"
    });

  } catch (error) {
    console.error("Update room error:", error);

    return res.status(500).json({
      success: false,
      message: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນຫ້ອງໄດ້"
    });
  }
};
// ຟັງຊັນລຶບຫ້ອງປະຊຸມ
exports.deleteRoom = async (req, res) => {
  try {
    const roomId = Number(req.params.id);

    if (!Number.isInteger(roomId) || roomId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Room ID ບໍ່ຖືກຕ້ອງ"
      });
    }

    const pool = await getPool();

    const result = await pool.request()
      .input("roomId", sql.Int, roomId)
      .query(`
        SELECT room_id
        FROM Rooms
        WHERE room_id = @roomId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຫ້ອງປະຊຸມ"
      });
    }

    // ກວດສອບວ່າຫ້ອງນີ້ມີລາຍການຈອງຫຼືບໍ່
    const bookingResult = await pool.request()
      .input("roomId", sql.Int, roomId)
      .query(`
        SELECT TOP 1 booking_id
        FROM Bookings
        WHERE room_id = @roomId
      `);

    if (bookingResult.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "ຫ້ອງນີ້ມີປະຫວັດການຈອງ ບໍ່ສາມາດລຶບໄດ້"
      });
    }

    await pool.request()
      .input("roomId", sql.Int, roomId)
      .query(`
        DELETE FROM Rooms
        WHERE room_id = @roomId
      `);

    return res.json({
      success: true,
      message: "ລຶບຫ້ອງປະຊຸມສຳເລັດ"
    });

  } catch (error) {
    console.error("Delete room error:", error);

    return res.status(500).json({
      success: false,
      message: "ລຶບຫ້ອງປະຊຸມບໍ່ສຳເລັດ"
    });
  }
};