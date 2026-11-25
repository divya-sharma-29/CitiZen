"use strict";

const { buildFacts } = require("../services/civicDataService");

const NOW = new Date("2026-11-25T10:00:00.000Z");
const daysAgo = (n) => new Date(NOW.getTime() - n * 86400000);

const USER_A = "aaaaaaaaaaaaaaaaaaaaaaaa";
const USER_B = "bbbbbbbbbbbbbbbbbbbbbbbb";

function makeReport(overrides = {}) {
  return {
    _id: overrides._id || "r000000000000000000000001",
    userId: USER_A,
    title: "Pothole near college gate",
    category: "Road Damage",
    status: "Assigned",
    severity: "High",
    priorityScore: 80,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(4),
    resolvedAt: null,
    assignedAt: daysAgo(5),
    assignedTo: { name: "Ravi Kumar", department: "Roads" },
    assignmentHistory: [],
    ...overrides,
  };
}

// Fake data layer that enforces ownership exactly like the real one.
function makeFakeData(reports, calls = []) {
  return {
    async getUserReports(userId) {
      calls.push(["getUserReports", userId]);
      return reports.filter((r) => r.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
    },
    async getOwnedReport(userId, id) {
      calls.push(["getOwnedReport", userId, id]);
      return reports.find((r) => r._id === id && r.userId === userId) || null;
    },
    async getReportFacts(report, now) {
      return buildFacts(report, { message: "Status changed to Assigned", createdAt: report.updatedAt }, now);
    },
  };
}

const silent = { warn() {}, error() {}, log() {} };

module.exports = { NOW, daysAgo, USER_A, USER_B, makeReport, makeFakeData, silent };
