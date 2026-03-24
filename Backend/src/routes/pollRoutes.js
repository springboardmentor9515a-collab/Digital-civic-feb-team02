const express = require("express");
const router = express.Router();

const {
  createPoll,
  getPolls,
  getPollById,
  voteOnPoll,
  getPollStats,
  closePoll,
  getMyPolls,
} = require("../controllers/pollController");

const { protect } = require("../middleware/authMiddleware");
const { isCitizen, isOfficial } = require("../middleware/roleMiddleware");

// Rate limiter for voting endpoint
const rateLimit = require("express-rate-limit");

const voteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 votes per minute per IP
  message: {
    success: false,
    message: "Too many voting attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Poll Routes Structure:
 *
 * POST   /api/polls           - Create poll (Official only)
 * GET    /api/polls           - Get all polls (filtered by location)
 * GET    /api/polls/my-polls  - Get polls created by current official
 * GET    /api/polls/:id       - Get poll by ID with vote stats
 * GET    /api/polls/:id/stats - Get detailed poll statistics
 * POST   /api/polls/:id/vote  - Vote on poll (Citizen only)
 * PATCH  /api/polls/:id/close - Close poll (Official only, creator)
 */

// All routes require authentication
router.use(protect);

// Official routes (must be before /:id routes)
router.post("/", isOfficial, createPoll);
router.get("/my-polls", isOfficial, getMyPolls);

// Public authenticated routes
router.get("/", getPolls);
router.get("/:id", getPollById);
router.get("/:id/stats", getPollStats);

// Citizen-only voting route with rate limiting
router.post("/:id/vote", voteLimiter, isCitizen, voteOnPoll);

// Official-only poll management
router.patch("/:id/close", isOfficial, closePoll);

module.exports = router;
