import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import type { CivicStats } from "../../lib/civicStats";
import SwayingTreeBackground from "./SwayingTreeBackground";

interface HeroProps {
  stats: CivicStats | null;
  statsUnavailable: boolean;
}

function Hero({ stats, statsUnavailable }: HeroProps) {
  return (
    <section className="relative isolate min-h-[calc(100svh-96px)] overflow-hidden bg-[#050b18] text-white">
      <SwayingTreeBackground />

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-96px)] max-w-7xl items-start gap-10 px-5 pt-8 pb-10 sm:px-8 lg:gap-10 lg:pt-8 lg:pb-12">
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
            Every street has a story. Together, neighbors can turn everyday
            concerns into meaningful change.
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
              to="/explore"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 font-semibold text-slate-100 backdrop-blur-xl transition hover:border-white/30 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            >
              Explore CitiZen
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
      </div>
    </section>
  );
}

export default Hero;
