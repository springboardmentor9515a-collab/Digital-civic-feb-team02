const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Poll title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    options: {
      type: [String],
      required: [true, "Poll options are required"],
      validate: {
        validator: function (v) {
          return v && v.length >= 2;
        },
        message: "Poll must have at least 2 options",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Poll creator is required"],
    },
    targetLocation: {
      type: String,
      required: [true, "Target location is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "closed"],
        message: "Status must be either active or closed",
      },
      default: "active",
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient querying by location and status
pollSchema.index({ targetLocation: 1, status: 1 });
pollSchema.index({ createdBy: 1 });
pollSchema.index({ createdAt: -1 });

// Virtual for vote count (populated via aggregation)
pollSchema.virtual("votes", {
  ref: "Vote",
  localField: "_id",
  foreignField: "poll",
});

module.exports = mongoose.model("Poll", pollSchema);
