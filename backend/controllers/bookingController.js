const { sql, getPool } = require("../config/db");

// ດຶງລາຍການຈອງຫ້ອງປະຊຸມທັງໝົດ
exports.getAllBookings = async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        b.booking_id,
        b.room_id,
        r.room_name,
        b.user_id,
        u.full_name,
        b.meeting_title,
        b.booker_name,
        b.department,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.attendees,
        b.note,
        b.status,
        b.approved_by,
        b.approved_at,
        b.created_at
      FROM Bookings b
      INNER JOIN Rooms r ON b.room_id = r.room_id
      INNER JOIN Users u ON b.user_id = u.user_id
      ORDER BY b.booking_date DESC, b.start_time DESC
    `);

    return res.json({
      success: true,
      message: "ດຶງລາຍການຈອງສຳເລັດ",
      data: result.recordset
    });

  } catch (error) {
    console.error("Get bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "ບໍ່ສາມາດດຶງລາຍການຈອງໄດ້"
    });
  }
};
// ຟັງຊັນສ້າງການຈອງຫ້ອງປະຊຸມ
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      roomId,
      meetingTitle,
      bookerName,
      department,
      bookingDate,
      startTime,
      endTime,
      attendees,
      note
    } = req.body;

    // ກວດສອບຂໍ້ມູນທີ່ຈຳເປັນ
    if (
      !roomId ||
      !meetingTitle ||
      !bookerName ||
      !bookingDate ||
      !startTime ||
      !endTime ||
      !attendees
    ) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາປ້ອນຂໍ້ມູນການຈອງໃຫ້ຄົບຖ້ວນ"
      });
    }

    if (
      !Number.isInteger(Number(roomId)) ||
      Number(roomId) <= 0 ||
      !Number.isInteger(Number(attendees)) ||
      Number(attendees) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "ຂໍ້ມູນຫ້ອງ ຫຼື ຈຳນວນຜູ້ເຂົ້າຮ່ວມບໍ່ຖືກຕ້ອງ"
      });
    }

    // ກວດສອບຮູບແບບເວລາ
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: "ຮູບແບບເວລາບໍ່ຖືກຕ້ອງ"
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "ເວລາສິ້ນສຸດຕ້ອງຫຼັງເວລາເລີ່ມຕົ້ນ"
      });
    }

    const pool = await getPool();

    // ກວດສອບຫ້ອງປະຊຸມ
    const roomResult = await pool.request()
      .input("roomId", sql.Int, Number(roomId))
      .query(`
        SELECT room_id, capacity, status
        FROM Rooms
        WHERE room_id = @roomId
      `);

    if (roomResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຫ້ອງປະຊຸມ"
      });
    }

    const room = roomResult.recordset[0];

    if (room.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: "ຫ້ອງປະຊຸມນີ້ບໍ່ພ້ອມໃຊ້ງານ"
      });
    }

    if (Number(attendees) > room.capacity) {
      return res.status(400).json({
        success: false,
        message: "ຈຳນວນຜູ້ເຂົ້າຮ່ວມເກີນຄວາມຈຸຂອງຫ້ອງ"
      });
    }

    // ກວດສອບເວລາຈອງຊ້ຳ
    const conflictResult = await pool.request()
      .input("roomId", sql.Int, Number(roomId))
      .input("bookingDate", sql.Date, bookingDate)
      .input("startTime", sql.VarChar(8), startTime)
      .input("endTime", sql.VarChar(8), endTime)
      .query(`
        SELECT TOP 1 booking_id
        FROM Bookings
        WHERE room_id = @roomId
          AND booking_date = @bookingDate
          AND status IN ('Pending', 'Approved')
          AND start_time < @endTime
          AND end_time > @startTime
      `);

    if (conflictResult.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "ຫ້ອງນີ້ມີການຈອງໃນຊ່ວງເວລານີ້ແລ້ວ"
      });
    }

    // ບັນທຶກການຈອງ
    const insertResult = await pool.request()
      .input("roomId", sql.Int, Number(roomId))
      .input("userId", sql.Int, userId)
      .input("meetingTitle", sql.NVarChar(255), meetingTitle.trim())
      .input("bookerName", sql.NVarChar(150), bookerName.trim())
      .input("department", sql.NVarChar(150), department || null)
      .input("bookingDate", sql.Date, bookingDate)
      .input("startTime", sql.VarChar(8), startTime)
      .input("endTime", sql.VarChar(8), endTime)
      .input("attendees", sql.Int, Number(attendees))
      .input("note", sql.NVarChar(sql.MAX), note || null)
      .query(`
        INSERT INTO Bookings (
          room_id,
          user_id,
          meeting_title,
          booker_name,
          department,
          booking_date,
          start_time,
          end_time,
          attendees,
          note,
          status
        )
        OUTPUT INSERTED.booking_id
        VALUES (
          @roomId,
          @userId,
          @meetingTitle,
          @bookerName,
          @department,
          @bookingDate,
          @startTime,
          @endTime,
          @attendees,
          @note,
          'Pending'
        )
      `);

    return res.status(201).json({
      success: true,
      message: "ສ້າງການຈອງສຳເລັດ ກຳລັງລໍຖ້າການອະນຸມັດ",
      data: {
        bookingId: insertResult.recordset[0].booking_id,
        status: "Pending"
      }
    });

  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      message: "ສ້າງການຈອງບໍ່ສຳເລັດ"
    });
  }
};
// ຟັງຊັນອະນຸມັດການຈອງ
// ຟັງຊັນອະນຸມັດການຈອງ
exports.approveBooking = async (req, res) => {
  let transaction;
  let transactionStarted = false;

  try {
    const bookingId = parseInt(req.params.id, 10);
    const adminId = req.user.userId;

    const pool = await getPool();
    transaction = new sql.Transaction(pool);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Booking ID ບໍ່ຖືກຕ້ອງ"
      });
    }

    await transaction.begin();
    transactionStarted = true;

    const bookingResult = await new sql.Request(transaction)
      .input("bookingId", sql.Int, bookingId)
      .query(`
        SELECT *
        FROM Bookings WITH (UPDLOCK, HOLDLOCK)
        WHERE booking_id = @bookingId
      `);

    if (bookingResult.recordset.length === 0) {
      await transaction.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບລາຍການຈອງ"
      });
    }

    const booking = bookingResult.recordset[0];

    if (booking.status !== "Pending") {
      await transaction.rollback();
      transactionStarted = false;

      return res.status(400).json({
        success: false,
        message: "ລາຍການຈອງນີ້ບໍ່ໄດ້ຢູ່ໃນສະຖານະ Pending"
      });
    }

    // ກວດສອບວ່າມີການຈອງຊ້ຳຫຼືບໍ່
    const conflictResult = await new sql.Request(transaction)
      .input("roomId", sql.Int, booking.room_id)
      .input("bookingDate", sql.Date, booking.booking_date)
      .input("startTime", sql.Time, booking.start_time)
      .input("endTime", sql.Time, booking.end_time)
      .input("bookingId", sql.Int, bookingId)
      .query(`
        SELECT booking_id
        FROM Bookings WITH (UPDLOCK, HOLDLOCK)
        WHERE room_id = @roomId
          AND booking_date = @bookingDate
          AND booking_id <> @bookingId
          AND status = 'Approved'
          AND start_time < @endTime
          AND end_time > @startTime
      `);

    if (conflictResult.recordset.length > 0) {
      await transaction.rollback();
      transactionStarted = false;

      return res.status(409).json({
        success: false,
        message: "ບໍ່ສາມາດອະນຸມັດໄດ້ ເນື່ອງຈາກມີການຈອງຊ້ຳເວລາ"
      });
    }

    // ອັບເດດສະຖານະການຈອງ
    await new sql.Request(transaction)
      .input("bookingId", sql.Int, bookingId)
      .input("adminId", sql.Int, adminId)
      .query(`
        UPDATE Bookings
        SET status = 'Approved',
            approved_by = @adminId,
            approved_at = GETDATE(),
            updated_at = GETDATE()
        WHERE booking_id = @bookingId
      `);

    // ບັນທຶກປະຫວັດການອະນຸມັດ
    await new sql.Request(transaction)
      .input("bookingId", sql.Int, bookingId)
      .input("adminId", sql.Int, adminId)
      .input("oldStatus", sql.VarChar(20), "Pending")
      .input("newStatus", sql.VarChar(20), "Approved")
      .query(`
        INSERT INTO BookingHistory (
          booking_id, changed_by, action,
          old_status, new_status, remarks
        )
        VALUES (
          @bookingId, @adminId, 'Approve',
          @oldStatus, @newStatus, 'Booking approved by Admin'
        )
      `);

    // ສ້າງແຈ້ງເຕືອນໃຫ້ຜູ້ທີ່ຈອງ
    await new sql.Request(transaction)
      .input("userId", sql.Int, booking.user_id)
      .input("bookingId", sql.Int, bookingId)
      .input("title", sql.NVarChar(200), "ການຈອງຖືກອະນຸມັດ")
      .input(
        "message",
        sql.NVarChar(500),
        `ການຈອງ "${booking.meeting_title}" ຂອງທ່ານໄດ້ຮັບການອະນຸມັດ`
      )
      .query(`
        INSERT INTO Notifications (
          user_id, booking_id, title, message
        )
        VALUES (
          @userId, @bookingId, @title, @message
        )
      `);

    await transaction.commit();
    transactionStarted = false;

    return res.json({
      success: true,
      message: "ອະນຸມັດການຈອງສຳເລັດ",
      data: {
        bookingId,
        status: "Approved"
      }
    });

  } catch (error) {
    if (transaction && transactionStarted) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    console.error("Approve booking error:", error);

    return res.status(500).json({
      success: false,
      message: "ອະນຸມັດການຈອງບໍ່ສຳເລັດ"
    });
  }
};


// ຟັງຊັນປະຕິເສດການຈອງ
// ຟັງຊັນປະຕິເສດການຈອງ
exports.rejectBooking = async (req, res) => {
  let transaction;
  let transactionStarted = false;

  try {
    const bookingId = parseInt(req.params.id, 10);
    const adminId = req.user.userId;
    const { remarks } = req.body || {};

    const pool = await getPool();
    transaction = new sql.Transaction(pool);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Booking ID ບໍ່ຖືກຕ້ອງ"
      });
    }

    await transaction.begin();
    transactionStarted = true;

    // ດຶງຂໍ້ມູນການຈອງ
    const bookingResult = await new sql.Request(transaction)
      .input("bookingId", sql.Int, bookingId)
      .query(`
        SELECT user_id, meeting_title, status
        FROM Bookings WITH (UPDLOCK, HOLDLOCK)
        WHERE booking_id = @bookingId
      `);

    if (bookingResult.recordset.length === 0) {
      await transaction.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບລາຍການຈອງ"
      });
    }

    const booking = bookingResult.recordset[0];

    if (booking.status !== "Pending") {
      await transaction.rollback();
      transactionStarted = false;

      return res.status(400).json({
        success: false,
        message: "ລາຍການຈອງນີ້ບໍ່ໄດ້ຢູ່ໃນສະຖານະ Pending"
      });
    }

    const rejectionRemarks = remarks || "Rejected by Admin";

    // ອັບເດດສະຖານະ ແລະ ບັນທຶກປະຫວັດ
    await new sql.Request(transaction)
      .input("bookingId", sql.Int, bookingId)
      .input("adminId", sql.Int, adminId)
      .input("remarks", sql.NVarChar(500), rejectionRemarks)
      .query(`
        UPDATE Bookings
        SET status = 'Rejected',
            updated_at = GETDATE()
        WHERE booking_id = @bookingId;

        INSERT INTO BookingHistory (
          booking_id, changed_by, action,
          old_status, new_status, remarks
        )
        VALUES (
          @bookingId, @adminId, 'Reject',
          'Pending', 'Rejected', @remarks
        );
      `);

    // ສ້າງແຈ້ງເຕືອນໃຫ້ຜູ້ທີ່ຈອງ
    await new sql.Request(transaction)
      .input("userId", sql.Int, booking.user_id)
      .input("bookingId", sql.Int, bookingId)
      .input("title", sql.NVarChar(200), "ການຈອງຖືກປະຕິເສດ")
      .input(
        "message",
        sql.NVarChar(500),
        `ການຈອງ "${booking.meeting_title}" ຂອງທ່ານຖືກປະຕິເສດ. ເຫດຜົນ: ${rejectionRemarks}`
      )
      .query(`
        INSERT INTO Notifications (
          user_id, booking_id, title, message
        )
        VALUES (
          @userId, @bookingId, @title, @message
        )
      `);

    await transaction.commit();
    transactionStarted = false;

    return res.json({
      success: true,
      message: "ປະຕິເສດການຈອງສຳເລັດ",
      data: {
        bookingId,
        status: "Rejected"
      }
    });

  } catch (error) {
    if (transaction && transactionStarted) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    console.error("Reject booking error:", error);

    return res.status(500).json({
      success: false,
      message: "ປະຕິເສດການຈອງບໍ່ສຳເລັດ"
    });
  }
};