
require("dotenv").config();

const bcrypt = require("bcryptjs");
const { getPool, sql } = require("./config/db");

// ຟັງຊັນສ້າງບັນຊີ Admin
async function createAdmin() {
  let pool;

  try {
    // ເຊື່ອມຕໍ່ຖານຂໍ້ມູນ
    pool = await getPool();

    // ດຶງຂໍ້ມູນ Admin ຈາກໄຟລ໌ .env
    const fullName = process.env.ADMIN_FULL_NAME;
    const username = process.env.ADMIN_USERNAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    // ກວດສອບວ່າຂໍ້ມູນຄົບຖ້ວນຫຼືບໍ່
    if (!fullName || !username || !email || !password) {
      throw new Error("Admin environment variables are missing");
    }

    // ກວດສອບຄວາມຍາວລະຫັດຜ່ານ
    if (password.length < 12) {
      throw new Error("Admin password must be at least 12 characters");
    }

    // ຄົ້ນຫາ Role Admin
    const roleResult = await pool.request()
      .input("roleName", sql.VarChar(30), "Admin")
      .query(`
        SELECT role_id
        FROM Roles
        WHERE role_name = @roleName
      `);

    if (roleResult.recordset.length === 0) {
      throw new Error("Admin role not found");
    }

    const roleId = roleResult.recordset[0].role_id;

    // ກວດສອບຊື່ຜູ້ໃຊ້ ແລະ Email ຊ້ຳ
    const existing = await pool.request()
      .input("username", sql.VarChar(50), username)
      .input("email", sql.VarChar(150), email)
      .query(`
        SELECT user_id
        FROM Users
        WHERE username = @username OR email = @email
      `);

    if (existing.recordset.length > 0) {
      throw new Error("Username or email already exists");
    }

    // ເຂົ້າລະຫັດ Password ກ່ອນບັນທຶກ
    const passwordHash = await bcrypt.hash(password, 12);

    // ບັນທຶກບັນຊີ Admin ລົງຖານຂໍ້ມູນ
    await pool.request()
      .input("roleId", sql.Int, roleId)
      .input("fullName", sql.NVarChar(150), fullName)
      .input("username", sql.VarChar(50), username)
      .input("email", sql.VarChar(150), email)
      .input("passwordHash", sql.NVarChar(255), passwordHash)
      .query(`
        INSERT INTO Users (
          role_id,
          full_name,
          username,
          email,
          password_hash
        )
        VALUES (
          @roleId,
          @fullName,
          @username,
          @email,
          @passwordHash
        )
      `);

    console.log("ສ້າງບັນຊີ Admin ສຳເລັດແລ້ວ!");

  } catch (error) {
    console.error("ສ້າງບັນຊີ Admin ບໍ່ສຳເລັດ:", error.message);
    process.exitCode = 1;

  } finally {
    // ປິດການເຊື່ອມຕໍ່ຖານຂໍ້ມູນ
    if (pool) {
      await pool.close();
    }
  }
}

// ເລີ່ມເຮັດວຽກຟັງຊັນ
createAdmin();
