import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, X } from "lucide-react";
import { apiUrl } from "../../lib/api";

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
  imageUrls?: string[];
  userId?: {
    _id: string;
  } | string;

  appreciationCount: number;
  commentCount: number;

  resolutionNote?: string;
  resolvedAt?: string;

  createdAt: string;
  updatedAt?: string;

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
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
}

interface ReportPageData {
  report: Report;
  comments: Comment[];
  activities: Activity[];
}

interface AuthorityRating {
  resolutionQuality: number;
  responsiveness: number;
  communication: number;
  professionalism: number;
  overallSatisfaction: number;
  review: string;
  createdAt?: string;
}

const EMPTY_RATING: AuthorityRating = {
  resolutionQuality: 0,
  responsiveness: 0,
  communication: 0,
  professionalism: 0,
  overallSatisfaction: 0,
  review: "",
};

const RATING_CATEGORIES = [
  ["resolutionQuality", "Resolution quality"],
  ["responsiveness", "Responsiveness"],
  ["communication", "Communication"],
  ["professionalism", "Professionalism"],
  ["overallSatisfaction", "Overall satisfaction"],
] as const;

const REPORT_STATUS_STEPS = [
  "Reported",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
];

async function fetchReportPageData(
  reportId: string,
  signal?: AbortSignal
): Promise<ReportPageData> {
  const [reportResponse, commentsResponse, activityResponse] =
    await Promise.all([
      fetch(apiUrl(`/api/reports/${reportId}`), { signal }),
      fetch(apiUrl(`/api/reports/${reportId}/comments`), {
        signal,
      }),
      fetch(apiUrl(`/api/reports/${reportId}/activity`), {
        signal,
      }),
    ]);

  const [reportData, commentsData, activityData] = await Promise.all([
    reportResponse.json(),
    commentsResponse.json(),
    activityResponse.json(),
  ]);

  if (!reportResponse.ok) {
    throw new Error(reportData.message || "Failed to fetch report.");
  }
  if (!commentsResponse.ok) {
    throw new Error(commentsData.message || "Failed to fetch comments.");
  }
  if (!activityResponse.ok) {
    throw new Error(activityData.message || "Failed to fetch report activity.");
  }

  return {
    report: reportData.report,
    comments: commentsData.comments || [],
    activities: activityData.activities || [],
  };
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
  const [loadedId, setLoadedId] = useState<string | null>(null);

  const [message, setMessage] =
    useState("");
  const [ratingOpen, setRatingOpen] = useState(false);
  const [rating, setRating] = useState<AuthorityRating>(EMPTY_RATING);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [ratingSuccess, setRatingSuccess] = useState("");
  const [feedbackWindowDays, setFeedbackWindowDays] = useState(30);

  const token =
    localStorage.getItem("token");

  const userId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null") as
        | { id?: string; _id?: string; role?: string }
        | null;
      return {
        id: user?.id || user?._id || "",
        role: user?.role || "",
      };
    } catch (error) {
      console.error("Unable to read current user for report rating:", error);
      return { id: "", role: "" };
    }
  })();

  const reportOwnerId =
    typeof report?.userId === "string"
      ? report.userId
      : report?.userId?._id;
  const canRateResolution =
    Boolean(
      report &&
        report.status === "Resolved" &&
        report.assignedTo?.role === "authority" &&
        userId.role === "citizen" &&
        userId.id === reportOwnerId
    );

  const applyPageData = useCallback((data: ReportPageData) => {
    setReport(data.report);
    setComments(data.comments);
    setActivities(data.activities);
  }, []);

  const refreshData = useCallback(async () => {
    if (!id) return;

    try {
      applyPageData(await fetchReportPageData(id));
    } catch (error) {
      console.error(
        "Error loading report:",
        error
      );
    }
  }, [applyPageData, id]);

  useEffect(() => {
    if (!id) return;

    let active = true;
    const controller = new AbortController();

    fetchReportPageData(id, controller.signal)
      .then((data) => {
        if (active) {
          applyPageData(data);
          setLoadedId(id);
        }
      })
      .catch((error: unknown) => {
        if (
          !active ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }

        console.error("Error loading report:", error);
        if (active) {
          setReport(null);
          setComments([]);
          setActivities([]);
          setLoadedId(id);
          setMessage("Unable to load report details.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [applyPageData, id]);

  const loadExistingRating = async () => {
    if (!token || !id) return;

    try {
      const response = await fetch(apiUrl(`/api/reports/${id}/rating`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your rating.");
      }

      setFeedbackWindowDays(data.feedbackWindowDays || 30);
      setRating(data.rating || EMPTY_RATING);
    } catch (error) {
      console.error("Load report rating failed:", error);
      setRatingError(
        error instanceof Error
          ? error.message
          : "Unable to load your existing rating."
      );
    }
  };

  const appreciate = async () => {
    if (!token) {
      setMessage("Please login to appreciate this report.");
      return;
    }

    try {
      const response = await fetch(
        apiUrl(`/api/reports/${id}/appreciate`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      setMessage(data.message || "Appreciation updated.");

      if (response.ok) {
        await refreshData();

        if (canRateResolution) {
          setRatingError("");
          setRatingSuccess("");
          await loadExistingRating();
          setRatingOpen(true);
        } else if (report?.status !== "Resolved") {
          setMessage(
            "Thanks for appreciating this report. You can rate the authority after it is resolved."
          );
        }
      }
    } catch (error) {
      console.error("Appreciation request failed:", error);
      setMessage("Unable to appreciate this report.");
    }
  };

  const submitRating = async () => {
    if (!token || !id) return;

    const incompleteCategory = RATING_CATEGORIES.find(
      ([key]) => rating[key] < 1 || rating[key] > 5
    );
    if (incompleteCategory) {
      setRatingError(`Please rate ${incompleteCategory[1].toLowerCase()}.`);
      return;
    }

    setRatingError("");
    setRatingSubmitting(true);

    try {
      const response = await fetch(apiUrl(`/api/reports/${id}/rating`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rating),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save your rating.");
      }

      setRating(data.rating);
      setRatingSuccess(data.message);
      setRatingOpen(false);
      setMessage(data.message);
    } catch (error) {
      console.error("Submit report rating failed:", error);
      setRatingError(
        error instanceof Error
          ? error.message
          : "Unable to save your rating."
      );
    } finally {
      setRatingSubmitting(false);
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
        apiUrl(`/api/reports/${id}/comments`),
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

        await refreshData();
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

  if (loading || loadedId !== id) {
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
            {message || "Report not found"}
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

  const activeStatusIndex = Math.max(
    0,
    REPORT_STATUS_STEPS.indexOf(report.status)
  );

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

              <section
                aria-label="Report status progress"
                className="mt-7 rounded-2xl border border-white/10 bg-slate-950/60 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold">Resolution progress</h2>
                  <span className="text-xs text-slate-400">
                    Current: {report.status}
                  </span>
                </div>
                <ol className="mt-5 grid grid-cols-5 gap-2">
                  {REPORT_STATUS_STEPS.map((step, index) => {
                    const complete = index < activeStatusIndex;
                    const current = index === activeStatusIndex;
                    const stepActivity = activities.find(
                      (activity) => activity.newValue === step
                    );
                    const stepDate =
                      stepActivity?.createdAt ||
                      (step === "Reported" ? report.createdAt : null);

                    return (
                      <li
                        key={step}
                        aria-current={current ? "step" : undefined}
                        className="relative min-w-0 text-center"
                      >
                        <div
                          className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                            complete
                              ? "border-emerald-300/50 bg-emerald-400/15 text-emerald-200"
                              : current
                                ? "border-cyan-200/60 bg-cyan-300/20 text-cyan-100 shadow-[0_0_18px_rgba(103,232,249,0.2)]"
                                : "border-white/10 bg-white/5 text-slate-500"
                          }`}
                        >
                          {complete ? "✓" : index + 1}
                        </div>
                        <p
                          className={`mt-2 text-[10px] leading-4 sm:text-xs ${
                            current || complete
                              ? "text-slate-200"
                              : "text-slate-500"
                          }`}
                        >
                          {step}
                        </p>
                        {stepDate && (
                          <time
                            dateTime={stepDate}
                            className="mt-1 hidden text-[10px] text-slate-500 sm:block"
                          >
                            {new Date(stepDate).toLocaleDateString()}
                          </time>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>

              {/* IMAGE */}

              {(report.imageUrls?.length
                ? report.imageUrls
                : report.imageUrl
                  ? [report.imageUrl]
                  : []
              ).map((imageUrl, index) => (
                <img
                  key={`${imageUrl}-${index}`}
                  src={apiUrl(imageUrl)}
                  alt={`${report.title} evidence ${index + 1}`}
                  className="mt-6 max-h-[400px] w-full rounded-xl object-cover"
                />
              ))}

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
              {ratingSuccess && (
                <p role="status" className="mt-3 text-sm text-emerald-300">
                  {ratingSuccess}
                </p>
              )}
              {canRateResolution && (
                <button
                  type="button"
                  onClick={async () => {
                    await loadExistingRating();
                    setRatingOpen(true);
                  }}
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-amber-200 transition hover:text-amber-100"
                >
                  <Star size={16} />
                  {rating.createdAt
                    ? "View or update your authority rating"
                    : "Rate this resolution"}
                </button>
              )}

              {/* CREATED DATE */}

              <p className="text-xs text-slate-500 mt-5">
                Reported on{" "}
                {new Date(
                  report.createdAt
                ).toLocaleString()}
              </p>
              {report.updatedAt && (
                <p className="mt-1 text-xs text-slate-500">
                  Last updated{" "}
                  {new Date(report.updatedAt).toLocaleString()}
                </p>
              )}

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

      {ratingOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setRatingOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="resolution-rating-title"
            className="my-auto w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-[0_35px_110px_rgba(2,8,23,0.75)] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Citizen feedback
                </p>
                <h2
                  id="resolution-rating-title"
                  className="mt-2 text-2xl font-semibold"
                >
                  Rate this resolution
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {report.title}
                  {report.assignedTo?.name
                    ? ` · ${report.assignedTo.name}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRatingOpen(false)}
                aria-label="Close rating dialog"
                className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-5 rounded-xl border border-cyan-200/10 bg-cyan-200/5 p-3 text-xs leading-5 text-slate-300">
              Your feedback is limited to the authority action on this report.
              You can edit it within {feedbackWindowDays} days of first
              submitting.
            </p>

            {ratingError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100"
              >
                {ratingError}
              </p>
            )}

            <div className="mt-5 space-y-4">
              {RATING_CATEGORIES.map(([key, label]) => (
                <div
                  key={key}
                  className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm text-slate-200">{label}</span>
                  <div
                    className="flex items-center gap-1"
                    role="group"
                    aria-label={label}
                  >
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => {
                          setRating((current) => ({
                            ...current,
                            [key]: score,
                          }));
                          setRatingError("");
                        }}
                        aria-label={`${label}: ${score} star${score === 1 ? "" : "s"}`}
                        aria-pressed={rating[key] === score}
                        className="rounded-md p-1 text-amber-300 transition hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 motion-reduce:transform-none"
                      >
                        <Star
                          size={20}
                          fill={score <= rating[key] ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <label
              htmlFor="resolution-rating-review"
              className="mt-5 block text-sm font-medium text-slate-200"
            >
              Written feedback <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              id="resolution-rating-review"
              value={rating.review}
              onChange={(event) =>
                setRating((current) => ({
                  ...current,
                  review: event.target.value.slice(0, 1000),
                }))
              }
              rows={3}
              maxLength={1000}
              placeholder="What went well, or what could be improved?"
              className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200/40"
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {rating.review.length}/1000
            </p>

            <button
              type="button"
              onClick={submitRating}
              disabled={ratingSubmitting}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 font-semibold transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
            >
              <Star size={17} />
              {ratingSubmitting
                ? "Saving feedback…"
                : rating.createdAt
                  ? "Update rating"
                  : "Submit rating"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}