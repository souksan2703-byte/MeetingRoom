const { sql, getPool } = require("../config/db");
const bcrypt = require("bcryptjs");

// ຟັງຊັນສ້າງ User ໃໝ່ (Doctor / Staff)
exports.createUser = async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      password,
      phone,
      department,
      role
    } = req.body;

    // ກວດສອບຂໍ້ມູນ
    if (!fullName || !username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password ຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ"
      });
    }

    if (!["Doctor", "Staff"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role ບໍ່ຖືກຕ້ອງ"
      });
    }

    const pool = await getPool();

    // ກວດສອບ Username ແລະ Email ຊ້ຳ
    const duplicate = await pool.request()
      .input("username", sql.VarChar(50), username.trim())
      .input("email", sql.VarChar(150), email.trim())
      .query(`
        SELECT user_id
        FROM Users
        WHERE username = @username OR email = @email
      `);

    if (duplicate.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username ຫຼື Email ນີ້ມີຢູ່ແລ້ວ"
      });
    }

    // ຄົ້ນຫາ Role ID
    const roleResult = await pool.request()
      .input("roleName", sql.VarChar(30), role)
      .query(`
        SELECT role_id
        FROM Roles
        WHERE role_name = @roleName
      `);

    if (roleResult.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ບໍ່ພົບ Role ນີ້ໃນລະບົບ"
      });
    }

    // ເຂົ້າລະຫັດ Password
    const passwordHash = await bcrypt.hash(password, 10);

    // ບັນທຶກ User ໃໝ່
    const result = await pool.request()
      .input("roleId", sql.Int, roleResult.recordset[0].role_id)
      .input("fullName", sql.NVarChar(150), fullName.trim())
      .input("username", sql.VarChar(50), username.trim())
      .input("email", sql.VarChar(150), email.trim())
      .input("passwordHash", sql.NVarChar(255), passwordHash)
      .input("phone", sql.VarChar(30), phone || null)
      .input("department", sql.NVarChar(150), department || null)
      .query(`
        INSERT INTO Users (
          role_id,
          full_name,
          username,
          email,
          password_hash,
          phone,
          department,
          is_active
        )
        OUTPUT INSERTED.user_id
        VALUES (
          @roleId,
          @fullName,
          @username,
          @email,
          @passwordHash,
          @phone,
          @department,
          1
        )
      `);

    return res.status(201).json({
      success: true,
      message: "ສ້າງບັນຊີ User ສຳເລັດ",
      data: {
        userId: result.recordset[0].user_id,
        fullName,
        username,
        email,
        role
      }
    });

  } catch (error) {
    console.error("Create user error:", error);

    return res.status(500).json({
      success: false,
      message: "ສ້າງບັນຊີ User ບໍ່ສຳເລັດ"
    });
  }
};