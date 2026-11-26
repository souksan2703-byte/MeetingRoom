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

// ຟັງຊັນດຶງລາຍຊື່ Users ທັງໝົດ
exports.getUsers = async (req, res) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        u.user_id,
        u.full_name,
        u.username,
        u.email,
        u.phone,
        u.department,
        u.is_active,
        u.created_at,
        u.updated_at,
        r.role_name AS role
      FROM Users u
      INNER JOIN Roles r ON u.role_id = r.role_id
      ORDER BY u.user_id DESC
    `);

    return res.json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "ດຶງລາຍຊື່ Users ບໍ່ສຳເລັດ"
    });
  }
};

// ຟັງຊັນແກ້ໄຂຂໍ້ມູນ User
exports.updateUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const {
      fullName,
      username,
      email,
      password,
      phone,
      department,
      role
    } = req.body;

    // ກວດສອບ User ID
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "User ID ບໍ່ຖືກຕ້ອງ"
      });
    }

    // ກວດສອບຂໍ້ມູນທີ່ຈຳເປັນ
    if (!fullName || !username || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ"
      });
    }

    // ກວດສອບ Password ໃໝ່ (ຖ້າມີການປ່ຽນ)
    if (password && password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password ຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ"
      });
    }

    // ອະນຸຍາດສະເພາະ Doctor ແລະ Staff
    if (!["Doctor", "Staff"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role ບໍ່ຖືກຕ້ອງ"
      });
    }

    const pool = await getPool();

    // ກວດສອບວ່າ User ມີຢູ່ແທ້ ແລະບໍ່ແມ່ນ Admin
    const existingUser = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT u.user_id, r.role_name
        FROM Users u
        INNER JOIN Roles r ON u.role_id = r.role_id
        WHERE u.user_id = @userId
      `);

    if (existingUser.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບ User ນີ້"
      });
    }

    if (existingUser.recordset[0].role_name === "Admin") {
      return res.status(403).json({
        success: false,
        message: "ບໍ່ອະນຸຍາດແກ້ໄຂບັນຊີ Admin ຜ່ານລະບົບນີ້"
      });
    }

    // ກວດສອບ Username ແລະ Email ຊ້ຳ
    const duplicate = await pool.request()
      .input("userId", sql.Int, userId)
      .input("username", sql.VarChar(50), username.trim())
      .input("email", sql.VarChar(150), email.trim())
      .query(`
        SELECT user_id
        FROM Users
        WHERE (username = @username OR email = @email)
          AND user_id <> @userId
      `);

    if (duplicate.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username ຫຼື Email ນີ້ມີຜູ້ໃຊ້ແລ້ວ"
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

    // ເຂົ້າລະຫັດ Password ໃໝ່ ຖ້າມີການປ່ຽນ
    const passwordHash = password
      ? await bcrypt.hash(password, 10)
      : null;

    // ອັບເດດຂໍ້ມູນ User
    await pool.request()
      .input("userId", sql.Int, userId)
      .input("roleId", sql.Int, roleResult.recordset[0].role_id)
      .input("fullName", sql.NVarChar(150), fullName.trim())
      .input("username", sql.VarChar(50), username.trim())
      .input("email", sql.VarChar(150), email.trim())
      .input("phone", sql.VarChar(30), phone || null)
      .input("department", sql.NVarChar(150), department || null)
      .input("passwordHash", sql.NVarChar(255), passwordHash)
      .query(`
        UPDATE Users
        SET
          role_id = @roleId,
          full_name = @fullName,
          username = @username,
          email = @email,
          phone = @phone,
          department = @department,
          password_hash = COALESCE(@passwordHash, password_hash),
          updated_at = GETDATE()
        WHERE user_id = @userId
      `);

    return res.json({
      success: true,
      message: "ແກ້ໄຂຂໍ້ມູນ User ສຳເລັດ"
    });

  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      success: false,
      message: "ແກ້ໄຂຂໍ້ມູນ User ບໍ່ສຳເລັດ"
    });
  }
};
