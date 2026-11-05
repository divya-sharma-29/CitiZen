const mongoose = require("mongoose");

const authorityRatingSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: String,
      default: null,
      trim: true,
    },
    resolutionCycle: {
      type: Number,
      required: true,
      min: 1,
    },
    resolutionQuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    responsiveness: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    communication: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    professionalism: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    overallSatisfaction: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

authorityRatingSchema.index(
  {
    reportId: 1,
    citizenId: 1,
    resolutionCycle: 1,
  },
  {
    unique: true,
  }
);
authorityRatingSchema.index({
  authorityId: 1,
  createdAt: -1,
});

module.exports = mongoose.model("AuthorityRating", authorityRatingSchema);
