import {
  BrainCircuit,
  Image,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { CivicStats } from "../../lib/civicStats";

interface AIDemoProps {
  stats: CivicStats | null;
  statsUnavailable: boolean;
}

function AIDemo({ stats, statsUnavailable }: AIDemoProps) {
  const latestReport = stats?.latestReport;
  const priorityScore = latestReport
    ? Math.max(0, Math.min(100, latestReport.priorityScore))
    : 0;
  const confidence =
    latestReport?.aiVerified === true ? latestReport.aiConfidence : null;
  const confidencePercent =
    confidence === null || confidence === undefined
      ? null
      : Math.round(confidence <= 1 ? confidence * 100 : confidence);

  return (
    <section className="bg-slate-950 text-white py-14 sm:py-16 lg:py-20 px-5 sm:px-8">

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

        {/* Left */}

        <div>

          <p className="uppercase tracking-[0.3em] text-blue-400 font-semibold">
            Live Civic Data
          </p>

          <h2 className="text-4xl sm:text-5xl font-bold mt-5 sm:mt-6 leading-tight">
            Live Civic Insights
            <br />
            From Report Activity
          </h2>

          <p className="mt-6 sm:mt-8 text-gray-400 leading-7 sm:leading-8 text-base sm:text-lg">
            Each value below comes from the newest report record. AI results are
            shown only when they have been recorded for that report.
          </p>

          <div className="mt-8 sm:mt-10 space-y-6 sm:space-y-8">

            <div className="flex gap-4">

              <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center">
                <Image size={26}/>
              </div>

              <div>

                <h3 className="text-xl font-semibold">
                  Report Categories
                </h3>

                <p className="text-gray-400 mt-2">
                  Displays the category recorded on each civic report.
                </p>

              </div>

            </div>

            <div className="flex gap-4">

              <div className="w-14 h-14 rounded-xl bg-green-600 flex items-center justify-center">
                <BrainCircuit size={26}/>
              </div>

              <div>

                <h3 className="text-xl font-semibold">
                  Priority Scoring
                </h3>

                <p className="text-gray-400 mt-2">
                  Uses the report's recorded priority score and severity.
                </p>

              </div>

            </div>

            <div className="flex gap-4">

              <div className="w-14 h-14 rounded-xl bg-yellow-500 flex items-center justify-center">
                <AlertTriangle size={26}/>
              </div>

              <div>

                <h3 className="text-xl font-semibold">
                  Duplicate Detection
                </h3>

                <p className="text-gray-400 mt-2">
                  Flags nearby active reports in the same category.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Right */}

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-5 sm:p-8">

          <h3 className="text-2xl font-bold">
            Latest Report Snapshot
          </h3>
          {stats && !statsUnavailable && (
            <p className="mt-2 text-sm text-cyan-300" aria-live="polite" role="status">
              Live data refreshes every 30 seconds
            </p>
          )}

          {latestReport ? (
            <div className="mt-8 space-y-6">

            <div>
              <p className="font-semibold">{latestReport.title}</p>
              <p className="mt-1 text-sm text-gray-400">
                Current status: {latestReport.status}
              </p>
            </div>

            <div>

              <div className="flex justify-between">

                <span>AI Classification</span>

                <span className="text-green-400">
                  {latestReport.aiVerified
                    ? latestReport.aiCategory || latestReport.category
                    : "Not verified"}
                </span>

              </div>
              <p className="mt-2 text-sm text-gray-400">
                Report category: {latestReport.category}
              </p>

            </div>

            <div>

              <div className="flex justify-between">

                <span>Duplicate Detection</span>

                <span className="text-blue-400">
                  {latestReport.duplicateDetected ? "Possible match" : "No match"}
                </span>

              </div>

              <p className="mt-2 text-sm text-gray-400">
                {stats?.duplicateReports ?? 0} duplicate report
                {(stats?.duplicateReports ?? 0) === 1 ? "" : "s"} recorded
              </p>

            </div>

            <div>

              <div className="flex justify-between">

                <span>Priority · {latestReport.priorityScore}/100</span>

                <span className="text-red-400">
                  {latestReport.severity}
                </span>

              </div>

              <div className="mt-2 h-3 bg-slate-700 rounded-full">

                <div
                  className="h-full rounded-full bg-red-500"
                  style={{ width: `${priorityScore}%` }}
                ></div>

              </div>

            </div>

            <p className="text-sm text-gray-400">
              AI confidence:{" "}
              {confidencePercent === null
                ? "Not available"
                : `${Math.max(0, Math.min(100, confidencePercent))}%`}
            </p>

            </div>
          ) : (
            <p className="mt-8 rounded-xl border border-white/10 bg-slate-900 p-5 text-gray-300" role="status">
              {statsUnavailable
                ? "We couldn't load the latest report. Please try again shortly."
                : stats
                  ? "No reports have been submitted yet."
                  : "Loading the latest report..."}
            </p>
          )}

          {latestReport && (
          <div className="mt-8 p-5 rounded-xl bg-slate-900">

            <div className="flex gap-3">

              {latestReport.aiVerified ? (
                <CheckCircle2 className="text-green-400" />
              ) : (
                <AlertTriangle className="text-yellow-400" />
              )}

              <p className="text-gray-300">
                {latestReport.aiVerified
                  ? `AI verification recorded. ${
                      latestReport.department
                        ? `Assigned to ${latestReport.department}.`
                        : "No authority assignment is recorded yet."
                    }`
                  : `AI verification has not been recorded. ${
                      latestReport.department
                        ? `Assigned to ${latestReport.department}.`
                        : "No authority assignment is recorded yet."
                    }`}
              </p>

            </div>

          </div>
          )}

        </div>

      </div>

    </section>
  );
}

export default AIDemo;
