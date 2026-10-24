import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Users,
  MapPin,
  BrainCircuit,
  Eye,
  Route,
  Sparkles,
  Database,
  CircleAlert,
} from "lucide-react";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import cityInfrastructure from "../../assets/city-infrastructure.jpg";
import civicProblem from "../../assets/civic-problem.jpg";
import citizenReporting from "../../assets/citizen-reporting.jpg";
import cityFuture from "../../assets/city-future.jpg";

function About() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      {/* ================= HERO ================= */}

      <section className="relative min-h-[680px] flex items-center overflow-hidden">

        <img
          src={cityInfrastructure}
          alt="Urban city infrastructure"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40" />

        <div className="relative max-w-7xl mx-auto px-6 py-32 w-full">

          <div className="max-w-4xl">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-sm backdrop-blur">
              <Sparkles size={16} />
              The idea behind CitiZen
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mt-7">
              A city can only respond to the problems
              <span className="text-blue-500"> it can see.</span>
            </h1>

            <p className="mt-7 text-lg md:text-xl text-slate-300 max-w-3xl leading-8">
              CitiZen began with a simple observation: the people who
              experience a city's problems every day are also the people who
              see those problems first.
            </p>

            <p className="mt-4 text-slate-400 max-w-2xl leading-7">
              The challenge is turning those individual observations into
              information that can be understood, connected and acted upon.
            </p>

          </div>

        </div>
      </section>


      {/* ================= REAL WORLD SCALE ================= */}

      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="max-w-3xl">

          <p className="text-blue-400 uppercase tracking-[0.25em] font-semibold text-sm">
            The scale of the challenge
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Urban problems are becoming a systems problem.
          </h2>

          <p className="text-slate-400 mt-6 leading-8">
            India's cities are growing rapidly. As more people depend on urban
            infrastructure, everyday issues become increasingly important to
            how a city functions.
          </p>

        </div>


        <div className="grid md:grid-cols-3 gap-5 mt-14">

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">

            <span className="text-5xl font-bold text-blue-400">
              600M
            </span>

            <h3 className="text-xl font-semibold mt-5">
              Urban residents
            </h3>

            <p className="text-slate-400 mt-3 leading-7 text-sm">
              The World Bank estimates that around 600 million people could
              live in India's urban areas by 2036.
            </p>

          </div>


          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">

            <span className="text-5xl font-bold text-purple-400">
              $840B
            </span>

            <h3 className="text-xl font-semibold mt-5">
              Infrastructure need
            </h3>

            <p className="text-slate-400 mt-3 leading-7 text-sm">
              The World Bank estimated that India would need about $840 billion
              in urban infrastructure investment through 2036.
            </p>

          </div>


          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">

            <span className="text-5xl font-bold text-green-400">
              63%
            </span>

            <h3 className="text-xl font-semibold mt-5">
              Bengaluru pothole area
            </h3>

            <p className="text-slate-400 mt-3 leading-7 text-sm">
              BBMP data reported in 2025 showed a 63% year-on-year increase in
              the area of potholes filled in 2024–25.
            </p>

          </div>

        </div>

      </section>


      {/* ================= THE EVERYDAY PROBLEM ================= */}

      <section className="border-y border-white/10 bg-slate-900/40">

        <div className="max-w-7xl mx-auto px-6 py-24">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>

              <p className="text-red-400 uppercase tracking-[0.25em] font-semibold text-sm">
                The everyday problem
              </p>

              <h2 className="text-4xl md:text-5xl font-bold mt-4">
                The problem isn't always that nobody noticed.
              </h2>

              <p className="text-slate-400 mt-6 leading-8">
                Someone notices a pothole on their way to work.
                Someone photographs a leaking pipeline.
                Someone walks past an overflowing garbage point.
                Someone reports a broken streetlight.
              </p>

              <p className="text-slate-400 mt-5 leading-8">
                But after that first observation, information can become
                fragmented. Different people may report the same problem.
                Locations may be unclear. Updates may be difficult to follow.
              </p>

              <div className="mt-8 flex gap-4">

                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                  <CircleAlert size={24} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Visibility is not the same as coordination.
                  </h3>

                  <p className="text-slate-500 text-sm mt-2 leading-6">
                    Seeing a problem is the first step. Connecting the right
                    information around it is what makes that observation useful.
                  </p>
                </div>

              </div>

            </div>


            <div className="rounded-3xl overflow-hidden border border-white/10">

              <img
                src={civicProblem}
                alt="Civic infrastructure problem"
                className="w-full h-[480px] object-cover"
              />

            </div>

          </div>

        </div>

      </section>


      {/* ================= THE QUESTION ================= */}

      <section className="max-w-5xl mx-auto px-6 py-28">

        <div className="text-center">

          <p className="text-blue-400 uppercase tracking-[0.25em] font-semibold text-sm">
            The question
          </p>

          <h2 className="text-4xl md:text-6xl font-bold mt-5 leading-tight">
            What if every civic observation could become part of
            <span className="text-blue-500"> one connected record?</span>
          </h2>

          <p className="text-slate-400 text-lg leading-8 mt-7 max-w-3xl mx-auto">
            That question became the foundation of CitiZen.
          </p>

        </div>

      </section>


      {/* ================= THE IDEA ================= */}

      <section className="max-w-7xl mx-auto px-6 pb-24">

        <div className="grid lg:grid-cols-2 gap-14 items-center">

          <div className="rounded-3xl overflow-hidden border border-white/10">

            <img
              src={citizenReporting}
              alt="Citizen reporting a civic issue"
              className="w-full h-[450px] object-cover"
            />

          </div>


          <div>

            <p className="text-purple-400 uppercase tracking-[0.25em] font-semibold text-sm">
              The CitiZen idea
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mt-4">
              A report should be the beginning, not the end.
            </h2>

            <p className="text-slate-400 mt-6 leading-8">
              CitiZen treats a civic report as more than a complaint form.
              It becomes a structured record containing evidence, location,
              category, severity, status and activity.
            </p>

            <p className="text-slate-400 mt-5 leading-8">
              This creates a common language between citizens, communities and
              the systems responsible for responding to civic issues.
            </p>

            <div className="mt-8 space-y-5">

              <div className="flex gap-4">
                <Eye className="text-blue-400 shrink-0" />
                <span className="text-slate-300">
                  Observe what is happening.
                </span>
              </div>

              <div className="flex gap-4">
                <Database className="text-purple-400 shrink-0" />
                <span className="text-slate-300">
                  Structure the information.
                </span>
              </div>

              <div className="flex gap-4">
                <Route className="text-green-400 shrink-0" />
                <span className="text-slate-300">
                  Follow its journey toward resolution.
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= HOW THE IDEA FLOWS ================= */}

      <section className="border-y border-white/10 bg-slate-900/40">

        <div className="max-w-7xl mx-auto px-6 py-24">

          <div className="text-center max-w-3xl mx-auto">

            <p className="text-blue-400 uppercase tracking-[0.25em] font-semibold text-sm">
              From observation to action
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mt-4">
              One continuous civic journey.
            </h2>

          </div>


          <div className="grid md:grid-cols-5 gap-4 mt-14">

            {[
              ["01", "Observe", Users],
              ["02", "Report", MapPin],
              ["03", "Understand", BrainCircuit],
              ["04", "Act", Building2],
              ["05", "Track", Route],
            ].map(([number, title, Icon]: any) => (

              <div
                key={number}
                className="relative rounded-2xl border border-white/10 bg-slate-950 p-7 text-center"
              >

                <span className="text-blue-500 font-bold text-sm">
                  {number}
                </span>

                <div className="flex justify-center mt-5">
                  <Icon size={27} className="text-slate-300" />
                </div>

                <h3 className="font-semibold mt-4">
                  {title}
                </h3>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================= BIGGER IDEA ================= */}

      <section className="relative overflow-hidden">

        <img
          src={cityFuture}
          alt="Future city"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />

        <div className="relative max-w-7xl mx-auto px-6 py-28">

          <div className="max-w-3xl">

            <p className="text-blue-400 uppercase tracking-[0.25em] font-semibold text-sm">
              The bigger idea
            </p>

            <h2 className="text-4xl md:text-6xl font-bold mt-5 leading-tight">
              Cities shouldn't only react to problems.
              <span className="text-blue-500">
                {" "}They should learn from them.
              </span>
            </h2>

            <p className="text-slate-400 text-lg mt-7 leading-8">
              A collection of structured civic reports can become more than a
              list of complaints. Over time, it can reveal recurring locations,
              issue categories and patterns that are difficult to see from
              individual reports alone.
            </p>

            <Link
              to="/report"
              className="inline-flex items-center gap-2 mt-9 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold"
            >
              Contribute a Report
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>

      </section>


      {/* ================= SOURCE NOTE ================= */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        <p className="text-xs text-slate-600 leading-6">
          Statistics referenced from World Bank assessments of India's urban
          infrastructure and urbanization, and publicly reported BBMP data on
          Bengaluru pothole filling. Figures represent the cited reporting
          periods and should not be interpreted as current live measurements.
        </p>

      </section>


      <Footer />

    </div>
  );
}

export default About;
