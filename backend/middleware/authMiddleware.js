
const jwt = require("jsonwebtoken");

// ຟັງຊັນກວດສອບ JWT Token
exports.verifyToken = (req, res, next) => {
  try {
    // ຮັບ Token ຈາກ Header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "ບໍ່ພົບ Token ກະລຸນາ Login ກ່ອນ"
      });
    }

    // ແຍກ Token ອອກຈາກ Bearer
    const token = authHeader.split(" ")[1];

    // ກວດສອບ Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ເກັບຂໍ້ມູນ User ໄວ້ໃນ Request
    req.user = decoded;

    // ອະນຸຍາດໃຫ້ໄປຂັ້ນຕອນຕໍ່ໄປ
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token ບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸແລ້ວ"
    });
  }
};

// ຟັງຊັນກວດສອບ Role ຂອງ User
exports.checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "ທ່ານບໍ່ມີສິດເຂົ້າໃຊ້ງານ"
      });
    }

    next();
  };
};
