"use strict";

/**
 * Mounts the Civic AI Assistant on the existing Express app.
 * Reuses the app's own `protect` middleware so authentication behaves exactly
 * like every other CitiZen route (JWT, authVersion, active-account checks).
 */

const { createRateLimiter } = require("../middleware/rateLimiter");
const { createAiRoutes } = require("./aiRoutes");
const { createChatRoutes } = require("./chatRoutes");
const { createAiController } = require("../controllers/aiController");
const { createChatController } = require("../controllers/chatController");

function intFromEnv(name, fallback) {
  const parsed = Number.parseInt(process.env[name], 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function mountCivicAi(app, { protect, overrides = {} }) {
  const history = overrides.history || require("../services/chatHistoryService");
  const assistant =
    overrides.assistant ||
    require("../services/civicAssistantService").createCivicAssistant({
      data: require("../services/civicDataService"),
      ai: require("../services/aiService").createAiService(),
    });

  // Coarse per-IP limit runs before authentication; per-user limits run after it.
  const ipLimiter = createRateLimiter({
    windowMs: 60000,
    max: intFromEnv("AI_RATE_LIMIT_IP_PER_MIN", 120),
    keyFn: (req) => `ip:${req.ip}`,
  });
  const perMinute = createRateLimiter({
    windowMs: 60000,
    max: intFromEnv("AI_RATE_LIMIT_PER_MIN", 20),
    keyFn: (req) => `min:${req.user.id}`,
    message: "You're sending messages too quickly. Please wait a moment and try again.",
  });
  const perHour = createRateLimiter({
    windowMs: 3600000,
    max: intFromEnv("AI_RATE_LIMIT_PER_HOUR", 200),
    keyFn: (req) => `hour:${req.user.id}`,
    message: "You've reached the hourly message limit for the assistant. Please try again later.",
  });

  app.use("/api/ai", ipLimiter);
  app.use("/api/ai", createAiRoutes({
    protect,
    controller: createAiController({ assistant, history }),
    userLimiters: [perMinute, perHour],
  }));
  app.use("/api/ai", createChatRoutes({
    protect,
    controller: createChatController({ history }),
  }));

  return { assistant, history };
}

module.exports = mountCivicAi;
