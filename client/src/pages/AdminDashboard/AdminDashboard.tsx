import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../../lib/api";

interface Stats {
  totalUsers: number;
  totalAuthorities: number;
  totalReports: number;
  resolvedReports: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  authorityStatus?: string;
  department?: string | null;
  isActive?: boolean;
  deletedAt?: string | null;
  deletedBy?: { name: string; role: string } | null;
}

interface AdminAuditLog {
  _id: string;
  action: string;
  summary: string;
  createdAt: string;
  actorId?: { name: string; role: string } | null;
  targetUserId?: { name: string; role: string } | null;
  targetReportId?: { title: string } | null;
}

interface AssignmentActor {
  _id: string;
  name: string;
  role?: string;
  department?: string | null;
}

interface AdminReport {
  _id: string;
  title: string;
  category: string;
  status: string;
  severity: string;
  priorityScore: number;
  location: string;
  createdAt: string;
  assignedAt?: string | null;
  userId?: { name: string; email: string } | string;
  assignedTo?: AssignmentActor | null;
  assignedBy?: AssignmentActor | null;
  assignmentHistory?: {
    assignedAt: string;
    assignedTo: AssignmentActor;
    assignedBy: AssignmentActor;
    previousAuthority?: AssignmentActor | null;
  }[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [authorities, setAuthorities] = useState<User[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [creatingAuthority, setCreatingAuthority] = useState(false);
  const [updatingAuthorityId, setUpdatingAuthorityId] = useState("");
  const [assigningReportId, setAssigningReportId] = useState("");
  const [userActionId, setUserActionId] = useState("");
  const [removalTarget, setRemovalTarget] = useState<User | null>(null);
  const [removalImpactCount, setRemovalImpactCount] = useState(0);
  const [removalImpactLoading, setRemovalImpactLoading] = useState(false);
  const [removalDisposition, setRemovalDisposition] = useState("");
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [auditError, setAuditError] = useState("");
  const [auditLoading, setAuditLoading] = useState(true);

  const [error, setError] = useState("");
  const [reportsError, setReportsError] = useState("");
  const [success, setSuccess] = useState("");

  // Authority form
  const [showAuthorityForm, setShowAuthorityForm] = useState(false);

  const [authorityName, setAuthorityName] = useState("");
  const [authorityEmail, setAuthorityEmail] = useState("");
  const [authorityPassword, setAuthorityPassword] = useState("");

  // User search/filter
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [reportSearch, setReportSearch] = useState("");
  const [reportStatus, setReportStatus] = useState("all");
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [reportPage, setReportPage] = useState(1);
  const [reportPages, setReportPages] = useState(1);

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  // ==========================================
  // LOAD ADMIN DATA
  // ==========================================

  const loadAdminData = useCallback(async () => {
    try {
      const response = await fetch(
        apiUrl("/api/admin/dashboard"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate("/dashboard");
          return;
        }

        setError(
          data.message || "Failed to load admin dashboard."
        );

        return;
      }

      setStats(data.stats);

      const authorityResponse = await fetch(
        apiUrl("/api/admin/authorities"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const authorityData = await authorityResponse.json();
      if (authorityResponse.ok) {
        setAuthorities(
          (authorityData.authorities || []).filter(
            (authority: User) =>
              authority.isActive && authority.authorityStatus === "approved"
          )
        );
      }
    } catch (error) {
      console.error(error);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");
    const query = new URLSearchParams({
      page: String(userPage),
      limit: "20",
      search: search.trim(),
      role: roleFilter,
      status: userStatusFilter,
    });

    try {
      const response = await fetch(apiUrl(`/api/admin/users?${query}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to load users.");
      }
      setUsers(data.users || []);
      setUserPages(Math.max(1, data.pagination?.pages || 1));
    } catch (loadError) {
      console.error("Admin user list failed:", loadError);
      setUsersError(
        loadError instanceof Error ? loadError.message : "Unable to load users."
      );
    } finally {
      setUsersLoading(false);
    }
  }, [roleFilter, search, token, userPage, userStatusFilter]);

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    setAuditError("");
    try {
      const response = await fetch(apiUrl("/api/admin/audit-logs?limit=20"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to load audit history.");
      }
      setAuditLogs(data.logs || []);
    } catch (loadError) {
      console.error("Admin audit history failed:", loadError);
      setAuditError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load audit history."
      );
    } finally {
      setAuditLoading(false);
    }
  }, [token]);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    setReportsError("");

    const query = new URLSearchParams({
      page: String(reportPage),
      limit: "10",
    });
    if (reportSearch.trim()) query.set("search", reportSearch.trim());
    if (reportStatus !== "all") query.set("status", reportStatus);
    if (unassignedOnly) query.set("unassigned", "true");

    try {
      const response = await fetch(
        apiUrl(`/api/admin/reports?${query}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load reports.");
      }

      setReports(data.reports || []);
      setReportPages(Math.max(1, data.pagination?.pages || 1));
    } catch (loadError) {
      console.error("Admin report list failed:", loadError);
      setReportsError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load reports."
      );
    } finally {
      setReportsLoading(false);
    }
  }, [reportPage, reportSearch, reportStatus, token, unassignedOnly]);

  const assignReport = async (reportId: string, authorityId: string) => {
    if (!authorityId) return;

    setAssigningReportId(reportId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        apiUrl(`/api/reports/${reportId}/assign`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ authorityId }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to assign report.");
      }

      setSuccess(data.message || "Report assigned successfully.");
      await loadReports();
    } catch (assignmentError) {
      console.error("Report assignment failed:", assignmentError);
      setError(
        assignmentError instanceof Error
          ? assignmentError.message
          : "Unable to assign report."
      );
    } finally {
      setAssigningReportId("");
    }
  };

  const updateUserStatus = async (user: User, isActive: boolean) => {
    setUserActionId(user._id);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(apiUrl(`/api/admin/users/${user._id}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to update account status.");
      setSuccess(data.message);
      await Promise.all([loadUsers(), loadAuditLogs()]);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update account status.");
    } finally {
      setUserActionId("");
    }
  };

  const confirmRemoveUser = async () => {
    if (!removalTarget) return;
    if (
      removalTarget.role === "authority" &&
      removalImpactCount > 0 &&
      !removalDisposition
    ) {
      setError("Choose how to handle the authority's active assigned reports.");
      return;
    }

    setUserActionId(removalTarget._id);
    setError("");
    setSuccess("");
    try {
      const requestBody: {
        leaveUnassigned?: boolean;
        reassignAuthorityId?: string;
      } = {};
      if (removalDisposition === "leave-unassigned") {
        requestBody.leaveUnassigned = true;
      } else if (removalDisposition) {
        requestBody.reassignAuthorityId = removalDisposition;
      }

      const response = await fetch(apiUrl(`/api/admin/users/${removalTarget._id}`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to remove account.");

      setSuccess(data.message);
      setRemovalTarget(null);
      await Promise.all([loadUsers(), loadAuditLogs()]);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to remove account.");
    } finally {
      setUserActionId("");
    }
  };

  const restoreUser = async (user: User) => {
    setUserActionId(user._id);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(apiUrl(`/api/admin/users/${user._id}/restore`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to restore account.");
      setSuccess(data.message);
      await Promise.all([loadUsers(), loadAuditLogs()]);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to restore account.");
    } finally {
      setUserActionId("");
    }
  };

  // ==========================================
  // ADMIN AUTH CHECK
  // ==========================================

  useEffect(() => {
    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "admin") {
        navigate("/dashboard");
        return;
      }

      const loadTimer = window.setTimeout(() => {
        void loadAdminData();
      }, 0);
      return () => window.clearTimeout(loadTimer);
    } catch (error) {
      console.error(error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [loadAdminData, navigate, storedUser, token]);

  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(() => void loadUsers(), 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers, token]);

  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(() => void loadAuditLogs(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAuditLogs, token]);

  useEffect(() => {
    if (!removalTarget || removalTarget.role !== "authority") return;
    const controller = new AbortController();

    fetch(apiUrl(`/api/admin/users/${removalTarget._id}/impact`), {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to check assigned reports.");
        }
        setRemovalImpactCount(data.activeAssignedReports || 0);
      })
      .catch((impactError: unknown) => {
        if (impactError instanceof DOMException && impactError.name === "AbortError") return;
        setUsersError(
          impactError instanceof Error
            ? impactError.message
            : "Unable to check assigned reports."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setRemovalImpactLoading(false);
      });

    return () => controller.abort();
  }, [removalTarget, token]);

  useEffect(() => {
    if (!token) return;

    const timer = window.setTimeout(() => {
      void loadReports();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadReports, token]);

  // ==========================================
  // CREATE AUTHORITY
  // ==========================================

  const createAuthority = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!authorityName.trim()) {
      setError("Authority name is required.");
      return;
    }

    if (!authorityEmail.trim()) {
      setError("Authority email is required.");
      return;
    }

    if (authorityPassword.length < 8) {
      setError(
        "Authority password must be at least 8 characters."
      );
      return;
    }

    try {
      setCreatingAuthority(true);

      const response = await fetch(
        apiUrl("/api/admin/authorities"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: authorityName,
            email: authorityEmail,
            password: authorityPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to create authority."
        );
        return;
      }

      setSuccess("Authority created successfully.");

      setAuthorityName("");
      setAuthorityEmail("");
      setAuthorityPassword("");

      setShowAuthorityForm(false);

      await loadAdminData();
    } catch (error) {
      console.error(error);
      setError("Unable to create authority.");
    } finally {
      setCreatingAuthority(false);
    }
  };

  const updateAuthorityStatus = async (
    userId: string,
    authorityStatus: "approved" | "rejected"
  ) => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        apiUrl(`/api/admin/authorities/${userId}/status`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ authorityStatus }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        const message =
          response.status === 404
            ? "The authority approval API was not found. Restart the backend or deploy the latest server code, then try again."
            : data.message || "Unable to update authority access.";
        throw new Error(message);
      }

      setUsers((current) =>
        current.map((user) =>
          user._id === userId
            ? { ...user, authorityStatus }
            : user
        )
      );
      setSuccess(data.message);
    } catch (statusError) {
      console.error("Authority approval update failed:", statusError);
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update authority access."
      );
    } finally {
      setUpdatingAuthorityId("");
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ==========================================
  // FILTER USERS
  // ==========================================

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      user.email
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-slate-400">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ============================= */}
      {/* HEADER */}
      {/* ============================= */}

      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">

        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                🛡️
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  CitiZen Admin
                </h1>

                <p className="text-xs text-slate-500">
                  Administration Panel
                </p>
              </div>

            </div>

            <p className="text-slate-400 mt-3">
              Manage users, authorities and civic reports.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition"
            >
              ← Dashboard
            </Link>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
            >
              Logout
            </button>

          </div>

        </div>

      </header>

      {/* ============================= */}
      {/* MAIN */}
      {/* ============================= */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 flex items-center justify-between">

            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="text-red-300 hover:text-white"
            >
              ✕
            </button>

          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3 flex items-center justify-between">

            <span>{success}</span>

            <button
              onClick={() => setSuccess("")}
              className="text-emerald-300 hover:text-white"
            >
              ✕
            </button>

          </div>
        )}

        {/* ============================= */}
        {/* STATS */}
        {/* ============================= */}

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <Stat
              label="Total Citizens"
              value={stats.totalUsers}
              icon="👥"
            />

            <Stat
              label="Authorities"
              value={stats.totalAuthorities}
              icon="🛡️"
            />

            <Stat
              label="Total Reports"
              value={stats.totalReports}
              icon="📋"
            />

            <Stat
              label="Resolved Reports"
              value={stats.resolvedReports}
              icon="✅"
            />

          </div>
        )}

        {/* ============================= */}
        {/* MANAGEMENT */}
        {/* ============================= */}

        <div className="grid md:grid-cols-3 gap-5 mt-8">

          <button
            onClick={() =>
              setShowAuthorityForm(!showAuthorityForm)
            }
            className="text-left bg-slate-900 border border-white/10 rounded-2xl p-6 hover:border-blue-500/40 hover:bg-slate-900/80 transition"
          >

            <div className="text-3xl">
              🛡️
            </div>

            <h3 className="text-lg font-semibold mt-4">
              Authority Management
            </h3>

            <p className="text-slate-400 text-sm mt-2">
              Create and manage civic authorities.
            </p>

            <p className="text-blue-400 text-sm mt-4">
              {showAuthorityForm
                ? "Close form ↑"
                : "Create authority →"}
            </p>

          </button>

          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">

            <div className="text-3xl">
              👥
            </div>

            <h3 className="text-lg font-semibold mt-4">
              User Management
            </h3>

            <p className="text-slate-400 text-sm mt-2">
              Search and inspect registered users.
            </p>

            <p className="text-blue-400 text-sm mt-4">
              {users.length} users
            </p>

          </div>

          <a
            href="#report-management"
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 hover:border-blue-500/40 hover:bg-slate-900/80 transition"
          >

            <div className="text-3xl">
              📋
            </div>

            <h3 className="text-lg font-semibold mt-4">
              Report Management
            </h3>

            <p className="text-slate-400 text-sm mt-2">
              Monitor civic reports and their status.
            </p>

            <p className="text-blue-400 text-sm mt-4">
              View reports →
            </p>

          </a>

        </div>

        <section
          id="report-management"
          className="mt-8 scroll-mt-24 rounded-2xl border border-white/10 bg-slate-900/70"
        >
          <div className="border-b border-white/10 p-5">
            <h2 className="text-xl font-semibold">Report assignments</h2>
            <p className="mt-1 text-sm text-slate-400">
              Assign unassigned reports or transfer active work to another approved authority.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_190px_auto_auto]">
              <input
                type="search"
                value={reportSearch}
                onChange={(event) => {
                  setReportPage(1);
                  setReportSearch(event.target.value);
                }}
                placeholder="Search title, location or category"
                aria-label="Search reports"
                className="min-w-0 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-300/40"
              />
              <select
                value={reportStatus}
                onChange={(event) => {
                  setReportPage(1);
                  setReportStatus(event.target.value);
                }}
                aria-label="Filter reports by status"
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-300/40"
              >
                <option value="all">All statuses</option>
                <option value="Reported">Reported</option>
                <option value="Under Review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={unassignedOnly}
                  onChange={(event) => {
                    setReportPage(1);
                    setUnassignedOnly(event.target.checked);
                  }}
                  className="accent-cyan-400"
                />
                Unassigned only
              </label>
              <button
                type="button"
                onClick={() => void loadReports()}
                disabled={reportsLoading}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5 disabled:opacity-50"
              >
                {reportsLoading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </div>

          {reportsError ? (
            <div role="alert" className="m-5 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">
              <p>{reportsError}</p>
              <button
                type="button"
                onClick={() => void loadReports()}
                className="mt-3 font-semibold text-red-100 underline underline-offset-4"
              >
                Retry
              </button>
            </div>
          ) : reportsLoading ? (
            <p className="p-8 text-center text-sm text-slate-400">Loading reports…</p>
          ) : reports.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-400">
              No reports match these filters.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {reports.map((report) => {
                const reporterName =
                  typeof report.userId === "object"
                    ? report.userId.name
                    : "Citizen";

                return (
                  <article key={report._id} className="space-y-4 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white">{report.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {report.category} · {report.location}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Submitted by {reporterName} · {report.status} · {report.severity} · Priority {report.priorityScore}
                        </p>
                      </div>

                      <div className="flex w-full flex-col gap-2 lg:max-w-sm">
                        <label htmlFor={`assign-${report._id}`} className="text-xs font-medium text-slate-400">
                          {report.assignedTo ? "Reassign authority" : "Assign authority"}
                        </label>
                        <select
                          id={`assign-${report._id}`}
                          value={report.assignedTo?._id || ""}
                          onChange={(event) => void assignReport(report._id, event.target.value)}
                          disabled={
                            authorities.length === 0 ||
                            assigningReportId === report._id
                          }
                          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-300/40 disabled:opacity-50"
                        >
                          <option value="" disabled>
                            {authorities.length
                              ? "Select an approved authority"
                              : "No active approved authorities"}
                          </option>
                          {authorities.map((authority) => (
                            <option key={authority._id} value={authority._id}>
                              {authority.name}{authority.department ? ` · ${authority.department}` : ""}
                            </option>
                          ))}
                        </select>
                        {report.assignedTo && (
                          <p className="text-xs text-slate-500">
                            Currently assigned to {report.assignedTo.name}
                            {report.assignedAt
                              ? ` · ${new Date(report.assignedAt).toLocaleString()}`
                              : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    {report.assignmentHistory?.length ? (
                      <details className="text-sm text-slate-400">
                        <summary className="w-fit cursor-pointer hover:text-white">
                          Assignment history ({report.assignmentHistory.length})
                        </summary>
                        <ol className="mt-3 space-y-2 border-l border-white/10 pl-4">
                          {report.assignmentHistory.map((assignment, index) => (
                            <li key={`${report._id}-assignment-${index}`}>
                              {assignment.assignedTo?.name || "Authority"} assigned by {assignment.assignedBy?.name || "Admin"}
                              {assignment.assignedAt
                                ? ` · ${new Date(assignment.assignedAt).toLocaleString()}`
                                : ""}
                              {assignment.previousAuthority?.name
                                ? ` · Reassigned from ${assignment.previousAuthority.name}`
                                : ""}
                            </li>
                          ))}
                        </ol>
                      </details>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}

          {!reportsError && reportPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 text-sm">
              <button
                type="button"
                onClick={() => setReportPage((page) => Math.max(1, page - 1))}
                disabled={reportPage <= 1 || reportsLoading}
                className="rounded-lg border border-white/10 px-3 py-2 text-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-slate-400">Page {reportPage} of {reportPages}</span>
              <button
                type="button"
                onClick={() => setReportPage((page) => Math.min(reportPages, page + 1))}
                disabled={reportPage >= reportPages || reportsLoading}
                className="rounded-lg border border-white/10 px-3 py-2 text-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>

        {/* ============================= */}
        {/* CREATE AUTHORITY */}
        {/* ============================= */}

        {showAuthorityForm && (
          <div className="mt-8 bg-slate-900 border border-blue-500/20 rounded-2xl p-6">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-xl font-semibold">
                  Create Authority
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Add an official who can handle civic reports.
                </p>
              </div>

              <span className="text-2xl">
                🛡️
              </span>

            </div>

            <form
              onSubmit={createAuthority}
              className="grid md:grid-cols-3 gap-4"
            >

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Name
                </label>

                <input
                  type="text"
                  value={authorityName}
                  onChange={(e) =>
                    setAuthorityName(e.target.value)
                  }
                  placeholder="Authority name"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={authorityEmail}
                  onChange={(e) =>
                    setAuthorityEmail(e.target.value)
                  }
                  placeholder="authority@example.com"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Temporary Password
                </label>

                <input
                  type="password"
                  value={authorityPassword}
                  onChange={(e) =>
                    setAuthorityPassword(e.target.value)
                  }
                  placeholder="Minimum 8 characters"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">

                <button
                  type="submit"
                  disabled={creatingAuthority}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition font-medium"
                >
                  {creatingAuthority
                    ? "Creating..."
                    : "Create Authority"}
                </button>

              </div>

            </form>

          </div>
        )}

        {/* ============================= */}
        {/* USERS */}
        {/* ============================= */}

        <div className="mt-8 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">

          <div className="p-5 border-b border-white/10">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <h2 className="text-xl font-semibold">
                  Registered Users
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Search and filter CitiZen users.
                </p>

              </div>

              <button
                onClick={loadAdminData}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition"
              >
                ↻ Refresh
              </button>

            </div>

            {/* SEARCH */}

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_170px_170px]">

              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setUserPage(1);
                  setSearch(e.target.value);
                }}
                className="min-w-0 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />

              <select
                value={roleFilter}
                onChange={(e) => {
                  setUserPage(1);
                  setRoleFilter(e.target.value);
                }}
                className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              >

                <option value="all">
                  All Roles
                </option>

                <option value="citizen">
                  Citizens
                </option>

                <option value="authority">
                  Authorities
                </option>

                <option value="admin">
                  Admins
                </option>

              </select>

              <select
                value={userStatusFilter}
                onChange={(event) => {
                  setUserPage(1);
                  setUserStatusFilter(event.target.value);
                }}
                aria-label="Filter users by account status"
                className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="all">All account statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="removed">Removed</option>
              </select>

            </div>

          </div>

          {/* USER LIST */}

          {usersError && (
            <div role="alert" className="m-5 rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-100">
              <p>{usersError}</p>
              <button type="button" onClick={() => void loadUsers()} className="mt-3 font-semibold underline underline-offset-4">
                Retry
              </button>
            </div>
          )}

          <div className="divide-y divide-white/5">

            {usersLoading ? (
              <p className="p-8 text-center text-sm text-slate-400">Loading users…</p>
            ) : filteredUsers.length === 0 ? (

              <div className="p-10 text-center">

                <div className="text-4xl mb-3">
                  🔍
                </div>

                <p className="text-slate-400">
                  No matching users found.
                </p>

              </div>

            ) : (

              filteredUsers.map((user) => (

                <div
                  key={user._id}
                  className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-white/2 transition"
                >

                  <div className="flex items-center gap-4">

                    <div className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg">
                      {user.role === "authority"
                        ? "🛡️"
                        : user.role === "admin"
                        ? "👑"
                        : "👤"}
                    </div>

                    <div>

                      <h3 className="font-semibold">
                        {user.name}
                      </h3>

                      <p className="text-sm text-slate-400">
                        {user.email}
                      </p>
                      {user.role === "authority" && (
                        <p className="mt-1 text-xs text-slate-500">
                          {user.department || "Department not set"} · Access:{" "}
                          {user.authorityStatus || "pending"}
                        </p>
                      )}
                    </div>

                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <RoleBadge role={user.role} />
                    <span className={`rounded-full border px-3 py-1 text-xs ${user.deletedAt ? "border-red-300/20 bg-red-300/5 text-red-200" : user.isActive === false ? "border-amber-300/20 bg-amber-300/5 text-amber-200" : "border-emerald-300/20 bg-emerald-300/5 text-emerald-200"}`}>
                      {user.deletedAt ? "Removed" : user.isActive === false ? "Suspended" : "Active"}
                    </span>
                    {user.role === "authority" &&
                      user.authorityStatus !== "approved" && (
                        <button
                          type="button"
                          disabled={updatingAuthorityId === user._id}
                          onClick={() => {
                            setUpdatingAuthorityId(user._id);
                            void updateAuthorityStatus(user._id, "approved");
                          }}
                          className="rounded-lg border border-emerald-300/20 bg-emerald-300/5 px-3 py-2 text-xs font-medium text-emerald-200 transition hover:bg-emerald-300/10 disabled:opacity-50"
                        >
                          {updatingAuthorityId === user._id
                            ? "Approving…"
                            : "Approve sign-in"}
                        </button>
                      )}
                    {user.role !== "admin" && (user.deletedAt ? (
                      <button
                        type="button"
                        onClick={() => void restoreUser(user)}
                        disabled={userActionId === user._id}
                        className="rounded-lg border border-cyan-300/20 px-3 py-2 text-xs font-medium text-cyan-100 hover:bg-cyan-300/10 disabled:opacity-50"
                      >
                        {userActionId === user._id ? "Restoring…" : "Restore"}
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => void updateUserStatus(user, user.isActive === false)}
                          disabled={userActionId === user._id}
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/5 disabled:opacity-50"
                        >
                          {userActionId === user._id
                            ? "Updating…"
                            : user.isActive === false
                              ? "Reactivate"
                              : "Suspend"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setError("");
                            setRemovalImpactLoading(user.role === "authority");
                            setRemovalTarget(user);
                            setRemovalImpactCount(0);
                            setRemovalDisposition("");
                          }}
                          disabled={userActionId === user._id}
                          className="rounded-lg border border-red-300/20 px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-300/10 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </>
                    ))}
                  </div>

                </div>

              ))

            )}

          </div>

          {userPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 text-sm">
              <button
                type="button"
                onClick={() => setUserPage((page) => Math.max(1, page - 1))}
                disabled={userPage <= 1 || usersLoading}
                className="rounded-lg border border-white/10 px-3 py-2 text-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-slate-400">Page {userPage} of {userPages}</span>
              <button
                type="button"
                onClick={() => setUserPage((page) => Math.min(userPages, page + 1))}
                disabled={userPage >= userPages || usersLoading}
                className="rounded-lg border border-white/10 px-3 py-2 text-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}

        </div>

        <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent admin activity</h2>
              <p className="mt-1 text-sm text-slate-400">Account and report assignment actions.</p>
            </div>
            <button
              type="button"
              onClick={() => void loadAuditLogs()}
              disabled={auditLoading}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50"
            >
              {auditLoading ? "Loading…" : "Refresh history"}
            </button>
          </div>
          {auditError ? (
            <p role="alert" className="mt-4 text-sm text-red-200">{auditError}</p>
          ) : auditLoading ? (
            <p className="mt-4 text-sm text-slate-500">Loading audit history…</p>
          ) : auditLogs.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No admin actions recorded yet.</p>
          ) : (
            <ol className="mt-5 divide-y divide-white/5">
              {auditLogs.map((entry) => (
                <li key={entry._id} className="flex flex-col gap-1 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-200">{entry.summary}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {entry.actorId?.name || "Administrator"} · {entry.action}
                      {entry.targetUserId?.name ? ` · ${entry.targetUserId.name}` : ""}
                      {entry.targetReportId?.title ? ` · ${entry.targetReportId.title}` : ""}
                    </p>
                  </div>
                  <time className="text-xs text-slate-500" dateTime={entry.createdAt}>
                    {new Date(entry.createdAt).toLocaleString()}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </section>

      </main>

      {removalTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !userActionId) {
              setRemovalTarget(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-account-title"
            className="my-auto w-full max-w-xl rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl"
          >
            <h2 id="remove-account-title" className="text-xl font-semibold">
              Remove {removalTarget.role} account?
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              This will disable sign-in and retain the account record, reports, and history for auditability.
            </p>
            <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/70 p-4">
              <p className="font-medium text-white">{removalTarget.name}</p>
              <p className="mt-1 text-sm text-slate-400">{removalTarget.email}</p>
              <p className="mt-1 text-xs capitalize text-slate-500">{removalTarget.role}</p>
            </div>

            {removalTarget.role === "authority" && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-slate-100">Active assigned reports</h3>
                {removalImpactLoading ? (
                  <p className="mt-2 text-sm text-slate-400">Checking assigned reports…</p>
                ) : (
                  <>
                    <p className="mt-2 text-sm text-slate-400">
                      {removalImpactCount} report{removalImpactCount === 1 ? "" : "s"} will be affected.
                    </p>
                    {removalImpactCount > 0 && (
                      <select
                        value={removalDisposition}
                        onChange={(event) => setRemovalDisposition(event.target.value)}
                        aria-label="Choose what to do with assigned reports"
                        className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-300/40"
                      >
                        <option value="">Choose how to handle these reports</option>
                        {authorities
                          .filter((authority) => authority._id !== removalTarget._id)
                          .map((authority) => (
                            <option key={authority._id} value={authority._id}>
                              Reassign to {authority.name}{authority.department ? ` · ${authority.department}` : ""}
                            </option>
                          ))}
                        <option value="leave-unassigned">Leave reports unassigned</option>
                      </select>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setRemovalTarget(null)}
                disabled={Boolean(userActionId)}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmRemoveUser()}
                disabled={
                  Boolean(userActionId) ||
                  removalImpactLoading ||
                  (removalTarget.role === "authority" && removalImpactCount > 0 && !removalDisposition)
                }
                className="rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100 hover:bg-red-400/20 disabled:opacity-50"
              >
                {userActionId === removalTarget._id ? "Removing…" : "Confirm removal"}
              </button>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}

// ==========================================
// STAT COMPONENT
// ==========================================

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 hover:border-blue-500/20 transition">

      <div className="flex items-center justify-between">

        <p className="text-slate-400">
          {label}
        </p>

        <span className="text-xl">
          {icon}
        </span>

      </div>

      <p className="text-3xl font-bold mt-3">
        {value}
      </p>

    </div>
  );
}

// ==========================================
// ROLE BADGE
// ==========================================

function RoleBadge({
  role,
}: {
  role: string;
}) {
  const styles: Record<string, string> = {
    citizen:
      "bg-blue-500/10 text-blue-300 border-blue-500/20",

    authority:
      "bg-purple-500/10 text-purple-300 border-purple-500/20",

    admin:
      "bg-amber-500/10 text-amber-300 border-amber-500/20",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full border text-sm capitalize ${
        styles[role] ||
        "bg-slate-500/10 text-slate-300 border-slate-500/20"
      }`}
    >
      {role}
    </span>
  );
}