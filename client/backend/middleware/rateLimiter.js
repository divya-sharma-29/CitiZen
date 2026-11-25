"use strict";

/**
 * Small in-memory sliding-window rate limiter (no extra dependency).
 * Suitable for a single server instance; use a shared store such as Redis
 * if the API is ever scaled across several instances.
 */
function createRateLimiter({ windowMs, max, keyFn, message, now = Date.now }) {
  const hits = new Map();

  const sweeper = setInterval(() => {
    const cutoff = now() - windowMs;
    for (const [key, times] of hits) {
      if (!times.length || times[times.length - 1] <= cutoff) hits.delete(key);
    }
  }, Math.max(windowMs, 30000));
  if (typeof sweeper.unref === "function") sweeper.unref();

  return function rateLimiter(req, res, next) {
    const key = String(keyFn(req));
    const current = now();
    const recent = (hits.get(key) || []).filter((time) => current - time < windowMs);

    if (recent.length >= max) {
      const retryAfter = Math.max(1, Math.ceil((windowMs - (current - recent[0])) / 1000));
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        message: message || "Too many requests. Please slow down and try again shortly.",
        retryAfterSeconds: retryAfter,
      });
    }

    recent.push(current);
    hits.set(key, recent);
    return next();
  };
}

module.exports = { createRateLimiter };
