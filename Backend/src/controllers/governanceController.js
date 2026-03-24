const mongoose = require("mongoose");
const Petition = require("../models/Petition");
const AdminLog = require("../models/AdminLog");

/**
 * @desc    Get petitions for official (filtered by location)
 * @route   GET /api/governance/petitions
 * @access  Private (Official only)
 */
const getPetitionsForOfficial = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;

    // Build filter - petitions in official's location
    const filter = {
      location: req.user.location,
    };

    // Filter by status if provided
    if (status && ["active", "under_review", "closed"].includes(status)) {
      filter.status = status;
    }

    // Filter by category if provided
    if (category) {
      filter.category = category;
    }

    // Search in title/description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Fetch petitions with pagination
    const [petitions, total] = await Promise.all([
      Petition.find(filter)
        .populate("creator", "name email")
        .populate("respondedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Petition.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: petitions,
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
 * @desc    Respond to a petition
 * @route   POST /api/governance/petitions/:id/respond
 * @access  Private (Official only)
 */
const respondToPetition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response, status } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid petition ID",
      });
    }

    // Validate response
    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Response text is required",
      });
    }

    // Find the petition
    const petition = await Petition.findById(id);

    if (!petition) {
      return res.status(404).json({
        success: false,
        message: "Petition not found",
      });
    }

    // Validate location-based access
    if (petition.location !== req.user.location) {
      return res.status(403).json({
        success: false,
        message: "You can only respond to petitions in your location",
      });
    }

    // Determine new status
    const newStatus = status && ["under_review", "closed"].includes(status)
      ? status
      : "under_review";

    const previousStatus = petition.status;

    // Update petition
    petition.officialResponse = response.trim();
    petition.respondedBy = req.user._id;
    petition.respondedAt = new Date();
    petition.status = newStatus;

    await petition.save();

    // Log the action
    await AdminLog.log({
      action: "petition_response",
      user: req.user._id,
      petition: petition._id,
      details: {
        previousStatus,
        newStatus,
        responseLength: response.length,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Also log status change if status changed
    if (previousStatus !== newStatus) {
      await AdminLog.log({
        action: "petition_status_update",
        user: req.user._id,
        petition: petition._id,
        details: {
          previousStatus,
          newStatus,
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
    }

    console.log(
      `[PETITION_RESPONSE] Official ${req.user._id} responded to petition ${id}`
    );

    // Populate respondedBy for response
    await petition.populate("respondedBy", "name email");
    await petition.populate("creator", "name email");

    res.status(200).json({
      success: true,
      message: "Response submitted successfully",
      data: petition,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update petition status
 * @route   PATCH /api/governance/petitions/:id/status
 * @access  Private (Official only)
 */
const updatePetitionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid petition ID",
      });
    }

    // Validate status
    if (!status || !["active", "under_review", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (active, under_review, closed)",
      });
    }

    // Find the petition
    const petition = await Petition.findById(id);

    if (!petition) {
      return res.status(404).json({
        success: false,
        message: "Petition not found",
      });
    }

    // Validate location-based access
    if (petition.location !== req.user.location) {
      return res.status(403).json({
        success: false,
        message: "You can only update petitions in your location",
      });
    }

    const previousStatus = petition.status;

    if (previousStatus === status) {
      return res.status(400).json({
        success: false,
        message: `Petition is already ${status}`,
      });
    }

    // Update status
    petition.status = status;
    await petition.save();

    // Log the action
    await AdminLog.log({
      action: "petition_status_update",
      user: req.user._id,
      petition: petition._id,
      details: {
        previousStatus,
        newStatus: status,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    console.log(
      `[PETITION_STATUS] Official ${req.user._id} updated petition ${id} status: ${previousStatus} -> ${status}`
    );

    res.status(200).json({
      success: true,
      message: `Petition status updated to ${status}`,
      data: petition,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get governance dashboard stats
 * @route   GET /api/governance/stats
 * @access  Private (Official only)
 */
const getGovernanceStats = async (req, res, next) => {
  try {
    const location = req.user.location;

    // Aggregate petition stats by status
    const petitionStats = await Petition.aggregate([
      { $match: { location } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalSignatures: { $sum: "$signatureCount" },
        },
      },
    ]);

    // Get recent petitions requiring attention
    const pendingPetitions = await Petition.countDocuments({
      location,
      status: "active",
      officialResponse: { $exists: false },
    });

    // Get total responded
    const respondedPetitions = await Petition.countDocuments({
      location,
      officialResponse: { $exists: true, $ne: "" },
    });

    // Format stats
    const stats = {
      total: 0,
      byStatus: {
        active: 0,
        under_review: 0,
        closed: 0,
      },
      totalSignatures: 0,
      pendingResponse: pendingPetitions,
      responded: respondedPetitions,
    };

    petitionStats.forEach((stat) => {
      stats.byStatus[stat._id] = stat.count;
      stats.total += stat.count;
      stats.totalSignatures += stat.totalSignatures;
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPetitionsForOfficial,
  respondToPetition,
  updatePetitionStatus,
  getGovernanceStats,
};
