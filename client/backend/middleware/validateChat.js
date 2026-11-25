"use strict";

const { MAX_MESSAGE_CHARS, sanitizeUserText } = require("../utils/textSafety");

const LANGUAGES = ["en", "hi", "kn"];
const PAGE_PATH = /^\/[A-Za-z0-9\-_/]{0,150}$/;
const OBJECT_ID = /^[a-f\d]{24}$/i;

// Validates POST /api/ai/chat and exposes a clean copy as req.chat.
function validateChatBody(req, res, next) {
  const body = req.body && typeof req.body === "object" ? req.body : {};

  if (typeof body.message !== "string") {
    return res.status(400).json({ message: "A text message is required." });
  }

  const message = sanitizeUserText(body.message);

  if (!message) {
    return res.status(400).json({ message: "Message cannot be empty." });
  }

  if (message.length > MAX_MESSAGE_CHARS) {
    return res.status(400).json({
      message: `Message is too long. Please keep it under ${MAX_MESSAGE_CHARS} characters.`,
    });
  }

  let language;
  if (body.language !== undefined && body.language !== null && body.language !== "") {
    if (!LANGUAGES.includes(body.language)) {
      return res.status(400).json({ message: "Language must be one of: en, hi, kn." });
    }
    language = body.language;
  }

  const pageContext = {};
  if (body.pageContext !== undefined && body.pageContext !== null) {
    const raw = body.pageContext;

    if (typeof raw !== "object" || Array.isArray(raw)) {
      return res.status(400).json({ message: "pageContext must be an object." });
    }
    if (raw.path !== undefined) {
      if (typeof raw.path !== "string" || !PAGE_PATH.test(raw.path)) {
        return res.status(400).json({ message: "Invalid page path." });
      }
      pageContext.path = raw.path;
    }
    if (raw.reportId !== undefined) {
      if (typeof raw.reportId !== "string" || !OBJECT_ID.test(raw.reportId)) {
        return res.status(400).json({ message: "Invalid report id." });
      }
      pageContext.reportId = raw.reportId;
    }
  }

  req.chat = { message, language, pageContext };
  return next();
}

module.exports = { validateChatBody, LANGUAGES };
