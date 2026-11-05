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

    imageUrls: {
      type: [String],
      default: [],
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

    assignedAt: {
      type: Date,
      default: null,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignmentHistory: [
      {
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        assignedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
        previousAuthority: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        action: {
          type: String,
          enum: ["ASSIGNED", "REASSIGNED", "UNASSIGNED"],
          default: "ASSIGNED",
        },
      },
    ],

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

    resolutionCycle: {
      type: Number,
      default: 0,
      min: 0,
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
reportSchema.index({
  userId: 1,
  createdAt: -1,
});
reportSchema.index({
  userId: 1,
  status: 1,
});

module.exports = mongoose.model("Report", reportSchema);