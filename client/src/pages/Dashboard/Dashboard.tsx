import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock3,
  MapPin,
  Plus,
  TrendingUp,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface DashboardReport {
  _id: string;
  title: string;
  category: string;
  status: string;
  severity: string;
  priorityScore: number;
  location: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    name: string;
    department?: string | null;
  } | null;
}

interface DashboardActivity {
  _id: string;
  action: string;
  message: string;
  createdAt: string;
  reportId?: {
    _id: string;
    title: string;
  } | null;
  userId?: {
    name: string;
  } | null;
}

interface CitizenDashboard {
  summary: {
    totalReports: number;
    resolvedReports: number;
    pendingReports: number;
    underReviewReports: number;
    assignedReports: number;
    inProgressReports: number;
  };
  priorityDistribution: {
    priority: string;
    count: number;
  }[];
  averageResolutionHours: number | null;
  averageResolutionSampleSize: number;
  recentReports: DashboardReport[];
  recentActivity: DashboardActivity[];
}

const API_URL = "http://localhost:5000";

function getStatusStyle(status: string) {
  switch (status) {
    case "Resolved":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case "In Progress":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";
    case "Under Review":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    case "Assigned":
      return "border-violet-400/20 bg-violet-400/10 text-violet-300";
    default:
      return "border-slate-400/20 bg-slate-400/10 text-slate-300";
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<CitizenDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      setLoading(true);
      setError("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const [userResponse, dashboardResponse] = await Promise.all([
          fetch(`${API_URL}/api/auth/me`, {
            headers,
            signal: controller.signal,
          }),
          fetch(`${API_URL}/api/dashboard/citizen`, {
            headers,
            signal: controller.signal,
          }),
        ]);

        if (!userResponse.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        const [userData, dashboardData] = await Promise.all([
          userResponse.json(),
          dashboardResponse.json(),
        ]);

        if (!dashboardResponse.ok) {
          throw new Error(
            dashboardData.message || "Failed to load your dashboard."
          );
        }

        setUser(userData.user);
        setDashboard(dashboardData);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") {
          return;
        }

        console.error("Dashboard load failed:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to connect to the server."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => controller.abort();
  }, [navigate, reloadKey]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  const summary = dashboard?.summary;
  const activeReports = summary
    ? summary.pendingReports +
      summary.underReviewReports +
      summary.assignedReports +
      summary.inProgressReports
    : 0;
  const priorityTotal =
    dashboard?.priorityDistribution.reduce((total, item) => total + item.count, 0) ??
    0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-36 top-[30rem] h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-3 text-xl font-bold tracking-tight"
          >
            <img src="/logo.png" alt="" className="h-9 w-9" />
            <span>
              Citi<span className="text-cyan-300">Zen</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
            >
              <Bell size={19} />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-red-400/30 hover:text-red-200 sm:px-4"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs font-medium tracking-wide text-cyan-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 motion-reduce:animate-none" />
              CITIZEN OVERVIEW
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Track your reports and see the progress happening in your community.
            </p>
          </div>

          <Link
            to="/report"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 font-semibold shadow-lg shadow-blue-950/40 transition hover:-translate-y-0.5 hover:shadow-cyan-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            <Plus size={18} />
            Report an issue
          </Link>
        </header>

        {error && (
          <section
            role="alert"
            className="mt-8 flex flex-col gap-4 rounded-2xl border border-red-400/20 bg-red-400/5 p-5 text-red-200 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">Dashboard unavailable</p>
              <p className="mt-1 text-sm text-red-100/70">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="rounded-lg border border-red-300/20 px-4 py-2 text-sm font-medium transition hover:bg-red-300/10"
            >
              Try again
            </button>
          </section>
        )}

        <section
          aria-label="Report statistics"
          className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {[
            {
              label: "Reports submitted",
              value: summary?.totalReports,
              icon: Activity,
              accent: "text-cyan-200 bg-cyan-400/10",
            },
            {
              label: "Resolved",
              value: summary?.resolvedReports,
              icon: CheckCircle2,
              accent: "text-emerald-200 bg-emerald-400/10",
            },
            {
              label: "Active reports",
              value: activeReports,
              icon: Clock3,
              accent: "text-amber-200 bg-amber-400/10",
            },
            {
              label: "Under review",
              value: summary?.underReviewReports,
              icon: CircleAlert,
              accent: "text-violet-200 bg-violet-400/10",
            },
          ].map(({ label, value, icon: Icon, accent }) => (
            <article
              key={label}
              className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_20px_60px_rgba(2,8,23,0.2)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm text-slate-400">{label}</p>
                <span className={`rounded-xl p-2.5 ${accent}`}>
                  <Icon size={19} />
                </span>
              </div>
              <p className="mt-5 text-3xl font-semibold tabular-nums">
                {loading ? (
                  <span className="inline-block h-9 w-14 animate-pulse rounded-lg bg-white/10 motion-reduce:animate-none" />
                ) : (
                  value ?? 0
                )}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(2,8,23,0.24)] backdrop-blur-xl sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Recent reports</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Your latest submissions and their current status.
                </p>
              </div>
              <Link
                to="/my-reports"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-cyan-200 transition hover:text-white"
              >
                View all <ArrowRight size={15} />
              </Link>
            </div>

            {loading ? (
              <div className="mt-6 space-y-3" aria-label="Loading reports">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-xl border border-white/5 bg-white/5 motion-reduce:animate-none"
                  />
                ))}
              </div>
            ) : dashboard?.recentReports.length ? (
              <div className="mt-6 divide-y divide-white/[0.07]">
                {dashboard.recentReports.map((report) => (
                  <Link
                    key={report._id}
                    to={`/reports/${report._id}`}
                    className="group flex flex-col gap-3 py-4 transition first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-100 transition group-hover:text-cyan-200">
                        {report.title}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span>{report.category}</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} />
                          <span className="max-w-52 truncate">{report.location}</span>
                        </span>
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                    </div>
                    <span
                      className={`w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
                <MapPin className="mx-auto text-slate-500" size={25} />
                <p className="mt-3 font-medium">No reports yet</p>
                <p className="mt-1 text-sm text-slate-400">
                  Your submitted civic issues will appear here.
                </p>
                <Link
                  to="/report"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-white"
                >
                  Create your first report <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </article>

          <div className="space-y-6">
            <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(2,8,23,0.24)] backdrop-blur-xl sm:p-6">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-blue-400/10 p-2.5 text-blue-200">
                  <TrendingUp size={19} />
                </span>
                <div>
                  <h2 className="font-semibold">Priority distribution</h2>
                  <p className="text-xs text-slate-400">Across your reports</p>
                </div>
              </div>

              {loading ? (
                <div className="mt-6 h-24 animate-pulse rounded-xl bg-white/5 motion-reduce:animate-none" />
              ) : priorityTotal === 0 ? (
                <p className="mt-6 rounded-xl bg-white/[0.03] p-4 text-sm text-slate-400">
                  Priority levels will appear after you submit a report.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {[
                    ["Critical", "bg-red-400"],
                    ["High", "bg-orange-300"],
                    ["Normal", "bg-blue-300"],
                    ["Low", "bg-emerald-300"],
                  ].map(([priority, barColor]) => {
                    const count =
                      dashboard?.priorityDistribution.find(
                        (item) => item.priority === priority
                      )?.count ?? 0;
                    const percentage = Math.round((count / priorityTotal) * 100);

                    return (
                      <div key={priority}>
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="text-slate-300">{priority}</span>
                          <span className="text-slate-400">
                            {count} · {percentage}%
                          </span>
                        </div>
                        <div
                          className="h-1.5 overflow-hidden rounded-full bg-white/10"
                          role="progressbar"
                          aria-label={`${priority} priority reports`}
                          aria-valuenow={percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className={`h-full rounded-full ${barColor} transition-[width] duration-700 motion-reduce:transition-none`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(2,8,23,0.24)] backdrop-blur-xl sm:p-6">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-200">
                  <Clock3 size={19} />
                </span>
                <div>
                  <h2 className="font-semibold">Resolution time</h2>
                  <p className="text-xs text-slate-400">Based on completed reports</p>
                </div>
              </div>
              <p className="mt-5 text-2xl font-semibold">
                {loading
                  ? "—"
                  : dashboard && dashboard.averageResolutionHours !== null
                    ? `${dashboard.averageResolutionHours} hrs`
                    : "Building a reliable sample"}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {dashboard && dashboard.averageResolutionHours !== null
                  ? `Average from ${dashboard.averageResolutionSampleSize} resolved reports.`
                  : `${dashboard?.averageResolutionSampleSize ?? 0} resolved reports so far. We show an average after at least 5 resolutions.`}
              </p>
            </article>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(2,8,23,0.24)] backdrop-blur-xl sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Recent activity</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Updates on reports you follow.
                </p>
              </div>
              <Activity className="text-cyan-200" size={19} />
            </div>

            {loading ? (
              <div className="mt-6 h-28 animate-pulse rounded-xl bg-white/5 motion-reduce:animate-none" />
            ) : dashboard?.recentActivity.length ? (
              <ol className="mt-6 space-y-5">
                {dashboard.recentActivity.map((item) => (
                  <li key={item._id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.5)]" />
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200">{item.message}</p>
                      <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-slate-500">
                        {item.reportId && (
                          <Link
                            to={`/reports/${item.reportId._id}`}
                            className="max-w-56 truncate text-cyan-200/80 hover:text-cyan-100"
                          >
                            {item.reportId.title}
                          </Link>
                        )}
                        <time dateTime={item.createdAt}>
                          {formatDate(item.createdAt)}
                        </time>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 rounded-xl bg-white/[0.03] p-4 text-sm text-slate-400">
                Activity from your reports will show up here.
              </p>
            )}
          </article>

          <aside className="rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-blue-500/10 via-slate-900/70 to-cyan-500/5 p-6 shadow-[0_24px_70px_rgba(2,8,23,0.24)] backdrop-blur-xl sm:p-7">
            <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-3 text-cyan-200">
              <MapPin size={21} />
            </div>
            <h2 className="mt-5 text-xl font-semibold">Stay connected to your city</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Explore public civic reports nearby or follow every update on the
              issues you have raised.
            </p>
            <div className="mt-6 grid gap-3">
              <Link
                to="/civic-map"
                className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm font-medium transition hover:border-cyan-200/30 hover:bg-white/5"
              >
                Explore the civic map <ArrowRight size={16} />
              </Link>
              <Link
                to="/notifications"
                className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm font-medium transition hover:border-cyan-200/30 hover:bg-white/5"
              >
                View notifications <Bell size={16} />
              </Link>
            </div>
          </aside>
        </section>

        {user && (
          <p className="mt-8 text-center text-xs text-slate-600">
            Signed in as {user.email} · {user.role}
          </p>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
