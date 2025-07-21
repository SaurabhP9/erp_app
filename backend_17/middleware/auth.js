// const jwt = require("jsonwebtoken");

// exports.verifyToken = (req, res, next) => {
//   const rawAuth = req.headers["authorization"];
//   const token = rawAuth && rawAuth.startsWith("Bearer ") ? rawAuth.split(" ")[1] : rawAuth;

//   if (!token) return res.status(403).json({ error: "Token missing" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({
//       error: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
//     });
//   }
// };

// exports.requireRole = (roles) => (req, res, next) => {
//   if (!req.user || !roles.includes(req.user.role)) {
//     return res.status(403).json({ error: "Access denied" });
//   }
//   next();
// };

// middleware/auth.js
const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT token and extract user info
 */
exports.verifyToken = (req, res, next) => {
  const rawAuth = req.headers["authorization"];
  const token =
    rawAuth && rawAuth.startsWith("Bearer ") ? rawAuth.split(" ")[1] : rawAuth;

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Only include needed fields in req.user
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next(); // Proceed to next middleware or route
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("JWT Error:", err.message);
    }

    res.status(401).json({
      error:
        err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
    });
  }
};

/**
 * Middleware to check required role(s)
 * @param {Array} roles - Allowed roles (e.g. ['admin', 'employee'])
 */
exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};
