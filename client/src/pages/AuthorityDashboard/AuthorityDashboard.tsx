import { useEffect, useState } from "react";
import { apiUrl } from "../../lib/api";

interface Stats {
  assigned: number;
  inProgress: number;
  resolved: number;
  critical: number;
}

interface Report {
  _id: string;
  title: string;
  category: string;
  severity: string;
  priorityScore: number;
  status: string;
  location: string;
  resolutionNote?: string;
  description?: string;
  imageUrl?: string | null;
  imageUrls?: string[];
  createdAt?: string;
  assignedAt?: string | null;
  userId?: { name: string; email?: string } | string;
}

export default function AuthorityDashboard() {
  const [stats, setStats] =
    useState<Stats | null>(null);

  const [reports, setReports] =
    useState<Report[]>([]);

  const [resolutionNotes, setResolutionNotes] =
    useState<Record<string, string>>({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const token =
    localStorage.getItem("token");

  useEffect(() => {
    const controller = new AbortController();

    async function loadQueue() {
      if (!token) {
        setReportsError("Sign in as an approved authority to load assigned reports.");
        setReportsLoading(false);
        return;
      }

      setReportsLoading(true);
      setReportsError("");

      const query = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (search.trim()) query.set("search", search.trim());
      if (statusFilter !== "all") query.set("status", statusFilter);
      if (categoryFilter !== "all") query.set("category", categoryFilter);
      if (priorityFilter !== "all") query.set("priority", priorityFilter);

      try {
        const response = await fetch(
          apiUrl(`/api/authority/reports?${query}`),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load assigned reports.");
        }

        setReports(data.reports || []);
        setStats(data.counts);
        setTotalReports(data.pagination?.total || 0);
        setPages(Math.max(1, data.pagination?.pages || 1));
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }
        console.error("Authority report queue failed:", loadError);
        setReportsError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load assigned reports."
        );
      } finally {
        if (!controller.signal.aborted) setReportsLoading(false);
      }
    }

    void loadQueue();
    return () => controller.abort();
  }, [
    categoryFilter,
    page,
    priorityFilter,
    reloadKey,
    search,
    statusFilter,
    token,
  ]);

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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update report status.");
      }

      setReloadKey((key) => key + 1);
    } catch (error) {
      console.error(
        "Failed to update status:",
        error
      );
      setReportsError(
        error instanceof Error ? error.message : "Failed to update status."
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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to resolve report.");
      }

      setResolutionNotes((previous) => {
        const updated = {
          ...previous,
        };

        delete updated[reportId];

        return updated;
      });

      setReloadKey((key) => key + 1);
    } catch (error) {
      console.error(
        "Failed to resolve report:",
        error
      );
      setReportsError(
        error instanceof Error ? error.message : "Failed to resolve report."
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
                {totalReports} {totalReports === 1 ? "report" : "reports"}
              </div>

            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                placeholder="Search assigned reports"
                aria-label="Search assigned reports"
                className="min-w-0 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/40"
              />
              <select
                value={statusFilter}
                onChange={(event) => {
                  setPage(1);
                  setStatusFilter(event.target.value);
                }}
                aria-label="Filter by status"
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/40"
              >
                <option value="all">All statuses</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Under Review">Under Review</option>
                <option value="Reported">Reported</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(event) => {
                  setPage(1);
                  setCategoryFilter(event.target.value);
                }}
                aria-label="Filter by category"
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/40"
              >
                <option value="all">All categories</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Garbage">Garbage</option>
                <option value="Streetlight">Streetlight</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Drainage">Drainage</option>
                <option value="Other">Other</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(event) => {
                  setPage(1);
                  setPriorityFilter(event.target.value);
                }}
                aria-label="Filter by priority"
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/40"
              >
                <option value="all">All priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>

          </div>

          <div className="divide-y divide-white/5">

            {reportsError ? (
              <div role="alert" className="p-8 text-center">
                <p className="text-red-200">{reportsError}</p>
                <button
                  type="button"
                  onClick={() => setReloadKey((key) => key + 1)}
                  className="mt-3 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
                >
                  Retry
                </button>
              </div>
            ) : reportsLoading ? (
              <div className="p-8 text-center text-slate-400">
                Loading assigned reports…
              </div>
            ) : reports.length === 0 ? (

              <div className="p-8 text-center text-slate-400">
                {stats?.assigned === 0
                  ? "No reports have been assigned to you yet."
                  : "No reports match the selected filters."}
              </div>

            ) : (

              reports.map((report) => (

                <div
                  key={report._id}
                  className="p-5 space-y-5 hover:bg-white/2 transition"
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

                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                    {typeof report.userId === "object" && report.userId && (
                      <span>Reported by {report.userId.name}</span>
                    )}
                    {report.assignedAt && (
                      <span>Assigned {new Date(report.assignedAt).toLocaleDateString()}</span>
                    )}
                    {report.createdAt && (
                      <span>Submitted {new Date(report.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>

                  {(report.imageUrls?.length || report.imageUrl) && (
                    <div className="flex flex-wrap gap-3">
                      {(report.imageUrls?.length
                        ? report.imageUrls
                        : report.imageUrl
                          ? [report.imageUrl]
                          : []
                      ).map((imageUrl) => (
                        <img
                          key={imageUrl}
                          src={apiUrl(imageUrl)}
                          alt={`Evidence for ${report.title}`}
                          className="h-24 w-32 rounded-lg border border-white/10 object-cover"
                        />
                      ))}
                    </div>
                  )}

                  {/* =========================
                      CONTROLS
                  ========================= */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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

          {pages > 1 && !reportsError && (
            <div className="flex items-center justify-between border-t border-white/5 px-5 py-4 text-sm">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || reportsLoading}
                className="rounded-lg border border-white/10 px-3 py-2 text-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-slate-400">Page {page} of {pages}</span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pages, current + 1))}
                disabled={page >= pages || reportsLoading}
                className="rounded-lg border border-white/10 px-3 py-2 text-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}

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