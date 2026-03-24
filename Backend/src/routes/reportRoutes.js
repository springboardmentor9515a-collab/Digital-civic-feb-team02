const express = require("express");
const router = express.Router();

const {
  generateReports,
  exportReports,
  getAdminLogs,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");
const { isOfficial } = require("../middleware/roleMiddleware");

// Rate limiter for report endpoints
const rateLimit = require("express-rate-limit");

const reportLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 reports per minute
  message: {
    success: false,
    message: "Too many report requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const exportLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 exports per 5 minutes
  message: {
    success: false,
    message: "Too many export requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Report Routes Structure:
 *
 * GET  /api/reports         - Generate comprehensive reports
 * GET  /api/reports/export  - Export reports as CSV
 * GET  /api/reports/logs    - Get admin activity logs
 */

// All routes require authentication and official role
router.use(protect);
router.use(isOfficial);

// Generate reports
router.get("/", reportLimiter, generateReports);

// Export reports as CSV
router.get("/export", exportLimiter, exportReports);

// Get admin activity logs
router.get("/logs", getAdminLogs);

module.exports = router;
