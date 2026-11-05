import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { apiUrl } from "../../lib/api";
import cityFuture from "../../assets/city-future.jpg";
import cityInfrastructure from "../../assets/city-infrastructure.jpg";

interface CivicStats {
  total: number;
  resolved: number;
  reported: number;
  underReview: number;
  assigned: number;
  inProgress: number;
}

function Hero() {
  const [stats, setStats] = useState<CivicStats | null>(null);
  const [statsUnavailable, setStatsUnavailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(apiUrl("/api/reports/stats"), {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to load civic statistics.");
        }
        setStats(data);
      })
      .catch((error: unknown) => {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }
        console.error("Civic statistics could not be loaded:", error);
        setStatsUnavailable(true);
      });

    return () => controller.abort();
  }, []);

  const activeReports = stats
    ? stats.reported +
      stats.underReview +
      stats.assigned +
      stats.inProgress
    : null;

  return (
    <section className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-[#050b18] text-white">
      <img
        src={cityFuture}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950/95 via-slate-950/90 to-blue-950/75" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 top-0 -z-10 h-[35rem] w-[35rem] rounded-full bg-blue-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 right-0 -z-10 h-[40rem] w-[40rem] rounded-full bg-cyan-400/10 blur-3xl"
      />

      <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-20">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/5 px-3.5 py-2 text-xs font-medium tracking-wide text-cyan-100 backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-50 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
            </span>
            CIVIC INTELLIGENCE, BUILT AROUND PEOPLE
          </div>
          <p className="sr-only">
            {statsUnavailable
              ? "Live city statistics are currently unavailable."
              : stats
                ? `${stats.total} reports have been shared and ${stats.resolved} are resolved.`
                : "Loading city report statistics."}
          </p>

          <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[1.03] tracking-tight sm:text-6xl xl:text-7xl">
            A better city
            <span className="block bg-gradient-to-r from-cyan-200 via-blue-300 to-violet-300 bg-clip-text pb-2 text-transparent">
              starts by being heard.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Report what needs attention, follow the response, and help your
            neighborhood turn everyday concerns into visible progress.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 font-semibold shadow-lg shadow-blue-950/40 transition hover:-translate-y-0.5 hover:shadow-cyan-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 motion-reduce:transform-none"
            >
              Start reporting
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
              />
            </Link>
            <Link
              to="/features"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 font-semibold text-slate-100 backdrop-blur-xl transition hover:border-white/30 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            >
              Discover the platform
              <ArrowDown size={16} />
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
            <div className="inline-flex items-center gap-2">
              <ShieldCheck size={17} className="text-emerald-300" />
              <span>Secure accounts</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <MapPin size={17} className="text-cyan-200" />
              <span>Location-aware reports</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <CheckCircle2 size={17} className="text-violet-200" />
              <span>Transparent follow-up</span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto">
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-blue-500/20 via-cyan-300/10 to-violet-500/20 blur-3xl" />

          <div className="relative rotate-1 rounded-[2rem] border border-white/15 bg-white/[0.07] p-2 shadow-[0_35px_110px_rgba(2,8,23,0.65)] backdrop-blur-xl transition duration-500 hover:rotate-0 motion-reduce:transform-none">
            <div className="relative overflow-hidden rounded-[1.55rem]">
              <img
                src={cityInfrastructure}
                alt="Modern city infrastructure at dusk"
                className="h-[390px] w-full object-cover sm:h-[450px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-slate-950/10" />

              <div className="absolute left-5 right-5 top-5 flex items-center justify-between rounded-2xl border border-white/20 bg-slate-950/45 p-4 backdrop-blur-xl sm:left-6 sm:right-6 sm:top-6">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt=""
                    className="h-10 w-10 rounded-xl"
                  />
                  <div>
                    <p className="font-semibold">CitiZen</p>
                    <p className="text-xs text-slate-300">
                      Civic activity, made visible
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Connected
                </div>
              </div>

              <div className="absolute inset-x-5 bottom-5 sm:inset-x-6 sm:bottom-6">
                <div className="rounded-2xl border border-white/15 bg-slate-950/70 p-5 shadow-xl backdrop-blur-2xl sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-200">
                        Your city, in progress
                      </p>
                      <p className="mt-2 text-xl font-semibold">
                        From report to response.
                      </p>
                    </div>
                    <div className="rounded-xl border border-cyan-200/15 bg-cyan-200/10 p-2.5 text-cyan-100">
                      <Sparkles size={20} />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
                      <p className="text-xs text-slate-400">Reports shared</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums">
                        {stats ? stats.total.toLocaleString() : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
                      <p className="text-xs text-slate-400">Issues resolved</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-200">
                        {stats ? stats.resolved.toLocaleString() : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs">
                    <span className="text-slate-300">Open reports</span>
                    <span className="font-semibold text-cyan-100">
                      {activeReports === null
                        ? statsUnavailable
                          ? "Live data unavailable"
                          : "Loading city data…"
                        : activeReports.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -left-5 top-1/2 hidden -translate-y-1/2 animate-float-slow rounded-2xl border border-white/15 bg-slate-950/70 p-4 shadow-xl backdrop-blur-xl sm:block motion-reduce:animate-none">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-blue-400/10 p-2.5 text-blue-200">
                <MapPin size={19} />
              </span>
              <div>
                <p className="text-xs text-slate-400">Every issue</p>
                <p className="text-sm font-semibold">Has a place</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
