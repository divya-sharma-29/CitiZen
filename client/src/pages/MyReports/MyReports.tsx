import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Report {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  imageUrl: string | null;
  imageUrls?: string[];
  status: string;
  createdAt: string;
}

function MyReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReports() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/reports/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load reports.");
          return;
        }

        setReports(data.reports);
      } catch (error) {
        console.error(error);
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [navigate]);

  function getStatusStyle(status: string) {
    switch (status) {
      case "Resolved":
        return "bg-green-500/10 text-green-400 border-green-500/30";

      case "In Progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";

      case "Under Review":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";

      case "Assigned":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";

      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-white/10 px-8 py-5 flex items-center justify-between">

        <Link
          to="/dashboard"
          className="text-2xl font-bold text-blue-500"
        >
          🏙 CitiZen
        </Link>

        <Link
          to="/dashboard"
          className="text-gray-400 hover:text-white"
        >
          ← Dashboard
        </Link>

      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">

        {/* Page Header */}
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-bold">
              My Reports
            </h1>

            <p className="text-gray-400 mt-3">
              Track the civic issues you have reported.
            </p>
          </div>

          <Link
            to="/report"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold"
          >
            + New Report
          </Link>

        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-12 text-center text-gray-400">
            Loading your reports...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-10 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4">
            {error}
          </div>
        )}

        {/* No Reports */}
        {!loading && !error && reports.length === 0 && (
          <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-10 text-center">

            <div className="text-5xl">
              📍
            </div>

            <h2 className="text-2xl font-semibold mt-5">
              No reports yet
            </h2>

            <p className="text-gray-400 mt-2">
              You haven't reported any civic issues yet.
            </p>

            <Link
              to="/report"
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl"
            >
              Report an Issue
            </Link>

          </div>
        )}

        {/* Reports */}
        {!loading && reports.length > 0 && (
          <div className="mt-10 space-y-6">

            {reports.map((report) => (

              <div
                key={report._id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >

                {/* Report Image */}
                {(report.imageUrls?.length
                  ? report.imageUrls
                  : report.imageUrl
                    ? [report.imageUrl]
                    : []
                ).map((imageUrl, index) => (
                  <img
                    key={`${imageUrl}-${index}`}
                    src={`http://localhost:5000${imageUrl}`}
                    alt={`${report.title} evidence ${index + 1}`}
                    className="mb-4 max-h-80 w-full rounded-xl object-cover"
                  />
                ))}

                {/* Title + Status */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                  <div>

                    <h2 className="text-2xl font-semibold">
                      {report.title}
                    </h2>

                    <p className="text-blue-400 mt-2">
                      {report.category}
                    </p>

                  </div>

                  <span
                    className={`border px-4 py-2 rounded-full text-sm ${getStatusStyle(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </span>

                </div>

                {/* Description */}
                <p className="text-gray-300 mt-5">
                  {report.description}
                </p>

                {/* Location + Date */}
                <div className="mt-5 grid md:grid-cols-2 gap-4 text-sm">

                  <div>

                    <span className="text-gray-500">
                      📍 Location
                    </span>

                    <p className="text-gray-300 mt-1">
                      {report.location}
                    </p>

                  </div>

                  <div>

                    <span className="text-gray-500">
                      📅 Reported
                    </span>

                    <p className="text-gray-300 mt-1">
                      {new Date(
                        report.createdAt
                      ).toLocaleDateString()}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

      </main>

    </div>
  );
}

export default MyReports;