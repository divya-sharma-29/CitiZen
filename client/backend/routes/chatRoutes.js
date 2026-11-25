"use strict";

const express = require("express");

function createChatRoutes({ protect, controller }) {
  const router = express.Router();
  router.get("/history", protect, controller.getHistory);
  router.delete("/history", protect, controller.clearHistory);
  return router;
}

module.exports = { createChatRoutes };
