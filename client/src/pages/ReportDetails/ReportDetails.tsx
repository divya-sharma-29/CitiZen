import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

interface Report {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;

  latitude: number;
  longitude: number;

  status: string;
  severity: string;
  priorityScore: number;

  imageUrl?: string;

  appreciationCount: number;
  commentCount: number;

  resolutionNote?: string;
  resolvedAt?: string;

  createdAt: string;

  duplicateOf?: {
    _id: string;
    title?: string;
  } | null;

  duplicateCount?: number;

  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface Comment {
  _id: string;
  text: string;
  userId: {
    name: string;
    role: string;
  };
  createdAt: string;
}

interface Activity {
  _id: string;
  message: string;
  action: string;
  createdAt: string;
}

export default function ReportDetails() {
  const { id } = useParams();

  const [report, setReport] =
    useState<Report | null>(null);

  const [comments, setComments] =
    useState<Comment[]>([]);

  const [activities, setActivities] =
    useState<Activity[]>([]);

  const [comment, setComment] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const token =
    localStorage.getItem("token");

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        reportResponse,
        commentsResponse,
        activityResponse,
      ] = await Promise.all([
        fetch(
          `http://localhost:5000/api/reports/${id}`
        ),

        fetch(
          `http://localhost:5000/api/reports/${id}/comments`
        ),

        fetch(
          `http://localhost:5000/api/reports/${id}/activity`
        ),
      ]);

      const reportData =
        await reportResponse.json();

      const commentsData =
        await commentsResponse.json();

      const activityData =
        await activityResponse.json();

      if (!reportResponse.ok) {
        throw new Error(
          reportData.message ||
            "Failed to fetch report"
        );
      }

      setReport(reportData.report);

      setComments(
        commentsData.comments || []
      );

      setActivities(
        activityData.activities || []
      );
    } catch (error) {
      console.error(
        "Error loading report:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const appreciate = async () => {
    if (!token) {
      setMessage(
        "Please login to appreciate this report."
      );
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/reports/${id}/appreciate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      setMessage(
        data.message ||
          "Appreciation updated."
      );

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to appreciate this report."
      );
    }
  };

  const addComment = async () => {
    if (!token) {
      setMessage(
        "Please login to comment."
      );
      return;
    }

    if (!comment.trim()) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/reports/${id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: comment.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        setComment("");

        setMessage(
          "Comment added successfully."
        );

        await loadData();
      } else {
        setMessage(
          data.message ||
            "Failed to add comment."
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to add comment."
      );
    }
  };

  const getSeverityClass = (
    severity: string
  ) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500/20 text-red-300 border-red-500/30";

      case "High":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";

      case "Medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";

      case "Low":
        return "bg-green-500/20 text-green-300 border-green-500/30";

      default:
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "Resolved":
        return "bg-green-500/20 text-green-300 border-green-500/30";

      case "In Progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";

      case "Assigned":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";

      case "Under Review":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";

      default:
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-3">
            ⏳
          </div>

          <p className="text-slate-400">
            Loading report...
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold">
            Report not found
          </p>

          <Link
            to="/civic-map"
            className="inline-block mt-4 text-blue-400 hover:text-blue-300"
          >
            ← Back to Civic Map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* BACK LINK */}

        <Link
          to="/civic-map"
          className="text-blue-400 hover:text-blue-300"
        >
          ← Back to Civic Map
        </Link>

        {/* MAIN GRID */}

        <div className="mt-6 grid lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}

          <div className="lg:col-span-2 space-y-6">

            {/* REPORT CARD */}

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">

              {/* HEADER */}

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                <div>
                  <h1 className="text-3xl font-bold">
                    {report.title}
                  </h1>

                  <p className="text-slate-400 mt-2">
                    {report.category}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">

                  <span
                    className={`px-3 py-1 rounded-full border text-sm ${getStatusClass(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full border text-sm ${getSeverityClass(
                      report.severity
                    )}`}
                  >
                    {report.severity}
                  </span>

                </div>

              </div>

              {/* IMAGE */}

              {report.imageUrl && (
                <img
                  src={`http://localhost:5000${report.imageUrl}`}
                  alt={report.title}
                  className="w-full max-h-[400px] object-cover rounded-xl mt-6"
                />
              )}

              {/* DESCRIPTION */}

              <p className="text-slate-300 mt-6 leading-7">
                {report.description}
              </p>

              {/* STATISTICS */}

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">

                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">
                    Severity
                  </p>

                  <p className="font-bold mt-1">
                    {report.severity}
                  </p>
                </div>

                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">
                    Priority
                  </p>

                  <p className="font-bold mt-1">
                    {report.priorityScore}
                  </p>
                </div>

                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">
                    Appreciation
                  </p>

                  <p className="font-bold mt-1">
                    {report.appreciationCount}
                  </p>
                </div>

                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">
                    Comments
                  </p>

                  <p className="font-bold mt-1">
                    {report.commentCount}
                  </p>
                </div>

                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">
                    Duplicates
                  </p>

                  <p className="font-bold mt-1">
                    {report.duplicateCount || 0}
                  </p>
                </div>

              </div>

              {/* LOCATION */}

              <div className="mt-5 bg-slate-800 rounded-xl p-4">

                <p className="text-slate-400 text-sm">
                  Location
                </p>

                <p className="text-slate-200 mt-1">
                  📍 {report.location}
                </p>

                <p className="text-xs text-slate-500 mt-2">
                  Coordinates:{" "}
                  {report.latitude},{" "}
                  {report.longitude}
                </p>

              </div>

              {/* ASSIGNED AUTHORITY */}

              {report.assignedTo && (
                <div className="mt-4 bg-slate-800 rounded-xl p-4">

                  <p className="text-slate-400 text-sm">
                    Assigned Authority
                  </p>

                  <p className="font-semibold mt-1">
                    👮 {report.assignedTo.name}
                  </p>

                  <p className="text-sm text-slate-400 mt-1">
                    {report.assignedTo.email}
                  </p>

                </div>
              )}

              {/* RESOLUTION */}

              {report.status === "Resolved" && (
                <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4">

                  <p className="text-green-400 font-semibold">
                    ✓ Issue Resolved
                  </p>

                  {report.resolvedAt && (
                    <p className="text-sm text-slate-400 mt-1">
                      Resolved on{" "}
                      {new Date(
                        report.resolvedAt
                      ).toLocaleString()}
                    </p>
                  )}

                  {report.resolutionNote && (
                    <p className="text-slate-300 mt-3">
                      {report.resolutionNote}
                    </p>
                  )}

                </div>
              )}

              {/* DUPLICATE REPORT */}

              {report.duplicateOf && (
                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">

                  <p className="text-yellow-400 font-semibold">
                    ⚠ Duplicate Report
                  </p>

                  <p className="text-sm text-slate-400 mt-1">
                    This report has been identified
                    as a duplicate of another civic
                    report.
                  </p>

                  <Link
                    to={`/reports/${report.duplicateOf._id}`}
                    className="inline-block mt-3 text-yellow-300 hover:text-yellow-200"
                  >
                    View original report →
                  </Link>

                </div>
              )}

              {/* APPRECIATION */}

              <button
                onClick={appreciate}
                className="mt-6 bg-blue-600 hover:bg-blue-500 transition px-5 py-3 rounded-xl"
              >
                👍 Appreciate this report
              </button>

              {/* MESSAGE */}

              {message && (
                <p className="mt-3 text-sm text-blue-300">
                  {message}
                </p>
              )}

              {/* CREATED DATE */}

              <p className="text-xs text-slate-500 mt-5">
                Reported on{" "}
                {new Date(
                  report.createdAt
                ).toLocaleString()}
              </p>

            </div>

            {/* COMMUNITY DISCUSSION */}

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">

              <h2 className="text-xl font-bold">
                Community Discussion
              </h2>

              <p className="text-slate-500 text-sm mt-1">
                Share information or updates
                about this civic issue.
              </p>

              {/* COMMENT INPUT */}

              <div className="flex flex-col sm:flex-row gap-3 mt-5">

                <input
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addComment();
                    }
                  }}
                  placeholder="Add a comment..."
                  className="flex-1 bg-slate-800 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />

                <button
                  onClick={addComment}
                  className="bg-blue-600 hover:bg-blue-500 transition px-5 py-3 rounded-xl"
                >
                  Post
                </button>

              </div>

              {/* COMMENTS */}

              <div className="mt-6 space-y-4">

                {comments.length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    No comments yet. Be the
                    first to join the discussion.
                  </p>
                ) : (
                  comments.map((item) => (
                    <div
                      key={item._id}
                      className="bg-slate-800 rounded-xl p-4"
                    >

                      <div className="flex justify-between gap-3">

                        <div>
                          <strong>
                            {item.userId?.name ||
                              "Citizen"}
                          </strong>

                          {item.userId?.role && (
                            <span className="ml-2 text-xs text-slate-500">
                              {item.userId.role}
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-slate-500">
                          {new Date(
                            item.createdAt
                          ).toLocaleString()}
                        </span>

                      </div>

                      <p className="text-slate-300 mt-2">
                        {item.text}
                      </p>

                    </div>
                  ))
                )}

              </div>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="space-y-6">

            {/* TIMELINE */}

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">

              <h2 className="text-xl font-bold">
                Report Timeline
              </h2>

              <p className="text-slate-500 text-sm mt-1">
                Track everything that has happened
                to this report.
              </p>

              <div className="mt-6 space-y-6">

                {activities.length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    No activity recorded yet.
                  </p>
                ) : (
                  activities.map((item) => (
                    <div
                      key={item._id}
                      className="relative pl-6 border-l border-blue-500/40"
                    >

                      <div className="absolute -left-[6px] top-1 w-3 h-3 bg-blue-500 rounded-full" />

                      <p className="font-medium">
                        {item.message}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(
                          item.createdAt
                        ).toLocaleString()}
                      </p>

                    </div>
                  ))
                )}

              </div>

            </div>

            {/* REPORT SUMMARY */}

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">

              <h2 className="text-xl font-bold">
                Report Summary
              </h2>

              <div className="mt-5 space-y-4">

                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Category
                  </span>

                  <span className="font-medium text-right">
                    {report.category}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Status
                  </span>

                  <span className="font-medium">
                    {report.status}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Severity
                  </span>

                  <span className="font-medium">
                    {report.severity}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Priority Score
                  </span>

                  <span className="font-bold">
                    {report.priorityScore}/100
                  </span>
                </div>

              </div>

            </div>

            {/* NAVIGATION */}

            <Link
              to="/civic-map"
              className="block text-center bg-slate-800 hover:bg-slate-700 transition rounded-xl px-4 py-3"
            >
              🗺️ View on Civic Map
            </Link>

          </div>

        </div>
      </div>
    </div>
  );
}