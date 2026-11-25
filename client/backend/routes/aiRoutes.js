"use strict";

const express = require("express");
const { validateChatBody } = require("../middleware/validateChat");

function createAiRoutes({ protect, controller, userLimiters }) {
  const router = express.Router();
  router.post("/chat", protect, ...userLimiters, validateChatBody, controller.chat);
  return router;
}

module.exports = { createAiRoutes };
