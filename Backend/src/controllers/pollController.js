const mongoose = require("mongoose");
const Poll = require("../models/Poll");
const Vote = require("../models/Vote");

/**
 * @desc    Create a new poll
 * @route   POST /api/polls
 * @access  Private (Official/Admin only)
 */
const createPoll = async (req, res, next) => {
  try {
    const { title, description, options, targetLocation, expiresAt } = req.body;

    // Validate required fields
    if (!title || !options || !targetLocation) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, options, and target location",
      });
    }

    // Validate options array
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Poll must have at least 2 options",
      });
    }

    // Sanitize options - trim whitespace and remove duplicates
    const sanitizedOptions = [...new Set(options.map((opt) => opt.trim()))];
    if (sanitizedOptions.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Poll must have at least 2 unique options",
      });
    }

    // Create poll
    const poll = await Poll.create({
      title: title.trim(),
      description: description?.trim(),
      options: sanitizedOptions,
      createdBy: req.user._id,
      targetLocation: targetLocation.trim(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    // Log poll creation
    console.log(
      `[POLL_CREATED] Poll "${poll.title}" (ID: ${poll._id}) created by user ${req.user._id} for location "${targetLocation}"`
    );

    res.status(201).json({
      success: true,
      message: "Poll created successfully",
      data: poll,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all polls (filtered by user location)
 * @route   GET /api/polls
 * @access  Private
 */
const getPolls = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, location } = req.query;

    // Build filter query
    const filter = {};

    // Filter by location (user's location or specified location)
    const targetLocation = location || req.user.location;
    if (targetLocation) {
      filter.targetLocation = targetLocation;
    }

    // Filter by status if provided
    if (status && ["active", "closed"].includes(status)) {
      filter.status = status;
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Fetch polls with pagination
    const [polls, total] = await Promise.all([
      Poll.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Poll.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: polls,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get poll by ID with vote aggregation
 * @route   GET /api/polls/:id
 * @access  Private
 */
const getPollById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid poll ID",
      });
    }

    // Fetch poll
    const poll = await Poll.findById(id).populate("createdBy", "name email");

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    // Aggregate vote counts
    const voteStats = await Vote.aggregate([
      { $match: { poll: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "$selectedOption",
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate total votes and percentages
    const totalVotes = voteStats.reduce((sum, stat) => sum + stat.count, 0);

    // Build results with all options (including those with 0 votes)
    const results = poll.options.map((option) => {
      const stat = voteStats.find((s) => s._id === option);
      const count = stat ? stat.count : 0;
      const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;

      return {
        option,
        count,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      };
    });

    // Check if current user has voted
    const userVote = await Vote.findOne({
      poll: id,
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: {
        poll,
        totalVotes,
        results,
        userVoted: !!userVote,
        userSelectedOption: userVote?.selectedOption || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Vote on a poll
 * @route   POST /api/polls/:id/vote
 * @access  Private (Citizen only)
 */
const voteOnPoll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { selectedOption } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid poll ID",
      });
    }

    // Validate selected option
    if (!selectedOption) {
      return res.status(400).json({
        success: false,
        message: "Please select an option",
      });
    }

    // Find the poll
    const poll = await Poll.findById(id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    // Check if poll is active
    if (poll.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This poll is closed and no longer accepting votes",
      });
    }

    // Check if poll has expired
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "This poll has expired",
      });
    }

    // Validate selected option exists in poll
    if (!poll.options.includes(selectedOption)) {
      return res.status(400).json({
        success: false,
        message: "Invalid option selected",
      });
    }

    // Check location-based access
    if (poll.targetLocation !== req.user.location) {
      return res.status(403).json({
        success: false,
        message: "You can only vote on polls in your location",
      });
    }

    // Check if user has already voted (handled by unique index, but explicit check for better error message)
    const existingVote = await Vote.findOne({
      poll: id,
      user: req.user._id,
    });

    if (existingVote) {
      return res.status(409).json({
        success: false,
        message: "You have already voted on this poll",
      });
    }

    // Create vote
    const vote = await Vote.create({
      poll: id,
      user: req.user._id,
      selectedOption,
    });

    // Log voting action
    console.log(
      `[VOTE_CAST] User ${req.user._id} voted "${selectedOption}" on poll ${id}`
    );

    res.status(201).json({
      success: true,
      message: "Vote recorded successfully",
      data: {
        pollId: id,
        selectedOption,
        votedAt: vote.createdAt,
      },
    });
  } catch (error) {
    // Handle duplicate key error (race condition fallback)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already voted on this poll",
      });
    }
    next(error);
  }
};

/**
 * @desc    Get vote statistics for a poll (sentiment analysis)
 * @route   GET /api/polls/:id/stats
 * @access  Private
 */
const getPollStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid poll ID",
      });
    }

    const poll = await Poll.findById(id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    // Aggregation pipeline for detailed stats
    const stats = await Vote.aggregate([
      { $match: { poll: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "$selectedOption",
          count: { $sum: 1 },
          voters: { $push: "$user" },
        },
      },
      {
        $project: {
          option: "$_id",
          count: 1,
          voterCount: { $size: "$voters" },
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalVotes = stats.reduce((sum, s) => sum + s.count, 0);

    // Add percentages and include all options
    const fullStats = poll.options.map((option) => {
      const stat = stats.find((s) => s.option === option);
      const count = stat ? stat.count : 0;
      const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;

      return {
        option,
        count,
        percentage: Math.round(percentage * 100) / 100,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        pollId: id,
        pollTitle: poll.title,
        totalVotes,
        stats: fullStats,
        status: poll.status,
        createdAt: poll.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Close a poll
 * @route   PATCH /api/polls/:id/close
 * @access  Private (Official/Admin only)
 */
const closePoll = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid poll ID",
      });
    }

    const poll = await Poll.findById(id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    // Check if user is the creator or admin
    if (poll.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only close polls you created",
      });
    }

    if (poll.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "Poll is already closed",
      });
    }

    poll.status = "closed";
    await poll.save();

    console.log(`[POLL_CLOSED] Poll ${id} closed by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: "Poll closed successfully",
      data: poll,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get polls created by the current official
 * @route   GET /api/polls/my-polls
 * @access  Private (Official only)
 */
const getMyPolls = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { createdBy: req.user._id };

    if (status && ["active", "closed"].includes(status)) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [polls, total] = await Promise.all([
      Poll.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Poll.countDocuments(filter),
    ]);

    // Get vote counts for each poll
    const pollsWithStats = await Promise.all(
      polls.map(async (poll) => {
        const voteCount = await Vote.countDocuments({ poll: poll._id });
        return {
          ...poll.toJSON(),
          voteCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: pollsWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPoll,
  getPolls,
  getPollById,
  voteOnPoll,
  getPollStats,
  closePoll,
  getMyPolls,
};
