"use strict";

const ChatHistory = require("../models/ChatHistory");

function intFromEnv(name, fallback, min, max) {
  const parsed = Number.parseInt(process.env[name], 10);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

// Read lazily so values from .env are honoured regardless of require order.
const maxMessages = () => intFromEnv("AI_HISTORY_MAX_MESSAGES", 100, 10, 500);
const retentionDays = () => intFromEnv("AI_HISTORY_RETENTION_DAYS", 30, 1, 365);

async function getConversation(userId) {
  return ChatHistory.findOne({ userId }).lean();
}

// Appends a turn, trims to the message cap, refreshes retention, and merges context.
async function appendTurn(userId, messages, contextPatch = {}) {
  const set = { expiresAt: new Date(Date.now() + retentionDays() * 86400000) };

  for (const [key, value] of Object.entries(contextPatch)) {
    if (value !== undefined) set[`context.${key}`] = value;
  }

  const update = { $push: { messages: { $each: messages, $slice: -maxMessages() } }, $set: set };
  const options = { upsert: true, returnDocument: "after" };

  try {
    return await ChatHistory.findOneAndUpdate({ userId }, update, options).lean();
  } catch (error) {
    // Two first messages racing to create the same document: retry once as a plain update.
    if (error && error.code === 11000) {
      return ChatHistory.findOneAndUpdate({ userId }, update, options).lean();
    }
    throw error;
  }
}

async function clearConversation(userId) {
  const result = await ChatHistory.deleteOne({ userId });
  return result.deletedCount > 0;
}

module.exports = { getConversation, appendTurn, clearConversation };
