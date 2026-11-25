const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true, maxlength: 4000 },
  intent: { type: String, default: null },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const chatHistorySchema = new mongoose.Schema(
  {
    // One rolling conversation per user.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    messages: { type: [messageSchema] },

    // Conversation memory used for follow-up questions.
    context: {
      language: { type: String, enum: ["en", "hi", "kn"] },
      activeReportId: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
      lastIntent: { type: String },
      pendingChoice: { type: [mongoose.Schema.Types.ObjectId] },
      pendingIntent: { type: String },
    },

    // Retention: MongoDB removes the document once this date passes.
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

chatHistorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
