"use strict";

/** Deterministic, localised replies built only from verified report facts. */

const { t, label, formatDate, formatDateTime, daysText, ago } = require("./civicI18n");

function officerText(facts, lang) {
  if (!facts.officer) return t(lang, "officerNone", { status: label("status", lang, facts.status) });

  return t(lang, "officerAssigned", {
    officer: facts.officer.name,
    dept: facts.officer.department ? ` (${facts.officer.department})` : "",
    assignedAt: facts.assignedAt ? formatDate(facts.assignedAt, lang) : "—",
  });
}

function priorityText(facts, lang) {
  const p = facts.priority;
  const lines = [
    t(lang, "priorityLine", {
      score: p.score,
      severity: label("severity", lang, p.severity),
      category: label("category", lang, p.category),
    }),
  ];

  if (p.breakdownAvailable) {
    let parts = "";
    if (p.categoryBonus) parts += t(lang, "priorityPartCategory", { n: p.categoryBonus, category: label("category", lang, p.category) });
    if (p.severityBonus) {
      parts += t(lang, "priorityPartSeverity", {
        sign: p.severityBonus < 0 ? "−" : "+",
        n: Math.abs(p.severityBonus),
        severity: label("severity", lang, p.severity),
      });
    }
    lines.push(t(lang, "priorityBreakdown", { parts, score: p.score }));
  } else {
    lines.push(t(lang, "priorityNoBreakdown"));
  }

  return lines.join("\n");
}

function whyText(facts, lang, now) {
  if (!facts.isOpen) {
    return t(lang, "whyResolved", { on: facts.resolvedAt ? formatDate(facts.resolvedAt, lang) : label("status", lang, facts.status) });
  }

  const lines = [t(lang, "stage")[facts.status] || ""];
  lines.push(t(lang, "whyAge", { days: daysText(facts.daysOpen, lang) }));
  lines.push(
    facts.officer
      ? t(lang, "whyAssigned", { officer: facts.officer.name })
      : t(lang, "whyUnassigned")
  );
  lines.push(t(lang, "whyPriority", { score: facts.priorityScore, severity: label("severity", lang, facts.severity) }));
  if (facts.daysSinceUpdate >= 3) lines.push(t(lang, "whyStale", { days: daysText(facts.daysSinceUpdate, lang) }));
  lines.push(t(lang, "whyCannot"));
  lines.push(t(lang, "whyNext"));

  return lines.filter(Boolean).join("\n");
}

function buildTrackingReply({ intent, facts, lang, now = new Date(), sentiment = "neutral" }) {
  const lines = [];

  if (sentiment === "negative" && facts.isOpen) lines.push(t(lang, "empathy"));

  switch (intent) {
    case "officer_info":
      lines.push(officerText(facts, lang));
      break;

    case "last_update":
      lines.push(t(lang, "lastUpdate", {
        updated: formatDateTime(facts.updatedAt, lang),
        ago: ago(facts.updatedAt, now, lang),
      }));
      if (facts.lastActivity && facts.lastActivity.message) {
        lines.push(t(lang, "lastActivity", { activity: facts.lastActivity.message }));
      }
      break;

    case "pending_days":
      lines.push(
        facts.isOpen
          ? t(lang, "pendingOpen", { days: daysText(facts.daysOpen, lang), created: formatDate(facts.createdAt, lang) })
          : t(lang, "pendingResolved", {
              days: daysText(facts.daysToResolve ?? 0, lang),
              resolved: facts.resolvedAt ? formatDate(facts.resolvedAt, lang) : "—",
            })
      );
      break;

    case "escalation":
      lines.push(t(lang, "escalationNone"));
      lines.push(facts.reassignments ? t(lang, "reassigned", { n: facts.reassignments }) : t(lang, "noReassign"));
      lines.push(officerText(facts, lang));
      break;

    case "why_unresolved":
      lines.push(whyText(facts, lang, now));
      break;

    case "priority_explain":
      lines.push(priorityText(facts, lang));
      break;

    case "track_status":
    default:
      lines.push(t(lang, "statusLine", {
        title: facts.title,
        category: label("category", lang, facts.category),
        status: label("status", lang, facts.status),
        created: formatDate(facts.createdAt, lang),
        updated: formatDate(facts.updatedAt, lang),
      }));
      lines.push(officerText(facts, lang));
      break;
  }

  lines.push(t(lang, "asOf", { time: formatDateTime(now, lang) }));
  return lines.join("\n");
}

function buildListReply({ reports, lang, ask }) {
  const shown = reports.slice(0, 5);
  const lines = [t(lang, "listHeader", { n: reports.length })];

  shown.forEach((report, index) => {
    lines.push(t(lang, "listLine", {
      i: index + 1,
      title: String(report.title || "").slice(0, 60),
      status: label("status", lang, report.status),
      category: label("category", lang, report.category),
    }));
  });

  if (reports.length > shown.length) lines.push(t(lang, "listMore"));
  lines.push(ask ? t(lang, "askWhich") : t(lang, "listFooter"));
  return lines.join("\n");
}

module.exports = { buildTrackingReply, buildListReply };
