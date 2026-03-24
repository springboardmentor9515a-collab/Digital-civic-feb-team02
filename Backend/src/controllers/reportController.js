const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const Petition = require("../models/Petition");
const Signature = require("../models/Signature");
const Poll = require("../models/Poll");
const Vote = require("../models/Vote");
const AdminLog = require("../models/AdminLog");

const parseDateOrNull = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const resolveAuthorizedLocation = (req, requestedLocation) => {
  if (!requestedLocation) return req.user.location;
  if (requestedLocation !== req.user.location) return null;
  return req.user.location;
};

const escapeCsv = (value) => {
  const raw = value === null || value === undefined ? "" : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
};

const buildCsv = (columns, rows) => {
  const header = columns.map(escapeCsv).join(",");
  const body = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  return `${header}\n${body}`;
};

const buildPdfBuffer = ({ title, metaLines, columns, rows }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text(title, { align: "left" });
    doc.moveDown(0.5);

    metaLines.forEach((line) => {
      doc.fontSize(10).fillColor("#444444").text(line);
    });

    doc.moveDown(1);
    doc.fontSize(11).fillColor("#111111").text(`Total records: ${rows.length}`);
    doc.moveDown(0.8);

    if (rows.length === 0) {
      doc.fontSize(11).fillColor("#333333").text("No data found for selected filters.");
      doc.end();
      return;
    }

    rows.forEach((row, index) => {
      if (doc.y > doc.page.height - 100) {
        doc.addPage();
      }

      doc.fontSize(11).fillColor("#111111").text(`#${index + 1}`);
      doc.moveDown(0.2);

      columns.forEach((column, columnIndex) => {
        const value = row[columnIndex] ?? "N/A";
        doc.fontSize(9).fillColor("#333333").text(`${column}: ${value}`);
      });

      doc.moveDown(0.5);
      doc.strokeColor("#DDDDDD").lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.5);
    });

    doc.end();
  });

/**
 * @desc    Generate comprehensive reports
 * @route   GET /api/reports
 * @access  Private (Official only)
 */
const generateReports = async (req, res, next) => {
  try {
    const { startDate, endDate, location } = req.query;

    const targetLocation = resolveAuthorizedLocation(req, location);
    if (!targetLocation) {
      return res.status(403).json({
        success: false,
        message: "Cross-location reporting is not allowed",
      });
    }

    // Build date filter
    const dateFilter = {};
    const parsedStartDate = parseDateOrNull(startDate);
    const parsedEndDate = parseDateOrNull(endDate);

    if (startDate && !parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate",
      });
    }

    if (endDate && !parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid endDate",
      });
    }

    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be later than endDate",
      });
    }

    if (parsedStartDate) {
      dateFilter.$gte = parsedStartDate;
    }
    if (parsedEndDate) {
      dateFilter.$lte = parsedEndDate;
    }

    // Build match conditions
    const petitionMatch = { location: targetLocation };
    const pollMatch = { targetLocation };

    if (Object.keys(dateFilter).length > 0) {
      petitionMatch.createdAt = dateFilter;
      pollMatch.createdAt = dateFilter;
    }

    // Petition Statistics
    const petitionStats = await Petition.aggregate([
      { $match: petitionMatch },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalSignatures: { $sum: "$signatureCount" },
        },
      },
    ]);

    // Petitions by Category
    const petitionsByCategory = await Petition.aggregate([
      { $match: petitionMatch },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalSignatures: { $sum: "$signatureCount" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Monthly Petition Trends
    const monthlyPetitions = await Petition.aggregate([
      { $match: petitionMatch },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          signatures: { $sum: "$signatureCount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    // Poll Statistics
    const pollStats = await Poll.aggregate([
      { $match: pollMatch },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total votes for polls in location
    const pollIds = await Poll.find(pollMatch).select("_id");
    const pollIdArray = pollIds.map((p) => p._id);

    const totalPollVotes = await Vote.countDocuments({
      poll: { $in: pollIdArray },
    });

    // Monthly Vote Trends
    const monthlyVotes = await Vote.aggregate([
      { $match: { poll: { $in: pollIdArray } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    // Top Petitions by Signatures
    const topPetitions = await Petition.find(petitionMatch)
      .select("title category signatureCount status createdAt")
      .sort({ signatureCount: -1 })
      .limit(10);

    // Response Rate (petitions with official response)
    const totalPetitions = await Petition.countDocuments(petitionMatch);
    const respondedPetitions = await Petition.countDocuments({
      ...petitionMatch,
      officialResponse: { $exists: true, $ne: "" },
    });

    // Format the report
    const report = {
      generatedAt: new Date(),
      location: targetLocation,
      dateRange: {
        start: startDate || "All time",
        end: endDate || "Present",
      },
      petitions: {
        total: totalPetitions,
        byStatus: petitionStats.reduce((acc, stat) => {
          acc[stat._id] = { count: stat.count, signatures: stat.totalSignatures };
          return acc;
        }, {}),
        byCategory: petitionsByCategory,
        monthlyTrends: monthlyPetitions.map((m) => ({
          month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
          petitions: m.count,
          signatures: m.signatures,
        })),
        topBySignatures: topPetitions,
        responseRate: totalPetitions > 0
          ? ((respondedPetitions / totalPetitions) * 100).toFixed(2)
          : 0,
      },
      polls: {
        total: pollIds.length,
        byStatus: pollStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        totalVotes: totalPollVotes,
        monthlyVoteTrends: monthlyVotes.map((m) => ({
          month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
          votes: m.count,
        })),
      },
    };

    // Log report generation
    await AdminLog.log({
      action: "report_generated",
      user: req.user._id,
      details: {
        location: targetLocation,
        dateRange: { startDate, endDate },
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export reports as CSV or PDF
 * @route   GET /api/reports/export
 * @access  Private (Official only)
 */
const exportReports = async (req, res, next) => {
  try {
    const { type = "petitions", format = "csv", startDate, endDate, location } = req.query;

    if (!["csv", "pdf"].includes(format)) {
      return res.status(400).json({
        success: false,
        message: "Invalid export format. Use: csv or pdf",
      });
    }

    const targetLocation = resolveAuthorizedLocation(req, location);
    if (!targetLocation) {
      return res.status(403).json({
        success: false,
        message: "Cross-location export is not allowed",
      });
    }

    const parsedStartDate = parseDateOrNull(startDate);
    const parsedEndDate = parseDateOrNull(endDate);

    if (startDate && !parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate",
      });
    }

    if (endDate && !parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid endDate",
      });
    }

    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be later than endDate",
      });
    }

    // Build match conditions
    const matchCondition = {};
    if (parsedStartDate || parsedEndDate) {
      matchCondition.createdAt = {};
      if (parsedStartDate) matchCondition.createdAt.$gte = parsedStartDate;
      if (parsedEndDate) matchCondition.createdAt.$lte = parsedEndDate;
    }

    let columns = [];
    let rows = [];
    let title = "";
    let filename = "";

    if (type === "petitions") {
      matchCondition.location = targetLocation;

      const petitions = await Petition.find(matchCondition)
        .populate("creator", "name email")
        .populate("respondedBy", "name email")
        .sort({ createdAt: -1 });

      columns = [
        "ID",
        "Title",
        "Category",
        "Status",
        "Signatures",
        "Creator",
        "Created At",
        "Response",
        "Responded By",
        "Responded At",
      ];

      rows = petitions.map((p) => [
        String(p._id),
        p.title,
        p.category,
        p.status,
        String(p.signatureCount),
        p.creator?.name || "N/A",
        p.createdAt.toISOString(),
        p.officialResponse || "",
        p.respondedBy?.name || "N/A",
        p.respondedAt?.toISOString() || "N/A",
      ]);

      title = "Petitions Report";
      filename = `petitions_report_${targetLocation}_${Date.now()}.${format}`;
    } else if (type === "polls") {
      matchCondition.targetLocation = targetLocation;

      const polls = await Poll.find(matchCondition)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

      // Get vote counts for each poll
      const pollsWithVotes = await Promise.all(
        polls.map(async (poll) => {
          const voteCount = await Vote.countDocuments({ poll: poll._id });
          return { ...poll.toObject(), voteCount };
        })
      );

      columns = [
        "ID",
        "Title",
        "Options",
        "Status",
        "Total Votes",
        "Created By",
        "Target Location",
        "Created At",
      ];

      rows = pollsWithVotes.map((p) => [
        String(p._id),
        p.title,
        p.options.join("; "),
        p.status,
        String(p.voteCount),
        p.createdBy?.name || "N/A",
        p.targetLocation,
        p.createdAt.toISOString(),
      ]);

      title = "Polls Report";
      filename = `polls_report_${targetLocation}_${Date.now()}.${format}`;
    } else if (type === "signatures") {
      // Get petitions in location first
      const petitionIds = await Petition.find({ location: targetLocation }).select("_id");
      matchCondition.petition = { $in: petitionIds.map((p) => p._id) };

      const signatures = await Signature.find(matchCondition)
        .populate("user", "name email")
        .populate("petition", "title")
        .sort({ createdAt: -1 });

      columns = ["ID", "Petition Title", "User Name", "User Email", "Signed At"];

      rows = signatures.map((s) => [
        String(s._id),
        s.petition?.title || "N/A",
        s.user?.name || "N/A",
        s.user?.email || "N/A",
        s.createdAt.toISOString(),
      ]);

      title = "Signatures Report";
      filename = `signatures_report_${targetLocation}_${Date.now()}.${format}`;
    } else if (type === "votes") {
      // Get polls in location first
      const pollIds = await Poll.find({ targetLocation }).select("_id");
      matchCondition.poll = { $in: pollIds.map((p) => p._id) };

      const votes = await Vote.find(matchCondition)
        .populate("user", "name email")
        .populate("poll", "title")
        .sort({ createdAt: -1 });

      columns = ["ID", "Poll Title", "User Name", "Selected Option", "Voted At"];

      rows = votes.map((v) => [
        String(v._id),
        v.poll?.title || "N/A",
        v.user?.name || "Anonymous",
        v.selectedOption,
        v.createdAt.toISOString(),
      ]);

      title = "Votes Report";
      filename = `votes_report_${targetLocation}_${Date.now()}.${format}`;
    } else if (type === "audit") {
      // Admin logs for the official
      const logs = await AdminLog.find({ user: req.user._id })
        .populate("petition", "title")
        .populate("poll", "title")
        .sort({ createdAt: -1 })
        .limit(1000);

      columns = ["ID", "Action", "Related Petition", "Related Poll", "Details", "Timestamp"];

      rows = logs.map((l) => [
        String(l._id),
        l.action,
        l.petition?.title || "N/A",
        l.poll?.title || "N/A",
        JSON.stringify(l.details || {}),
        l.createdAt.toISOString(),
      ]);

      title = "Audit Log";
      filename = `audit_log_${Date.now()}.${format}`;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid export type. Use: petitions, polls, signatures, votes, or audit",
      });
    }

    // Log export action
    await AdminLog.log({
      action: "report_exported",
      user: req.user._id,
      details: {
        type,
        format,
        location: targetLocation,
        dateRange: { startDate, endDate },
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    if (format === "csv") {
      const csvData = buildCsv(columns, rows);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send(csvData);
      return;
    }

    const pdfBuffer = await buildPdfBuffer({
      title,
      metaLines: [
        `Location: ${targetLocation}`,
        `Date range: ${startDate || "All time"} to ${endDate || "Present"}`,
        `Generated at: ${new Date().toISOString()}`,
      ],
      columns,
      rows,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get admin activity logs
 * @route   GET /api/reports/logs
 * @access  Private (Official only)
 */
const getAdminLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action } = req.query;

    const filter = { user: req.user._id };

    if (action) {
      filter.action = action;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AdminLog.find(filter)
        .populate("petition", "title")
        .populate("poll", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AdminLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
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
  generateReports,
  exportReports,
  getAdminLogs,
};
