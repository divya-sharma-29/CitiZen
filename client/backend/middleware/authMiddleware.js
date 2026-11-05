
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify that the request belongs to an authenticated user.
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required. Please log in.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "Authentication token is missing.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        message: "Server authentication configuration error.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    // Fetch the current user instead of trusting the role
    // stored in the token alone.
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Account not found. Please log in again.",
      });
    }

    // If your User schema has an isActive field, also reject
    // accounts that have been deactivated.

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Session expired or invalid. Please log in again.",
      });
    }

    console.error("Authentication error:", error);

    return res.status(500).json({
      message: "Unable to authenticate request.",
    });
  }
}

// Only authorities and admins may access authority operations.
function authorityOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Please log in first.",
    });
  }

  if (!["authority", "admin"].includes(req.user.role)) {
    return res.status(403).json({
      message: "Authority access required.",
    });
  }

  next();
}

// Only admins may access admin operations.
function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Please log in first.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  next();
}

module.exports = {
  protect,
  authorityOnly,
  adminOnly,
};
