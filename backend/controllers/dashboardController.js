
const { sql, getPool } = require("../config/db");

// ດຶງຂໍ້ມູນສະຖິຕິ Dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const pool = await getPool();

    // ກວດສອບຜູ້ໃຊ້ ແລະ ບົດບາດ
    const userId = req.user.userId;
    const role = req.user.role;
    const isAdmin = role === "Admin";

    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .input("isAdmin", sql.Bit, isAdmin)
      .query(`
        -- ນັບຈຳນວນຫ້ອງປະຊຸມ
        SELECT COUNT(*) AS totalRooms
        FROM Rooms;

        -- ນັບສະຖິຕິການຈອງ
        SELECT
          COUNT(*) AS totalBookings,
          SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pendingBookings,
          SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approvedBookings,
          SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejectedBookings
        FROM Bookings
        WHERE (@isAdmin = 1 OR user_id = @userId);

        -- ນັບຈຳນວນຜູ້ໃຊ້ (Admin ເທົ່ານັ້ນ)
        SELECT COUNT(*) AS totalUsers
        FROM Users
        WHERE @isAdmin = 1;

        -- ດຶງລາຍການຈອງລ່າສຸດ
        SELECT TOP 5
          b.booking_id,
          b.meeting_title,
          b.booking_date,
          b.start_time,
          b.end_time,
          b.status,
          r.room_name
        FROM Bookings b
        INNER JOIN Rooms r ON b.room_id = r.room_id
        WHERE (@isAdmin = 1 OR b.user_id = @userId)
        ORDER BY b.created_at DESC;
      `);

    const bookingStats = result.recordsets[1][0];

    return res.json({
      success: true,
      message: "ດຶງຂໍ້ມູນ Dashboard ສຳເລັດ",
      data: {
        totalRooms: result.recordsets[0][0].totalRooms,
        totalBookings: bookingStats.totalBookings || 0,
        pendingBookings: bookingStats.pendingBookings || 0,
        approvedBookings: bookingStats.approvedBookings || 0,
        rejectedBookings: bookingStats.rejectedBookings || 0,
        totalUsers: result.recordsets[2][0].totalUsers,
        recentBookings: result.recordsets[3]
      }
    });

  } catch (error) {
    console.error("Get dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "ບໍ່ສາມາດດຶງຂໍ້ມູນ Dashboard ໄດ້"
    });
  }
};
