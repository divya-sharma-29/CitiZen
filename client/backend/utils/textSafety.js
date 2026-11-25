"use strict";

/**
 * Text safety helpers for the Civic AI Assistant:
 *  - sanitising user input
 *  - sanitising database text before it goes near a prompt
 *  - prompt-injection heuristics
 *  - validating what a language model returns before a citizen sees it
 */

const MAX_MESSAGE_CHARS = 1000;
const PROMPT_MARKER = "[CITIZEN-ASSISTANT-RULES]";

// Control characters and bidi overrides. ZWJ/ZWNJ (U+200C/D) are kept: Kannada and Hindi need them.
const UNSAFE_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

function sanitizeUserText(raw) {
  if (typeof raw !== "string") return "";
  return raw
    .normalize("NFC")
    .replace(UNSAFE_CHARS, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// For database text (titles, descriptions) that may be placed in a prompt.
function sanitizeForPrompt(value, max = 200) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(UNSAFE_CHARS, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+|any\s+|the\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i,
  /disregard\s+.{0,25}(instructions?|rules?|guidelines?)/i,
  /(reveal|show|print|repeat|display|leak)\b.{0,40}(system prompt|your instructions|your rules|api key|secret|jwt)/i,
  /\byou\s+are\s+now\b/i,
  /\b(developer|god|dan)\s+mode\b/i,
  /\bjailbreak/i,
  /\bact\s+as\s+(an?\s+)?(admin|administrator|root|superuser)\b/i,
  /\bpretend\s+(to\s+be|you\s+are)\b/i,
  /\bnew\s+instructions?\s*:/i,
];

function looksLikeInjection(text) {
  const value = String(text || "");
  return INJECTION_PATTERNS.some((pattern) => pattern.test(value));
}

const SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{16,}/,
  /\bAIza[0-9A-Za-z_-]{20,}/,
  /mongodb(\+srv)?:\/\//i,
  /JWT_SECRET|AI_API_KEY|EMAIL_APP_PASSWORD/,
];

const SUBMISSION_CLAIMS = [
  /\b(i|we)(\s+have|'ve)?\s+(successfully\s+)?(submitted|filed|created|registered|lodged|logged|raised)\b/i,
  /\b(complaint|report|issue|ticket)\b[^.!?\n]{0,60}\b(has|have|was|is)\s+(been\s+)?(successfully\s+)?(submitted|filed|created|registered|lodged|logged|raised)\b/i,
  /दर्ज कर (दी|दिया|लिया)|सबमिट कर (दी|दिया)/,
  /ಸಲ್ಲಿಸಿದ್ದೇನೆ|ದಾಖಲಿಸಿದ್ದೇನೆ|ಸಲ್ಲಿಸಲಾಗಿದೆ/,
];

// The model has no database access in general-chat mode, so it must not state complaint facts.
const STATUS_CLAIM =
  /\byour\s+(complaint|report)\b[^.!?\n]{0,80}\b(is|was|has been)\b[^.!?\n]{0,30}\b(reported|under review|assigned|in progress|resolved)\b/i;

const PHONE_CONTEXT =
  /(call|dial|phone|helpline|toll[\s-]?free|contact|number)\D{0,25}(\+?\d[\d\s-]{2,}\d)/gi;
const LONG_DIGITS = /\+?\d[\d\s-]{6,}\d/g;

function digitsOnly(value) {
  return String(value).replace(/\D/g, "");
}

function findUnapprovedNumber(text, allowedNumbers) {
  const allowed = allowedNumbers instanceof Set ? allowedNumbers : new Set(allowedNumbers || []);
  const candidates = [];

  for (const match of text.matchAll(PHONE_CONTEXT)) candidates.push(digitsOnly(match[2]));
  for (const match of text.matchAll(LONG_DIGITS)) candidates.push(digitsOnly(match[0]));

  return candidates.find((digits) => digits.length >= 3 && !allowed.has(digits)) || null;
}

/**
 * Returns { ok, reason, text }. A rejected answer is replaced by the caller
 * with a deterministic fallback.
 */
function validateModelOutput(raw, { allowedNumbers = [] } = {}) {
  if (typeof raw !== "string") return { ok: false, reason: "empty" };

  const text = raw.replace(UNSAFE_CHARS, "").trim();

  if (!text) return { ok: false, reason: "empty" };
  if (text.length > 2500) return { ok: false, reason: "too_long" };
  if (text.includes(PROMPT_MARKER)) return { ok: false, reason: "prompt_leak" };
  if (SECRET_PATTERNS.some((p) => p.test(text))) return { ok: false, reason: "secret_leak" };
  if (SUBMISSION_CLAIMS.some((p) => p.test(text))) return { ok: false, reason: "submission_claim" };
  if (STATUS_CLAIM.test(text)) return { ok: false, reason: "status_claim" };
  if (findUnapprovedNumber(text, allowedNumbers)) return { ok: false, reason: "unapproved_number" };

  return { ok: true, text };
}

module.exports = {
  MAX_MESSAGE_CHARS,
  PROMPT_MARKER,
  sanitizeUserText,
  sanitizeForPrompt,
  looksLikeInjection,
  validateModelOutput,
};
