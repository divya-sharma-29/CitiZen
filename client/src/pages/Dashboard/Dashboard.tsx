import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error(error);

        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-gray-400">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-white/10 px-8 py-5 flex items-center justify-between">

        <Link
          to="/"
          className="text-2xl font-bold text-blue-500"
        >
          🏙 CitiZen
        </Link>

        <button
          onClick={handleLogout}
          className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-2 rounded-xl hover:bg-red-500/20 transition"
        >
          Logout
        </button>

      </nav>

      {/* Dashboard */}
      <main className="max-w-7xl mx-auto px-8 py-16">

        <h1 className="text-4xl font-bold">
          Welcome, {user.name}! 👋
        </h1>

        <p className="text-gray-400 mt-3">
          Welcome to your CitiZen dashboard.
        </p>

        {/* User Information */}
        <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6 max-w-xl">

          <h2 className="text-xl font-semibold">
            Your Account
          </h2>

          <div className="mt-6 space-y-4 text-gray-300">

            <p>
              <span className="text-gray-500">
                Name:
              </span>{" "}
              {user.name}
            </p>

            <p>
              <span className="text-gray-500">
                Email:
              </span>{" "}
              {user.email}
            </p>

            <p>
              <span className="text-gray-500">
                Role:
              </span>{" "}
              {user.role}
            </p>

          </div>

        </div>

        {/* Dashboard Actions */}
        <div className="mt-10 grid md:grid-cols-3 gap-6">

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold">
              📍 Report an Issue
            </h3>

            <p className="text-gray-400 mt-2">
              Report a civic problem in your area.
            </p>
          </div>

          <Link
            to="/my-reports"
            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 hover:bg-green-500/20 transition"
          >
            <h3 className="text-xl font-semibold">
              📊 My Reports
            </h3>

            <p className="text-gray-400 mt-2">
              Track the civic issues you reported.
            </p>
          </Link>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold">
              🔔 Notifications
            </h3>

            <p className="text-gray-400 mt-2">
              View updates about your reports.
            </p>
          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;