const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "default_fallback_secret_change_me_in_prod";

class JWTUtils {
  static generateApprovalToken(requestId, action, role) {
    return jwt.sign(
      {
        requestId,
        action,
        role
      },
      JWT_SECRET,
      { expiresIn: "7d" } // Token expires in 7 days
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }
  }
}

module.exports = JWTUtils;
