/**
 * Role-based access control middleware
 * Must be used AFTER the protect (auth) middleware
 */

/**
 * Restrict access to citizens only
 */
const isCitizen = (req, res, next) => {
  if (req.user && req.user.role === "citizen") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Citizens only.",
  });
};

/**
 * Restrict access to officials only
 */
const isOfficial = (req, res, next) => {
  if (req.user && (req.user.role === "official" || req.user.role === "admin")) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Officials or admins only.",
  });
};

/**
 * Generic role checker — accepts one or more roles
 * Usage: authorize("citizen", "official")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
      });
    }
    next();
  };
};

module.exports = { isCitizen, isOfficial, authorize };
