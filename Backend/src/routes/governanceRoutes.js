const express = require("express");
const router = express.Router();

const {
  getPetitionsForOfficial,
  respondToPetition,
  updatePetitionStatus,
  getGovernanceStats,
} = require("../controllers/governanceController");

const { protect } = require("../middleware/authMiddleware");
const { isOfficial } = require("../middleware/roleMiddleware");

// Rate limiter for response endpoint
const rateLimit = require("express-rate-limit");

const responseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 responses per minute
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Governance Routes Structure:
 *
 * GET    /api/governance/petitions         - Get petitions for official
 * GET    /api/governance/stats             - Get governance dashboard stats
 * POST   /api/governance/petitions/:id/respond - Respond to petition
 * PATCH  /api/governance/petitions/:id/status  - Update petition status
 */

// All routes require authentication and official role
router.use(protect);
router.use(isOfficial);

// Get petitions for official's location
router.get("/petitions", getPetitionsForOfficial);

// Get governance stats
router.get("/stats", getGovernanceStats);

// Respond to a petition
router.post("/petitions/:id/respond", responseLimiter, respondToPetition);

// Update petition status
router.patch("/petitions/:id/status", updatePetitionStatus);

module.exports = router;
