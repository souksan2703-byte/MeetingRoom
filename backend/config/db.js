
const sql = require("mssql/msnodesqlv8");

const config = {
  server: "localhost\\MEETINGROOM",
  database: "MeetingRoomDB",

  // ระบุชื่อ ODBC Driver ที่ติดตั้งใน Windows
  driver: "ODBC Driver 18 for SQL Server",

  options: {
    trustedConnection: true,
    trustServerCertificate: true
  },

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise;

async function getPool() {
  try {
    if (!poolPromise) {
      poolPromise = new sql.ConnectionPool(config)
        .connect()
        .catch((error) => {
          poolPromise = null;
          throw error;
        });
    }

    return await poolPromise;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
}

module.exports = {
  sql,
  getPool
};
