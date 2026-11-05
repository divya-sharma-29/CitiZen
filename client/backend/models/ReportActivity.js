const mongoose = require("mongoose");

const reportActivitySchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "CREATED",
        "STATUS_CHANGED",
        "ASSIGNED",
        "COMMENTED",
        "APPRECIATED",
        "DUPLICATE_DETECTED",
        "RESOLVED",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    oldValue: {
      type: String,
      default: null,
    },

    newValue: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reportActivitySchema.index({
  reportId: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "ReportActivity",
  reportActivitySchema
);