import type { CivicStats } from "../../lib/civicStats";
import {
  Activity,
  BrainCircuit,
  Clock3,
  Building2,
} from "lucide-react";

interface ImpactProps {
  stats: CivicStats | null;
  statsUnavailable: boolean;
}

function Impact({ stats, statsUnavailable }: ImpactProps) {
  const formatMetric = (value: number | null | undefined) => {
    if (statsUnavailable) return "\u2014";
    if (value === null || value === undefined) return "\u2026";
    return new Intl.NumberFormat().format(value);
  };

  const responseTime = statsUnavailable
    ? "\u2014"
    : stats
      ? stats.averageResponseHours === null
        ? "No data yet"
        : `${stats.averageResponseHours} hrs`
      : "\u2026";
  return (
    <section className="bg-slate-900 text-white py-14 sm:py-16 lg:py-20 px-5 sm:px-8">

      <div className="max-w-7xl mx-auto">

        <p className="uppercase tracking-[0.3em] text-blue-400 text-center font-semibold">
          Impact Dashboard
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mt-4 sm:mt-6">
          Making Cities Smarter Every Day
        </h2>

        <p className="text-gray-400 text-center max-w-3xl mx-auto mt-4 sm:mt-6 leading-7 sm:leading-8">
          Live civic activity from reports and connected authorities.
        </p>

        <p className="mt-4 text-center text-sm text-cyan-300" aria-live="polite" role="status">
          {statsUnavailable
            ? "Live metrics couldn't load. They will update when the connection returns."
            : stats
              ? "Live data refreshes every 30 seconds"
              : "Loading live metrics..."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mt-8 sm:mt-10 lg:mt-12">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-7 lg:p-8 text-center">

            <Activity className="mx-auto text-blue-400" size={40} />

            <h3 className="text-4xl sm:text-5xl font-bold mt-5 min-h-12">
              {formatMetric(stats?.total)}
            </h3>

            <p className="mt-4 text-gray-400">
              Reports Submitted
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-7 lg:p-8 text-center">

            <BrainCircuit className="mx-auto text-green-400" size={40} />

            <h3 className="text-4xl sm:text-5xl font-bold mt-5 min-h-12">
              {formatMetric(stats?.aiVerified)}
            </h3>

            <p className="mt-4 text-gray-400">
              AI-Verified Reports
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-7 lg:p-8 text-center">

            <Clock3 className="mx-auto text-yellow-400" size={40} />

            <h3 className="text-3xl sm:text-4xl font-bold mt-5 min-h-12 flex items-center justify-center">
              {responseTime}
            </h3>

            <p className="mt-4 text-gray-400">
              Avg. Time to First Action
            </p>
            {stats && (
              <p className="mt-2 text-sm text-gray-500">
                Based on {stats.responseSampleSize} reports
              </p>
            )}

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-7 lg:p-8 text-center">

            <Building2 className="mx-auto text-cyan-400" size={40} />

            <h3 className="text-4xl sm:text-5xl font-bold mt-5 min-h-12">
              {formatMetric(stats?.authoritiesConnected)}
            </h3>

            <p className="mt-4 text-gray-400">
              Authorities Connected
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Impact;
