const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: [true, "Poll reference is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    selectedOption: {
      type: String,
      required: [true, "Selected option is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate voting
// Each user can only vote once per poll
voteSchema.index({ poll: 1, user: 1 }, { unique: true });

// Index for efficient aggregation by poll
voteSchema.index({ poll: 1, selectedOption: 1 });

module.exports = mongoose.model("Vote", voteSchema);
