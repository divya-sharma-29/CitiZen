const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "USER_SUSPENDED",
        "USER_REACTIVATED",
        "USER_REMOVED",
        "USER_RESTORED",
        "USER_ROLE_CHANGED",
        "REPORT_ASSIGNED",
        "REPORT_REASSIGNED",
        "REPORT_UNASSIGNED",
      ],
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    targetReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      default: null,
    },
    summary: {
      type: String,
      required: true,
      maxlength: 500,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ targetUserId: 1, createdAt: -1 });
auditLogSchema.index({ targetReportId: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
