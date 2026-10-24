import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [creatingAuthority, setCreatingAuthority] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Authority form
  const [showAuthorityForm, setShowAuthorityForm] = useState(false);

  const [authorityName, setAuthorityName] = useState("");
  const [authorityEmail, setAuthorityEmail] = useState("");
  const [authorityPassword, setAuthorityPassword] = useState("");

  // User search/filter
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

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

      loadAdminData();
    } catch (error) {
      console.error(error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, []);

  // ==========================================
  // LOAD ADMIN DATA
  // ==========================================

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/admin/dashboard",
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
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

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
        "http://localhost:5000/api/admin/authorities",
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

          <Link
            to="/reports"
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

          </Link>

        </div>

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

            <div className="flex flex-col md:flex-row gap-3 mt-5">

              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />

              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value)
                }
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

            </div>

          </div>

          {/* USER LIST */}

          <div className="divide-y divide-white/5">

            {filteredUsers.length === 0 ? (

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
                  className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-white/[0.02] transition"
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

                    </div>

                  </div>

                  <RoleBadge role={user.role} />

                </div>

              ))

            )}

          </div>

        </div>

      </main>

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