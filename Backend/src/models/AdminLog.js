const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: {
        values: [
          "petition_status_update",
          "petition_response",
          "poll_created",
          "poll_closed",
          "report_generated",
          "report_exported",
          "user_verified",
          "user_role_changed",
        ],
        message: "Invalid action type",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    petition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Petition",
    },
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      immutable: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
adminLogSchema.index({ action: 1 });
adminLogSchema.index({ user: 1 });
adminLogSchema.index({ petition: 1 });
adminLogSchema.index({ createdAt: -1 });
adminLogSchema.index({ user: 1, action: 1, createdAt: -1 });

// Static method to create log entry
adminLogSchema.statics.log = async function (data) {
  return this.create(data);
};

// Audit logs must be immutable once created
const denyAuditMutation = function () {
  throw new Error("Admin logs are immutable and cannot be modified or deleted");
};

adminLogSchema.pre("updateOne", denyAuditMutation);
adminLogSchema.pre("updateMany", denyAuditMutation);
adminLogSchema.pre("findOneAndUpdate", denyAuditMutation);
adminLogSchema.pre("replaceOne", denyAuditMutation);
adminLogSchema.pre("findOneAndReplace", denyAuditMutation);
adminLogSchema.pre("deleteOne", denyAuditMutation);
adminLogSchema.pre("deleteMany", denyAuditMutation);
adminLogSchema.pre("findOneAndDelete", denyAuditMutation);

module.exports = mongoose.model("AdminLog", adminLogSchema);
