const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

/**
 * protect — Verifies JWT token from Authorization header.
 * Attaches req.user for downstream route handlers.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // JWT_SECRET must be set in environment — no weak fallback
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.id === "admin-env-id") {
        req.user = {
          id: "admin-env-id",
          name: "System Administrator",
          email: process.env.ADMIN_EMAIL,
          role: "admin",
        };
      } else {
        req.user = await User.findById(decoded.id);
        if (!req.user) {
          return res.status(401).json({ message: "User not found, not authorized" });
        }
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // No token provided
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

/**
 * admin — Allows only users with role === 'admin'.
 * Must be used after protect middleware.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Not authorized as an admin" });
};

module.exports = { protect, admin };
