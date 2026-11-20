
const { sql, getPool } = require("../config/db");

// ດຶງລາຍການແຈ້ງເຕືອນຂອງຜູ້ໃຊ້
exports.getNotifications = async (req, res) => {
  try {
    const pool = await getPool();
    const userId = req.user.userId;

    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT
          notification_id,
          booking_id,
          title,
          message,
          is_read,
          created_at
        FROM Notifications
        WHERE user_id = @userId
        ORDER BY created_at DESC
      `);

    res.json({
      success: true,
      message: "ດຶງລາຍການແຈ້ງເຕືອນສຳເລັດ",
      data: result.recordset
    });

  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      success: false,
      message: "ບໍ່ສາມາດດຶງລາຍການແຈ້ງເຕືອນໄດ້"
    });
  }
};

// ນັບຈຳນວນແຈ້ງເຕືອນທີ່ຍັງບໍ່ອ່ານ
exports.getUnreadCount = async (req, res) => {
  try {
    const pool = await getPool();
    const userId = req.user.userId;

    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT COUNT(*) AS unreadCount
        FROM Notifications
        WHERE user_id = @userId
          AND is_read = 0
      `);

    res.json({
      success: true,
      message: "ນັບຈຳນວນແຈ້ງເຕືອນສຳເລັດ",
      data: {
        unreadCount: result.recordset[0].unreadCount
      }
    });

  } catch (error) {
    console.error("Get unread count error:", error);

    res.status(500).json({
      success: false,
      message: "ບໍ່ສາມາດນັບຈຳນວນແຈ້ງເຕືອນໄດ້"
    });
  }
};

// ໝາຍວ່າແຈ້ງເຕືອນຖືກອ່ານແລ້ວ
exports.markAsRead = async (req, res) => {
  try {
    const pool = await getPool();
    const userId = req.user.userId;
    const notificationId = parseInt(req.params.id, 10);

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Notification ID ບໍ່ຖືກຕ້ອງ"
      });
    }

    const result = await pool.request()
      .input("notificationId", sql.Int, notificationId)
      .input("userId", sql.Int, userId)
      .query(`
        UPDATE Notifications
        SET is_read = 1
        WHERE notification_id = @notificationId
          AND user_id = @userId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບລາຍການແຈ້ງເຕືອນ"
      });
    }

    res.json({
      success: true,
      message: "ໝາຍວ່າອ່ານແລ້ວສຳເລັດ"
    });

  } catch (error) {
    console.error("Mark notification as read error:", error);

    res.status(500).json({
      success: false,
      message: "ບໍ່ສາມາດໝາຍວ່າອ່ານແລ້ວໄດ້"
    });
  }
};
