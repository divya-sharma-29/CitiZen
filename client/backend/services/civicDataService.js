"use strict";

/**
 * Read-only, user-scoped data access for the assistant.
 * EVERY query filters on the authenticated user's id, so one citizen can never
 * receive another citizen's complaint data through the assistant.
 */

const mongoose = require("mongoose");
const Report = require("../models/Report");
const ReportActivity = require("../models/ReportActivity");

const DAY_MS = 86400000;
const OPEN_STATUSES = ["Reported", "Under Review", "Assigned", "In Progress"];

// Mirrors calculatePriorityScore() in server.js so priority can be explained exactly.
const CATEGORY_BONUS = { "Road Damage": 10, "Water Leakage": 15, Drainage: 15, Streetlight: 5, Garbage: 5 };
const SEVERITY_BONUS = { Low: -15, Medium: 0, High: 20, Critical: 35 };

function computePriority(category, severity) {
  const score = 50 + (CATEGORY_BONUS[category] || 0) + (SEVERITY_BONUS[severity] || 0);
  return Math.min(Math.max(score, 0), 100);
}

function explainPriority(report) {
  const categoryBonus = CATEGORY_BONUS[report.category] || 0;
  const severityBonus = SEVERITY_BONUS[report.severity] || 0;
  const computed = computePriority(report.category, report.severity);

  return {
    score: report.priorityScore,
    severity: report.severity,
    category: report.category,
    categoryBonus,
    severityBonus,
    // Only show a breakdown when it reproduces the stored score exactly.
    breakdownAvailable: computed === report.priorityScore,
  };
}

function wholeDays(from, to) {
  return Math.max(0, Math.floor((new Date(to) - new Date(from)) / DAY_MS));
}

// Pure: turns a report document (+ latest activity) into the facts the assistant may state.
function buildFacts(report, lastActivity, now = new Date()) {
  const isOpen = OPEN_STATUSES.includes(report.status);
  const officer = report.assignedTo && report.assignedTo.name
    ? { name: report.assignedTo.name, department: report.assignedTo.department || null }
    : null;

  const history = Array.isArray(report.assignmentHistory) ? report.assignmentHistory : [];

  return {
    id: String(report._id),
    title: String(report.title || "").slice(0, 80),
    category: report.category,
    status: report.status,
    severity: report.severity,
    priorityScore: report.priorityScore,
    isOpen,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    resolvedAt: report.resolvedAt || null,
    assignedAt: report.assignedAt || null,
    daysOpen: isOpen ? wholeDays(report.createdAt, now) : null,
    daysToResolve: !isOpen && report.resolvedAt ? wholeDays(report.createdAt, report.resolvedAt) : null,
    daysSinceUpdate: wholeDays(report.updatedAt, now),
    officer,
    reassignments: history.filter((entry) => entry.action === "REASSIGNED").length,
    lastActivity: lastActivity
      ? { message: String(lastActivity.message || "").slice(0, 160), at: lastActivity.createdAt }
      : null,
    priority: explainPriority(report),
  };
}

const LIST_FIELDS =
  "title category status severity priorityScore createdAt updatedAt resolvedAt assignedAt assignedTo assignmentHistory";

async function getUserReports(userId, { limit = 25 } = {}) {
  return Report.find({ userId })
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 50))
    .select(LIST_FIELDS)
    .populate("assignedTo", "name department")
    .lean();
}

async function getOwnedReport(userId, reportId) {
  if (!mongoose.isValidObjectId(reportId)) return null;

  return Report.findOne({ _id: reportId, userId })
    .select(LIST_FIELDS)
    .populate("assignedTo", "name department")
    .lean();
}

async function getReportFacts(report, now = new Date()) {
  const lastActivity = await ReportActivity.findOne({ reportId: report._id })
    .sort({ createdAt: -1 })
    .select("message createdAt")
    .lean();

  return buildFacts(report, lastActivity, now);
}

module.exports = {
  OPEN_STATUSES,
  computePriority,
  explainPriority,
  buildFacts,
  getUserReports,
  getOwnedReport,
  getReportFacts,
};
