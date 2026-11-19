
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../config/db");

// ຟັງຊັນເຂົ້າລະບົບ
exports.login = async (req, res) => {
  try {
    // ຮັບ Username ແລະ Password ຈາກ Frontend
    const { username, password } = req.body;

    // ກວດສອບຂໍ້ມູນ
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາປ້ອນ Username ແລະ Password"
      });
    }

    // ເຊື່ອມຕໍ່ຖານຂໍ້ມູນ
    const pool = await getPool();

    // ຄົ້ນຫາຜູ້ໃຊ້ຈາກ Username
    const result = await pool.request()
      .input("username", sql.VarChar(50), username.trim())
      .query(`
        SELECT
          u.user_id,
          u.full_name,
          u.username,
          u.email,
          u.password_hash,
          u.is_active,
          r.role_name
        FROM Users u
        INNER JOIN Roles r ON u.role_id = r.role_id
        WHERE u.username = @username
      `);

    // ກວດສອບວ່າພົບຜູ້ໃຊ້ຫຼືບໍ່
    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Username ຫຼື Password ບໍ່ຖືກຕ້ອງ"
      });
    }

    const user = result.recordset[0];

    // ກວດສອບສະຖານະບັນຊີ
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "ບັນຊີນີ້ຖືກປິດໃຊ້ງານ"
      });
    }

    // ກວດສອບ Password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Username ຫຼື Password ບໍ່ຖືກຕ້ອງ"
      });
    }

    // ສ້າງ JWT Token
    const token = jwt.sign(
      {
        userId: user.user_id,
        role: user.role_name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    // ສົ່ງຜົນການ Login ກັບໄປ Frontend
    return res.json({
      success: true,
      message: "ເຂົ້າລະບົບສຳເລັດ",
      token,
      user: {
        id: user.user_id,
        fullName: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role_name
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດພາຍໃນ Server"
    });
  }
};
