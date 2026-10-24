const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    // ================= USER =================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ================= BASIC INFORMATION =================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Road Damage",
        "Garbage",
        "Streetlight",
        "Water Leakage",
        "Drainage",
        "Other",
      ],
    },

    // ================= LOCATION =================

    location: {
      type: String,
      required: true,
      trim: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    // ================= IMAGE =================

    imageUrl: {
      type: String,
      default: null,
    },

    // ================= STATUS =================

    status: {
      type: String,
      enum: [
        "Reported",
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved",
      ],
      default: "Reported",
    },

    // ================= CIVIC INTELLIGENCE =================

    severity: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical",
      ],
      default: "Medium",
    },

    priorityScore: {
      type: Number,
      default: 50,
    },
    

    // ================= AI PLACEHOLDERS =================

    aiVerified: {
      type: Boolean,
      default: false,
    },

    aiCategory: {
      type: String,
      default: null,
    },

    aiConfidence: {
      type: Number,
      default: null,
    },

    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      default: null,
    },

     assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    appreciatedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    resolutionNote: {
      type: String,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    duplicateCount: {
      type: Number,
      default: 0,
    },


    // ================= COMMUNITY =================

    appreciationCount: {
      type: Number,
      default: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({
  latitude: 1,
  longitude: 1,
});

module.exports = mongoose.model("Report", reportSchema);