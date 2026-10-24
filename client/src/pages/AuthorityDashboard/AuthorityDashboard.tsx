import { useEffect, useState } from "react";

interface Stats {
  assigned: number;
  inProgress: number;
  resolved: number;
  critical: number;
}

interface Authority {
  _id: string;
  name: string;
}

interface Report {
  _id: string;
  title: string;
  category: string;
  severity: string;
  priorityScore: number;
  status: string;
  location: string;
  authorityId?: string;
  resolutionNote?: string;
}

export default function AuthorityDashboard() {
  const [stats, setStats] =
    useState<Stats | null>(null);

  const [reports, setReports] =
    useState<Report[]>([]);

  const [authorities, setAuthorities] =
    useState<Authority[]>([]);

  const [resolutionNotes, setResolutionNotes] =
    useState<Record<string, string>>({});

  const token =
    localStorage.getItem("token");

  useEffect(() => {
    loadDashboard();
    loadReports();
    loadAuthorities();
  }, []);

  // =========================
  // LOAD DASHBOARD STATS
  // =========================

  const loadDashboard = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/authority/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setStats(await response.json());
      }
    } catch (error) {
      console.error(
        "Failed to load dashboard:",
        error
      );
    }
  };

  // =========================
  // LOAD REPORTS
  // =========================

  const loadReports = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/authority/reports",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        setReports(data.reports || []);
      }
    } catch (error) {
      console.error(
        "Failed to load reports:",
        error
      );
    }
  };

  // =========================
  // LOAD AUTHORITIES
  // =========================

  const loadAuthorities = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/users/authorities",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        setAuthorities(
          data.authorities || data || []
        );
      }
    } catch (error) {
      console.error(
        "Failed to load authorities:",
        error
      );
    }
  };

  // =========================
  // ASSIGN REPORT
  // =========================

  const assignReport = async (
    reportId: string,
    authorityId: string
  ) => {
    if (!authorityId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/reports/${reportId}/assign`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            authorityId,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to assign report"
        );
        return;
      }

      await loadReports();
      await loadDashboard();
    } catch (error) {
      console.error(
        "Failed to assign report:",
        error
      );
    }
  };

  // =========================
  // UPDATE REPORT STATUS
  // =========================

  const updateStatus = async (
    reportId: string,
    status: string
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reports/${reportId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to update report status"
        );
        return;
      }

      await loadReports();
      await loadDashboard();
    } catch (error) {
      console.error(
        "Failed to update status:",
        error
      );
    }
  };

  // =========================
  // RESOLVE REPORT
  // =========================

  const resolveReport = async (
    reportId: string
  ) => {
    const resolutionNote =
      resolutionNotes[reportId]?.trim();

    if (!resolutionNote) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/reports/${reportId}/resolve`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            resolutionNote,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to resolve report"
        );
        return;
      }

      setResolutionNotes((previous) => {
        const updated = {
          ...previous,
        };

        delete updated[reportId];

        return updated;
      });

      await loadReports();
      await loadDashboard();
    } catch (error) {
      console.error(
        "Failed to resolve report:",
        error
      );
    }
  };

  // =========================
  // SEVERITY STYLING
  // =========================

  const severityClass = (
    severity: string
  ) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500/20 text-red-400";

      case "High":
        return "bg-orange-500/20 text-orange-400";

      case "Medium":
        return "bg-yellow-500/20 text-yellow-400";

      case "Low":
        return "bg-green-500/20 text-green-400";

      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  // =========================
  // STATUS STYLING
  // =========================

  const statusClass = (
    status: string
  ) => {
    switch (status) {
      case "Resolved":
        return "bg-green-500/20 text-green-400";

      case "In Progress":
        return "bg-blue-500/20 text-blue-400";

      case "Assigned":
        return "bg-purple-500/20 text-purple-400";

      case "Under Review":
        return "bg-yellow-500/20 text-yellow-400";

      case "Reported":
        return "bg-slate-500/20 text-slate-300";

      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      <div className="max-w-7xl mx-auto">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            Authority Command Center
          </h1>

          <p className="text-slate-400 mt-2">
            Monitor and resolve civic issues.
          </p>

        </div>

        {/* =========================
            STATS
        ========================= */}

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

            <Stat
              label="Assigned"
              value={stats.assigned}
            />

            <Stat
              label="In Progress"
              value={stats.inProgress}
            />

            <Stat
              label="Resolved"
              value={stats.resolved}
            />

            <Stat
              label="Critical"
              value={stats.critical}
            />

          </div>
        )}

        {/* =========================
            PRIORITY QUEUE
        ========================= */}

        <div className="mt-8 bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">

          <div className="p-5 border-b border-white/10">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

              <div>
                <h2 className="text-xl font-semibold">
                  Priority Queue
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Manage assignments, status and resolutions.
                </p>
              </div>

              <div className="text-sm text-slate-400">
                {reports.length}{" "}
                {reports.length === 1
                  ? "report"
                  : "reports"}
              </div>

            </div>

          </div>

          <div className="divide-y divide-white/5">

            {reports.length === 0 ? (

              <div className="p-8 text-center text-slate-400">
                No reports found.
              </div>

            ) : (

              reports.map((report) => (

                <div
                  key={report._id}
                  className="p-5 space-y-5 hover:bg-white/[0.02] transition"
                >

                  {/* =========================
                      REPORT INFORMATION
                  ========================= */}

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                    <div>

                      <h3 className="font-semibold text-lg">
                        {report.title}
                      </h3>

                      <p className="text-sm text-slate-400 mt-1">
                        {report.category} •{" "}
                        {report.location}
                      </p>

                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                      {/* SEVERITY */}

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${severityClass(
                          report.severity
                        )}`}
                      >
                        {report.severity || "Unknown"}
                      </span>

                      {/* PRIORITY SCORE */}

                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                        Priority:{" "}
                        {report.priorityScore ?? 0}
                      </span>

                      {/* STATUS BADGE */}

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>

                    </div>

                  </div>

                  {/* =========================
                      CONTROLS
                  ========================= */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* ASSIGN AUTHORITY */}

                    <div>

                      <label className="block text-sm text-slate-400 mb-2">
                        Assign Authority
                      </label>

                      <select
                        value={
                          report.authorityId || ""
                        }
                        onChange={(e) =>
                          assignReport(
                            report._id,
                            e.target.value
                          )
                        }
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      >

                        <option value="">
                          Select authority
                        </option>

                        {authorities.map(
                          (authority) => (

                            <option
                              key={authority._id}
                              value={authority._id}
                            >
                              {authority.name}
                            </option>

                          )
                        )}

                      </select>

                    </div>

                    {/* STATUS */}

                    <div>

                      <label className="block text-sm text-slate-400 mb-2">
                        Report Status
                      </label>

                      <select
                        value={report.status}
                        onChange={(e) =>
                          updateStatus(
                            report._id,
                            e.target.value
                          )
                        }
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      >

                        <option value="Reported">
                          Reported
                        </option>

                        <option value="Under Review">
                          Under Review
                        </option>

                        <option value="Assigned">
                          Assigned
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="Resolved">
                          Resolved
                        </option>

                      </select>

                    </div>

                  </div>

                  {/* =========================
                      CURRENT STATUS
                  ========================= */}

                  <div className="flex items-center gap-2">

                    <span className="text-sm text-slate-400">
                      Current status:
                    </span>

                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-md ${statusClass(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>

                  </div>

                  {/* =========================
                      RESOLUTION
                  ========================= */}

                  <div className="border-t border-white/5 pt-4">

                    <label className="block text-sm text-slate-400 mb-2">
                      Resolution Note
                    </label>

                    {report.resolutionNote ? (

                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">

                        <div className="flex items-center gap-2">

                          <div className="w-2 h-2 rounded-full bg-green-400" />

                          <h4 className="font-semibold text-green-400">
                            Resolution
                          </h4>

                        </div>

                        <p className="text-slate-300 mt-2">
                          {report.resolutionNote}
                        </p>

                      </div>

                    ) : (

                      <div className="flex flex-col sm:flex-row gap-3">

                        <textarea
                          value={
                            resolutionNotes[
                              report._id
                            ] || ""
                          }
                          onChange={(e) =>
                            setResolutionNotes(
                              (previous) => ({
                                ...previous,
                                [report._id]:
                                  e.target.value,
                              })
                            )
                          }
                          placeholder="Enter resolution details..."
                          rows={3}
                          className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            resolveReport(
                              report._id
                            )
                          }
                          disabled={
                            !resolutionNotes[
                              report._id
                            ]?.trim()
                          }
                          className="sm:self-end bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 px-5 py-2 rounded-lg font-medium transition-colors"
                        >
                          Resolve
                        </button>

                      </div>

                    )}

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

// =========================
// STAT CARD
// =========================

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (

    <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">

      <p className="text-slate-400">
        {label}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

    </div>

  );
}