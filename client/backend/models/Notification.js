const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "REPORT_CREATED",
        "REPORT_ASSIGNED",
        "STATUS_UPDATED",
        "COMMENT_ADDED",
        "REPORT_RESOLVED",
        "DUPLICATE_DETECTED",
        "APPRECIATION",
        "ACCOUNT_STATUS_CHANGED",
        "ACCOUNT_REMOVED",
        "REPORT_UNASSIGNED",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      default: null,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);