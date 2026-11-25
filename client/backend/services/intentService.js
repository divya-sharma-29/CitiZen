"use strict";

/**
 * Rule-based understanding of what a citizen wants. Deterministic, free, and works
 * with no AI provider. Handles English, Hindi (Devanagari) and Kannada.
 *
 * Indic keywords are matched as substrings (the languages inflect heavily);
 * English patterns use word boundaries.
 */

const { LANGS } = require("./civicI18n");
const { looksLikeInjection } = require("../utils/textSafety");

function normalize(text) {
  return String(text || "")
    .normalize("NFC")
    .replace(/[\u200C\u200D]/g, "")
    .toLowerCase();
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

function anyIndic(text, words) {
  return words.some((word) => text.includes(word));
}

function wordCount(text) {
  return (text.match(/[\p{L}\p{M}]+/gu) || []).length;
}

/* ---------------------------------------------------------------- language */

function scriptCounts(text) {
  return {
    kn: countMatches(text, /[\u0C80-\u0CFF]/g),
    hi: countMatches(text, /[\u0900-\u097F]/g),
    latin: countMatches(text, /[A-Za-z]/g),
  };
}

const SWITCH_RULES = [
  { lang: "kn", test: (n) => /\b(speak|talk|reply|respond|answer|switch|change|continue|write|use|translate|explain)\b.*\bkannada\b|\b(in|into|to)\s+kannada\b|^kannada( please)?$/.test(n) || anyIndic(n, ["ಕನ್ನಡದಲ್ಲಿ", "ಕನ್ನಡಕ್ಕೆ"]) || n.trim() === "ಕನ್ನಡ" },
  { lang: "hi", test: (n) => /\b(speak|talk|reply|respond|answer|switch|change|continue|write|use|translate|explain)\b.*\bhindi\b|\b(in|into|to)\s+hindi\b|^hindi( please)?$/.test(n) || anyIndic(n, ["हिंदी में", "हिन्दी में", "ಹಿಂದಿಯಲ್ಲಿ"]) || ["हिंदी", "हिन्दी"].includes(n.trim()) },
  { lang: "en", test: (n) => /\b(speak|talk|reply|respond|answer|switch|change|continue|write|use|translate|explain)\b.*\benglish\b|\b(in|into|to)\s+english\b|^english( please)?$/.test(n) || anyIndic(n, ["अंग्रेज़ी में", "अंग्रेजी में", "ಇಂಗ್ಲಿಷ್"]) },
];

function detectLanguageSwitch(text) {
  const n = normalize(text);
  if (wordCount(n) > 8) return null;
  const rule = SWITCH_RULES.find((r) => r.test(n));
  return rule ? rule.lang : null;
}

function resolveLanguage({ text, requested, stored }) {
  const s = scriptCounts(text);
  const indic = s.kn + s.hi;

  if (indic > 0 && indic >= s.latin / 2) return s.kn >= s.hi ? "kn" : "hi";
  if ((text.match(/[A-Za-z]+/g) || []).length >= 3) return "en";
  if (LANGS.includes(stored)) return stored;
  if (LANGS.includes(requested)) return requested;
  return "en";
}

/* --------------------------------------------------------------- emergency */

const CRITICAL_EN = [
  /\bgas (leak\w*|smell)\b/,
  /\bsmell(s|ing)? (of )?gas\b/,
  /\belectric(al)? shock\b/,
  /\belectrocut\w*/,
  /\b(live|exposed|fallen|hanging|snapped) (electric )?(wire|wires|cable|cables)\b/,
  /\bsparking\b/,
  /\bbuilding\b.{0,20}\bcollaps\w*|\bcollaps\w*\b.{0,20}\bbuilding\b/,
  /\bsomeone\b.{0,25}\b(injured|hurt|bleeding|drowning|trapped|unconscious)\b/,
  /\b(bleeding|drowning|unconscious)\b/,
  /\b(on fire|caught fire|fire broke out|there'?s a fire|big fire|house fire|explosion|exploded|blast)\b/,
  /\bfire\b(?!\s*(station|hydrant|extinguisher|drill|safety|noc|department|brigade))/,
  /\b(child|kid|baby)\b.{0,40}\b(fell|stuck|trapped|drown\w*)\b/,
];

const CRITICAL_INDIC = [
  /आग(?![\u0900-\u097F])/,
  "गैस रिसाव", "गैस लीक", "करंट लग", "बिजली का झटका", "खुला तार", "नंगा तार", "विस्फोट", "इमारत गिर", "घायल", "खून बह", "डूब",
  "ಬೆಂಕಿ", "ಅನಿಲ ಸೋರಿಕೆ", "ಗ್ಯಾಸ್ ಸೋರಿಕೆ", "ವಿದ್ಯುತ್ ಆಘಾತ", "ತೆರೆದ ತಂತಿ", "ಸ್ಫೋಟ", "ಕಟ್ಟಡ ಕುಸಿ", "ಗಾಯಗೊಂಡ", "ರಕ್ತಸ್ರಾವ", "ಮುಳುಗ",
];

function detectEmergency(text) {
  const n = normalize(text);
  const reasons = [];

  for (const pattern of CRITICAL_EN) {
    const match = n.match(pattern);
    if (match) reasons.push(match[0]);
  }
  for (const entry of CRITICAL_INDIC) {
    if (entry instanceof RegExp) {
      const match = n.match(entry);
      if (match) reasons.push(match[0]);
    } else if (n.includes(entry)) {
      reasons.push(entry);
    }
  }

  return { critical: reasons.length > 0, reasons: [...new Set(reasons)] };
}

/* ---------------------------------------------------------------- category */

const CATEGORY_RULES = {
  "Road Damage": {
    en: [[/\bpot ?holes?\b/, 3], [/\broads?\b/, 1], [/\b(cracks?|cracked|asphalt|tarmac|sinkhole|speed ?breakers?|footpaths?|pavements?|sidewalks?)\b/, 1]],
    indic: [["गड्ढ", 3], ["सड़क", 1], ["सडक", 1], ["फुटपाथ", 1], ["ಗುಂಡಿ", 3], ["ರಸ್ತೆ", 1], ["ಫುಟ್ಪಾತ್", 1]],
  },
  Garbage: {
    en: [[/\b(garbage|trash|rubbish)\b/, 3], [/\b(litter|waste|dump(ed|ing)?|dustbins?|bins?|stink\w*|smell\w*)\b/, 1]],
    indic: [["कचरा", 3], ["कूड़ा", 3], ["गंदगी", 1], ["ಕಸ", 3], ["ದುರ್ವಾಸನೆ", 1]],
  },
  Streetlight: {
    en: [[/\bstreet ?lights?\b|\bstreet lamps?\b/, 3], [/\b(lamp ?posts?|bulbs?|dark (street|road|lane))\b|\blights? (is|are)? ?(not working|off|out|broken|flickering)\b/, 2]],
    indic: [["स्ट्रीट लाइट", 3], ["स्ट्रीटलाइट", 3], ["बिजली का खंभा", 2], ["ಬೀದಿ ದೀಪ", 3], ["ದೀಪ", 1]],
  },
  "Water Leakage": {
    en: [[/\bwater (leak\w*|supply|wast\w*)\b/, 3], [/\b(pipe(line)?s?|leak(s|ing|age)?|burst|taps?)\b/, 1]],
    indic: [["पानी का रिसाव", 3], ["पानी लीक", 3], ["पाइप", 1], ["ನೀರು ಸೋರಿಕೆ", 3], ["ಪೈಪ್", 1]],
  },
  Drainage: {
    en: [[/\b(drains?|drainage|sewer(age)?|sewage|manholes?|gutters?|waterlog\w*)\b/, 3], [/\b(clogg?ed|blocked|stagnant|overflowing)\b/, 1]],
    indic: [["नाली", 3], ["सीवर", 3], ["जलभराव", 3], ["ಚರಂಡಿ", 3], ["ಒಳಚರಂಡಿ", 3]],
  },
};

function classifyCategory(text) {
  const n = normalize(text);
  const scores = {};

  for (const [category, rules] of Object.entries(CATEGORY_RULES)) {
    let score = 0;
    for (const [pattern, weight] of rules.en) if (pattern.test(n)) score += weight;
    for (const [word, weight] of rules.indic) if (n.includes(word)) score += weight;
    scores[category] = score;
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topCategory, top] = ranked[0];
  const second = ranked[1][1];

  if (top === 0) return { category: "Other", confidence: 0, confident: false, scores };

  const confidence = top / (top + second + 1);
  return { category: topCategory, confidence, confident: confidence >= 0.5, scores };
}

/* ---------------------------------------------------------------- severity */

const HIGH_WORDS = /\b(huge|large|big|deep|dangerous|massive|major|serious|severe|blocking|burst|accidents?|collision|overflowing|flooding|flooded|no (light|water)|for (weeks|days|months)|children|school|hospital)\b/g;
const LOW_WORDS = /\b(small|minor|tiny|slight|little)\b/g;
const HIGH_INDIC = ["बहुत बड़ा", "गहरा", "खतरनाक", "ख़तरनाक", "दुर्घटना", "ದೊಡ್ಡ", "ಆಳವಾದ", "ಅಪಾಯಕಾರಿ", "ಅಪಘಾತ"];

function suggestSeverity(text, { emergency = false } = {}) {
  const n = normalize(text);

  if (emergency) return { severity: "Critical", reasons: ["possible danger to people"] };

  const high = [...new Set(n.match(HIGH_WORDS) || [])];
  const indic = HIGH_INDIC.filter((word) => n.includes(word));

  if (high.length || indic.length) return { severity: "High", reasons: [...high, ...indic] };

  const low = [...new Set(n.match(LOW_WORDS) || [])];
  if (low.length) return { severity: "Low", reasons: low };

  return { severity: "Medium", reasons: [] };
}

/* ----------------------------------------------------- sentiment / urgency */

const NEGATIVE_EN = /\b(angry|frustrat\w*|annoy\w*|useless|worst|terrible|horrible|disgust\w*|fed up|ridiculous|pathetic|ignored|nobody (cares|responds|is)|no one (cares|responds|is)|still (not|no)|again and again|waiting (for )?(days|weeks|months))\b/;
const NEGATIVE_INDIC = ["परेशान", "बेकार", "गुस्सा", "कोई सुनवाई", "अब तक नहीं", "ತೊಂದರೆ", "ಕೋಪ", "ಯಾರೂ ಕೇಳ", "ಇನ್ನೂ ಆಗಿಲ್ಲ"];
const URGENT_EN = /\b(urgent(ly)?|immediately|asap|right now|critical)\b/;
const URGENT_INDIC = ["तुरंत", "जल्दी", "ತುರ್ತು", "ತಕ್ಷಣ"];

function detectTone(text) {
  const n = normalize(text);
  return {
    sentiment: NEGATIVE_EN.test(n) || anyIndic(n, NEGATIVE_INDIC) ? "negative" : "neutral",
    urgency: URGENT_EN.test(n) || anyIndic(n, URGENT_INDIC) ? "high" : "normal",
  };
}

/* ------------------------------------------------------------------ intent */

const COMPLAINT_NOUN_EN = /\b(complaints?|reports?|issues?|requests?|tickets?|grievances?)\b/;
const COMPLAINT_NOUN_INDIC = ["शिकायत", "रिपोर्ट", "ದೂರ", "ವರದಿ"];

const TOPIC_RULES = [
  { topic: "waste_segregation", en: /\b(segregat\w*|wet waste|dry waste|compost\w*|recycl\w*)\b/, indic: ["कचरा अलग", "कचरे को अलग", "पृथक्करण", "गीला कचरा", "ಕಸ ವಿಂಗಡ", "ಹಸಿ ಕಸ"] },
  { topic: "water_conservation", en: /\b(save water|water conservation|conserve water|rain ?water|harvest\w*)\b/, indic: ["पानी बचा", "जल संरक्षण", "ನೀರು ಉಳಿ", "ಜಲ ಸಂರಕ್ಷಣೆ"] },
  { topic: "road_safety", en: /\b(road safety|helmets?|seat ?belts?|zebra|traffic rules?|speeding)\b/, indic: ["सड़क सुरक्षा", "हेलमेट", "ರಸ್ತೆ ಸುರಕ್ಷ", "ಹೆಲ್ಮೆಟ್"] },
  { topic: "public_hygiene", en: /\b(hygiene|sanitation|spitting|littering|cleanliness)\b/, indic: ["स्वच्छता", "सफ़ाई", "सफाई", "ಸ್ವಚ್ಛತೆ", "ನೈರ್ಮಲ್ಯ"] },
  { topic: "civic_responsibilities", en: /\bcivic (duty|duties|responsibilit\w*|sense)\b|\bresponsibilit(y|ies) of (a )?citizens?\b/, indic: ["नागरिक कर्तव्य", "नागरिक ज़िम्मेदारी", "नागरिक जिम्मेदारी", "ನಾಗರಿಕ ಕರ್ತವ್ಯ", "ನಾಗರಿಕ ಜವಾಬ್ದಾರಿ"] },
];

function detectTopic(n) {
  const rule = TOPIC_RULES.find((r) => r.en.test(n) || anyIndic(n, r.indic));
  return rule ? rule.topic : null;
}

function detectIntent(rawText) {
  const n = normalize(rawText);
  const words = wordCount(n);
  const hasNoun = COMPLAINT_NOUN_EN.test(n) || anyIndic(n, COMPLAINT_NOUN_INDIC);
  const nounHi = anyIndic(n, ["शिकायत", "रिपोर्ट"]);
  const nounKn = anyIndic(n, ["ದೂರ", "ವರದಿ"]);
  const hasQuestionForm = /\?|^(how|what|where|which|why|when|who|can|could|is|are|do|does|should)\b/.test(n) || anyIndic(n, ["कैसे", "क्या", "कहाँ", "कहां", "कौन", "ಹೇಗೆ", "ಏನು", "ಎಲ್ಲಿ", "ಯಾವ"]);

  if (/\bemergenc(y|ies)\b/.test(n) || anyIndic(n, ["आपात", "आपातकाल", "ತುರ್ತು"])) return "emergency_info";

  if (words <= 4 && (/^(hi|hello|hey|hii+|good (morning|afternoon|evening)|namaste|namaskara)\b/.test(n) || anyIndic(n, ["नमस्ते", "हैलो", "ನಮಸ್ಕಾರ", "ಹಲೋ"]))) return "greeting";

  if (/\bcivic services?\b|\bwhat can you (do|help)\b|\bhow can you help\b|\bwhat do you do\b|\bhelp me understand\b/.test(n) || anyIndic(n, ["नागरिक सेवा", "आप क्या कर सकते", "ನಾಗರಿಕ ಸೇವೆ", "ನೀವು ಏನು ಮಾಡ"])) return "capabilities";

  if (/\bhow\b.{0,15}\b(track|check|follow|monitor)\b/.test(n) || (anyIndic(n, ["कैसे"]) && anyIndic(n, ["ट्रैक", "देख सकता", "देख सकती"]) && nounHi) || (anyIndic(n, ["ಹೇಗೆ"]) && anyIndic(n, ["ಟ್ರ್ಯಾಕ್", "ನೋಡಬಹುದು"]) && nounKn)) return "track_how";

  if (/\b(who|which)\b.{0,40}\b(officer|handling|assigned|responsible|working on|looking after|dealing)\b|\bassigned (to|officer)\b|\bofficer\b.{0,30}\b(complaint|report)\b/.test(n) || anyIndic(n, ["अधिकारी", "ಅಧಿಕಾರಿ"])) return "officer_info";

  if (/\b(why|how)\b.{0,40}\b(priority|severity|urgent|critical)\b|\bpriority (score|level)\b/.test(n) || anyIndic(n, ["प्राथमिकता", "ಆದ್ಯತೆ"])) return "priority_explain";

  if (/\bhow (many )?(days|long)\b|\bpending (for|since)\b|\bhow old\b/.test(n) || anyIndic(n, ["कितने दिन", "कितना समय", "ಎಷ್ಟು ದಿನ"])) return "pending_days";

  if (/\bescalat\w*/.test(n) || anyIndic(n, ["एस्केलेट", "एस्केलेशन", "उच्च अधिकारी", "ಎಸ್ಕಲೇಟ್", "ಎಸ್ಕಲೇಶನ್", "ಉನ್ನತ ಅಧಿಕಾರಿ"])) return "escalation";

  if (/\b(last|latest|recent)\b.{0,25}\b(update|updated|activity|change)\b|\bwhen was (it|my|the).{0,30}updated\b/.test(n) || anyIndic(n, ["आखिरी बार", "अंतिम बार", "आखिरी अपडेट", "अंतिम अपडेट", "कब अपडेट", "ಕೊನೆಯ ಬಾರಿ", "ಕೊನೆಯ ಅಪ್ಡೇಟ್", "ಯಾವಾಗ ಅಪ್ಡೇಟ್"])) return "last_update";

  if (/\bwhy\b.{0,60}\b(not|haven'?t|hasn'?t|still|yet)\b.{0,40}\b(resolved|fixed|solved|done|addressed|pending|started)\b|\b(delay|delayed|taking (so |too )?long)\b/.test(n) || (anyIndic(n, ["क्यों"]) && anyIndic(n, ["हल", "समाधान", "देरी", "लंबित"])) || (anyIndic(n, ["ಏಕೆ", "ಯಾಕೆ"]) && anyIndic(n, ["ಪರಿಹಾರ", "ವಿಳಂಬ", "ಬಾಕಿ"]))) return "why_unresolved";

  if (/\b(status|progress|tracking|update on|what happened)\b/.test(n) && (hasNoun || words <= 6)) return "track_status";
  if (/\bmy (complaints?|reports?|tickets?|grievances?)\b/.test(n)) return "track_status";
  if (/\bwhere is (my|the)\b.{0,20}\b(complaint|report)\b/.test(n)) return "track_status";
  if ((nounHi && anyIndic(n, ["स्थिति", "हाल", "अपडेट", "ट्रैक", "क्या हुआ"])) || (nounKn && anyIndic(n, ["ಸ್ಥಿತಿ", "ಟ್ರ್ಯಾಕ್", "ಅಪ್ಡೇಟ್", "ಪ್ರಗತಿ", "ಏನಾಯಿತು"]))) return "track_status";

  if (/\b(which|what|who)\b.{0,30}\b(department|authority|office|agency|body)\b|\bdepartment (handles|for|responsible)\b|\bwho (handles|is responsible for|looks after)\b/.test(n) || anyIndic(n, ["विभाग", "ಇಲಾಖೆ"])) return "department_info";

  const topic = detectTopic(n);
  if (topic) return "civic_awareness";

  if (/\bhow (do|can|to|should)\b.{0,30}\b(report|raise|file|register|lodge|submit|complain)\b|\bwhere (can|do|should) i\b.{0,20}\b(report|complain|file|raise)\b|\bhow to (report|complain)\b|\bwhat should i do if\b/.test(n) || (anyIndic(n, ["कैसे"]) && anyIndic(n, ["दर्ज", "रिपोर्ट", "शिकायत"])) || (anyIndic(n, ["ಹೇಗೆ"]) && anyIndic(n, ["ವರದಿ", "ದೂರು", "ದೂರ"]))) return "report_how";

  if (/\b(near ?by|near me|around me|close to me|in my (area|ward|neighbou?rhood|locality))\b/.test(n) || anyIndic(n, ["आस-पास", "आसपास", "मेरे पास", "ಹತ್ತಿರ", "ಸುತ್ತಮುತ್ತ"])) return "nearby";

  const { category } = classifyCategory(n);
  if (category !== "Other" && !hasQuestionForm) return "create_complaint";

  return "unknown";
}

/* ----------------------------------------------------------------- analyse */

function analyze(text, { storedLanguage, requestedLanguage } = {}) {
  const switchTo = detectLanguageSwitch(text);
  const language = switchTo || resolveLanguage({ text, requested: requestedLanguage, stored: storedLanguage });
  const emergency = detectEmergency(text);
  const n = normalize(text);

  let intent = switchTo ? "language_switch" : emergency.critical ? "emergency" : detectIntent(text);

  const categoryInfo = classifyCategory(text);
  const tone = detectTone(text);
  const hasComplaintNoun = COMPLAINT_NOUN_EN.test(n) || anyIndic(n, COMPLAINT_NOUN_INDIC);

  return {
    intent,
    language,
    switchTo,
    emergency,
    injectionSuspected: looksLikeInjection(text),
    topic: intent === "civic_awareness" ? detectTopic(n) : null,
    category: categoryInfo.category,
    categoryConfident: categoryInfo.confident,
    severity: suggestSeverity(text, { emergency: emergency.critical }),
    sentiment: tone.sentiment,
    urgency: tone.urgency,
    hasComplaintNoun,
    wantsLatest: /\b(latest|last|recent|newest)\b.{0,15}\b(complaint|report)\b/.test(n),
  };
}

module.exports = {
  analyze,
  detectIntent,
  detectEmergency,
  detectLanguageSwitch,
  resolveLanguage,
  classifyCategory,
  suggestSeverity,
  detectTone,
  normalize,
};
