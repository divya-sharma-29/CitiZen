"use strict";

/**
 * Provider-agnostic text generation behind the backend. API keys live only in
 * environment variables and never reach the browser.
 *
 *   AI_PROVIDER   anthropic | openai   (openai also covers OpenAI-compatible servers)
 *   AI_API_KEY    provider key
 *   AI_MODEL      model identifier (required; no default so it never goes stale)
 *   AI_BASE_URL   optional override of the provider's base URL
 *   AI_TIMEOUT_MS optional, default 15000
 *   AI_MAX_TOKENS optional, default 600
 *
 * After 3 consecutive failures the provider is skipped for 60 seconds so a
 * provider outage never slows down the fallback path.
 */

const DEFAULTS = {
  anthropic: "https://api.anthropic.com",
  openai: "https://api.openai.com/v1",
};

function intFrom(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

function readConfig(env) {
  const provider = String(env.AI_PROVIDER || "").trim().toLowerCase();
  return {
    provider,
    apiKey: String(env.AI_API_KEY || "").trim(),
    model: String(env.AI_MODEL || "").trim(),
    baseUrl: String(env.AI_BASE_URL || DEFAULTS[provider] || "").trim().replace(/\/$/, ""),
    timeoutMs: intFrom(env.AI_TIMEOUT_MS, 15000, 1000, 60000),
    maxTokens: intFrom(env.AI_MAX_TOKENS, 600, 50, 2000),
  };
}

// Providers need strictly alternating roles that start with the user.
function normalizeMessages(messages) {
  const out = [];

  for (const message of messages) {
    const role = message.role === "assistant" ? "assistant" : "user";
    const content = String(message.content || "").trim();
    if (!content) continue;

    const last = out[out.length - 1];
    if (last && last.role === role) last.content += `\n\n${content}`;
    else out.push({ role, content });
  }

  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

function createAiService({ fetchImpl, env = process.env, now = Date.now, logger = console } = {}) {
  const state = { failures: 0, openUntil: 0 };

  function config() {
    return readConfig(env);
  }

  function isConfigured() {
    const c = config();
    return Boolean(DEFAULTS[c.provider] && c.apiKey && c.model);
  }

  function isAvailable() {
    return isConfigured() && now() >= state.openUntil;
  }

  async function generate({ system, messages, maxTokens }) {
    if (!isAvailable()) throw new Error("AI provider unavailable");

    const c = config();
    const doFetch = fetchImpl || globalThis.fetch;
    const turns = normalizeMessages(messages);
    if (!turns.length) throw new Error("No user message to send");

    const limit = maxTokens || c.maxTokens;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), c.timeoutMs);

    let url;
    let headers;
    let body;

    if (c.provider === "anthropic") {
      url = `${c.baseUrl}/v1/messages`;
      headers = { "content-type": "application/json", "x-api-key": c.apiKey, "anthropic-version": "2023-06-01" };
      body = { model: c.model, max_tokens: limit, temperature: 0.3, system, messages: turns };
    } else {
      url = `${c.baseUrl}/chat/completions`;
      headers = { "content-type": "application/json", authorization: `Bearer ${c.apiKey}` };
      body = {
        model: c.model,
        max_tokens: limit,
        temperature: 0.3,
        messages: [{ role: "system", content: system }, ...turns],
      };
    }

    try {
      const response = await doFetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: controller.signal });

      if (!response.ok) throw new Error(`AI provider returned HTTP ${response.status}`);

      const data = await response.json();
      const text =
        c.provider === "anthropic"
          ? (data.content || []).filter((block) => block.type === "text").map((block) => block.text).join("")
          : data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

      if (typeof text !== "string" || !text.trim()) throw new Error("AI provider returned no text");

      state.failures = 0;
      return { text: text.trim(), provider: c.provider, model: c.model };
    } catch (error) {
      state.failures += 1;
      if (state.failures >= 3) {
        state.openUntil = now() + 60000;
        state.failures = 0;
        logger.warn("AI provider failing repeatedly; using fallback answers for 60 seconds.");
      }
      throw error.name === "AbortError" ? new Error("AI provider timed out") : error;
    } finally {
      clearTimeout(timer);
    }
  }

  return { isConfigured, isAvailable, generate };
}

module.exports = { createAiService, normalizeMessages, readConfig };
