const mongoose = require("mongoose");

const petitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a petition title"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a petition description"],
      trim: true,
      minlength: [50, "Description must be at least 50 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
      enum: {
        values: [
          "infrastructure",
          "education",
          "healthcare",
          "environment",
          "transportation",
          "public-safety",
          "housing",
          "other",
        ],
        message: "Please select a valid category",
      },
    },
    location: {
      type: String,
      required: [true, "Please provide a location"],
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "under_review", "closed"],
        message: "Status must be active, under_review, or closed",
      },
      default: "active",
    },
    signatureCount: {
      type: Number,
      default: 0,
    },
    // Official Response Fields (Milestone 4)
    officialResponse: {
      type: String,
      trim: true,
      maxlength: [2000, "Response cannot exceed 2000 characters"],
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient querying
petitionSchema.index({ location: 1, category: 1, status: 1 }); // Compound
petitionSchema.index({ location: 1 });  // Location filter
petitionSchema.index({ category: 1 });  // Category filter
petitionSchema.index({ status: 1 });    // Status filter
petitionSchema.index({ creator: 1 });   // Creator lookup

// Virtual field for signature count from Signature collection (single source of truth)
petitionSchema.virtual("signatureCountFromDB", {
  ref: "Signature",
  localField: "_id",
  foreignField: "petition",
  count: true,
});

const Petition = mongoose.model("Petition", petitionSchema);

module.exports = Petition;
