import { Link } from "react-router-dom";
import {
  ArrowRight,
  Map,
  ClipboardList,
  Bell,
  BrainCircuit,
  MapPinned,
  Users,
  ShieldCheck,
  Camera,
  GitCompare,
  Gauge,
  BarChart3,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ExploreVisual from "./ExploreVisual";

import citizenReporting from "../../assets/citizen-reporting.jpg";
import civicDashboard from "../../assets/civic-dashboard.jpg";

function Features() {

  const intelligenceFeatures = [
    {
      icon: BrainCircuit,
      title: "AI-Assisted Classification",
      text: "Transform unstructured civic observations into meaningful issue categories that can be processed by the platform.",
    },
    {
      icon: GitCompare,
      title: "Duplicate Detection",
      text: "Nearby reports with related categories can be identified as potentially describing the same underlying issue.",
    },
    {
      icon: Gauge,
      title: "Priority Scoring",
      text: "Issue category and severity can contribute to a priority score, helping distinguish routine reports from urgent cases.",
    },
    {
      icon: MapPinned,
      title: "Location Intelligence",
      text: "Geographic information connects reports to real-world places and helps identify nearby civic issues.",
    },
  ];


  const citizenFeatures = [
    {
      icon: Camera,
      title: "Evidence-first reporting",
      text: "Attach photographs and descriptions so a report contains useful evidence rather than only a complaint.",
    },
    {
      icon: Map,
      title: "Civic Map",
      text: "Explore reported problems geographically and understand what is happening around a particular area.",
    },
    {
      icon: ClipboardList,
      title: "Personal Report History",
      text: "Keep track of submitted issues and follow their progress from your own account.",
    },
    {
      icon: Bell,
      title: "Status Notifications",
      text: "Receive updates when important changes occur to your reports.",
    },
  ];


  const authorityFeatures = [
    {
      icon: ShieldCheck,
      title: "Authority Workspace",
      text: "Give responsible authorities a dedicated environment for reviewing incoming civic issues.",
    },
    {
      icon: Users,
      title: "Community Context",
      text: "Community interactions can provide additional information around issues affecting multiple people.",
    },
    {
      icon: BarChart3,
      title: "Civic Analytics",
      text: "Structured reports can be aggregated to understand categories, locations and recurring patterns.",
    },
  ];


  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Navbar />


      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden border-b border-white/10">

        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-slate-950 to-slate-950" />

        <div className="relative max-w-7xl mx-auto grid items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-16">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 text-sm">
              <Sparkles size={16} />
              Explore CitiZen
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.08] mt-7">
              Civic observations deserve a clear path to action.
            </h1>

            <p className="mt-7 text-lg md:text-xl text-slate-400 max-w-3xl leading-8">
              The people who experience a city's problems often see them first.
              CitiZen gives those observations a shared, structured record so
              communities and responsible teams can understand what needs
              attention and follow what happens next.
            </p>

          </div>

          <ExploreVisual />

        </div>

      </section>


      {/* ================= WHY CITIZEN ================= */}

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-cyan-300 uppercase tracking-[0.25em] font-semibold text-sm">
            The context
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Everyday issues add up to a citywide challenge.
          </h2>
          <p className="text-slate-400 mt-6 leading-8">
            Urban growth puts more pressure on infrastructure. Clear, connected
            reports help make local problems easier to understand alongside
            that larger picture.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-12">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <span className="text-4xl font-bold text-cyan-300">600M</span>
            <h3 className="text-lg font-semibold mt-4">Urban residents</h3>
            <p className="text-slate-400 mt-3 leading-7 text-sm">
              The World Bank estimates that around 600 million people could
              live in India's urban areas by 2036.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <span className="text-4xl font-bold text-blue-300">$840B</span>
            <h3 className="text-lg font-semibold mt-4">Infrastructure need</h3>
            <p className="text-slate-400 mt-3 leading-7 text-sm">
              The World Bank estimated India would need about $840 billion in
              urban infrastructure investment through 2036.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <span className="text-4xl font-bold text-emerald-300">63%</span>
            <h3 className="text-lg font-semibold mt-4">Bengaluru pothole area</h3>
            <p className="text-slate-400 mt-3 leading-7 text-sm">
              BBMP data reported in 2025 showed a 63% year-on-year increase in
              the area of potholes filled in 2024–25.
            </p>
          </div>
        </div>
        <p className="mt-6 text-xs text-slate-600 leading-6">
          Figures are from the cited reporting periods, based on World Bank
          assessments of India's urban infrastructure and urbanization and
          publicly reported BBMP data. They are historical context, not live
          measurements.
        </p>
      </section>


      {/* ================= CITIZEN REPORTING ================= */}

      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>

            <p className="text-blue-400 uppercase tracking-[0.25em] font-semibold text-sm">
              01 / Capture
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mt-4">
              Make reporting simple enough to happen in seconds.
            </h2>

            <p className="text-slate-400 mt-6 leading-8">
              Citizens shouldn't need to understand municipal departments,
              technical categories or complicated forms before reporting a
              problem.
            </p>

            <p className="text-slate-400 mt-5 leading-8">
              CitiZen starts with what the citizen actually has: an
              observation, a photograph, a description and a location.
            </p>

            <Link
              to="/report"
              className="inline-flex items-center gap-2 mt-7 text-blue-400 font-semibold hover:text-blue-300"
            >
              Report an Issue
              <ArrowRight size={17} />
            </Link>

          </div>


          <div className="rounded-3xl overflow-hidden border border-white/10">

            <img
              src={citizenReporting}
              alt="Citizen reporting an issue"
              className="w-full h-[450px] object-cover"
            />

          </div>

        </div>


        <div className="grid md:grid-cols-2 gap-5 mt-14">

          {citizenFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 hover:border-blue-500/30 transition"
              >

                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Icon size={23} />
                </div>

                <h3 className="text-xl font-semibold mt-5">
                  {feature.title}
                </h3>

                <p className="text-slate-400 text-sm mt-3 leading-7">
                  {feature.text}
                </p>

              </div>
            );
          })}

        </div>

      </section>


      {/* ================= INTELLIGENCE ================= */}

      <section className="border-y border-white/10 bg-slate-900/40">

        <div className="max-w-7xl mx-auto px-6 py-24">

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>

              <p className="text-purple-400 uppercase tracking-[0.25em] font-semibold text-sm">
                02 / Intelligence
              </p>

              <h2 className="text-4xl md:text-5xl font-bold mt-4">
                Don't just collect reports.
                <span className="text-purple-400">
                  {" "}understand them.
                </span>
              </h2>

              <p className="text-slate-400 mt-6 leading-8">
                A city may receive many reports about roads, drainage, water,
                waste and lighting. The value of the data increases when those
                reports can be organized and connected.
              </p>

              <div className="mt-8 p-6 rounded-2xl border border-purple-500/20 bg-purple-500/5">

                <div className="flex items-center gap-3 text-purple-300 font-semibold">
                  <BrainCircuit size={22} />
                  Intelligence pipeline
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-5 text-sm">

                  <span className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    Image
                  </span>

                  <ArrowRight size={15} />

                  <span className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    Category
                  </span>

                  <ArrowRight size={15} />

                  <span className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    Location
                  </span>

                  <ArrowRight size={15} />

                  <span className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    Severity
                  </span>

                  <ArrowRight size={15} />

                  <span className="px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-400/20 text-purple-300">
                    Priority
                  </span>

                </div>

              </div>

            </div>


            <div className="grid sm:grid-cols-2 gap-5">

              {intelligenceFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-white/10 bg-slate-950 p-6 hover:border-purple-500/30 transition"
                  >

                    <Icon
                      size={25}
                      className="text-purple-400"
                    />

                    <h3 className="font-semibold text-lg mt-5">
                      {feature.title}
                    </h3>

                    <p className="text-slate-400 text-sm mt-3 leading-6">
                      {feature.text}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>

        </div>

      </section>


      {/* ================= DUPLICATE PROBLEM ================= */}

      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">

          <div className="grid lg:grid-cols-2">

            <div className="p-10 md:p-14">

              <p className="text-orange-400 uppercase tracking-[0.25em] font-semibold text-sm">
                03 / De-duplication
              </p>

              <h2 className="text-4xl md:text-5xl font-bold mt-4">
                Ten reports don't always mean ten problems.
              </h2>

              <p className="text-slate-400 mt-6 leading-8">
                Multiple people may report the same pothole, leak or damaged
                streetlight. Treating every report as an unrelated problem can
                make civic information harder to interpret.
              </p>

              <div className="mt-8 space-y-4">

                <div className="flex gap-4">

                  <GitCompare className="text-orange-400 shrink-0" />

                  <p className="text-slate-300 text-sm leading-6">
                    Compare nearby reports.
                  </p>

                </div>

                <div className="flex gap-4">

                  <MapPinned className="text-orange-400 shrink-0" />

                  <p className="text-slate-300 text-sm leading-6">
                    Consider geographic proximity.
                  </p>

                </div>

                <div className="flex gap-4">

                  <CheckCircle2 className="text-orange-400 shrink-0" />

                  <p className="text-slate-300 text-sm leading-6">
                    Identify potentially related issues.
                  </p>

                </div>

              </div>

            </div>


            <div className="bg-slate-950 p-10 md:p-14 flex items-center">

              <div className="w-full">

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

                  <div className="flex justify-between items-center">

                    <span className="text-sm text-slate-400">
                      Nearby reports
                    </span>

                    <span className="text-orange-400 text-sm font-semibold">
                      Potential match
                    </span>

                  </div>

                  <div className="mt-6 space-y-3">

                    {[
                      "Road damage · 120m",
                      "Road damage · 85m",
                      "Road damage · 42m",
                    ].map((item) => (

                      <div
                        key={item}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-white/10"
                      >

                        <span className="text-sm">
                          {item}
                        </span>

                        <MapPinned
                          size={17}
                          className="text-orange-400"
                        />

                      </div>

                    ))}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= AUTHORITY ================= */}

      <section className="border-y border-white/10 bg-slate-900/40">

        <div className="max-w-7xl mx-auto px-6 py-16">

          <div className="grid lg:grid-cols-2 gap-10 items-center">

            <div className="order-2 lg:order-1">

              <img
                src={civicDashboard}
                alt="Civic analytics dashboard"
                className="w-full h-[260px] sm:h-[320px] lg:h-[420px] object-cover rounded-3xl border border-white/10"
              />

            </div>


            <div className="order-1 lg:order-2">

              <p className="text-green-400 uppercase tracking-[0.25em] font-semibold text-sm">
                04 / Authority workflow
              </p>

              <h2 className="text-4xl md:text-5xl font-bold mt-4">
                From incoming reports to organized action.
              </h2>

              <p className="text-slate-400 mt-6 leading-8">
                CitiZen gives authorities a structured view of the issues
                arriving from the community instead of forcing them to work
                from disconnected complaints.
              </p>

              <div className="mt-8 space-y-4">

                {[
                  "Review incoming reports",
                  "Understand location and severity",
                  "Assign responsibility",
                  "Update issue status",
                  "Record resolution",
                ].map((item, index) => (

                  <div
                    key={item}
                    className="flex items-center gap-4"
                  >

                    <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </div>

                    <span className="text-slate-300">
                      {item}
                    </span>

                  </div>

                ))}

              </div>

              <Link
                to="/authority"
                className="inline-flex items-center gap-2 mt-7 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition font-semibold"
              >
                Open Authority Portal
                <ArrowRight size={18} />
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* ================= AUTHORITY TOOLS ================= */}

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-green-400 uppercase tracking-[0.25em] font-semibold text-sm">
            Tools for response teams
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mt-4">
            A clearer workspace for coordinated action.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-10">
          {authorityFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 sm:p-7"
              >
                <div className="w-11 h-11 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold mt-5 text-lg">{feature.title}</h3>
                <p className="text-slate-400 text-sm mt-2 leading-6">
                  {feature.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>


      {/* ================= LIFECYCLE ================= */}

      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center max-w-3xl mx-auto">

          <p className="text-blue-400 uppercase tracking-[0.25em] font-semibold text-sm">
            05 / Traceability
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Every issue has a lifecycle.
          </h2>

          <p className="text-slate-400 mt-5 leading-8">
            A civic report should remain understandable after it is submitted.
            CitiZen keeps its status and activity connected throughout the
            workflow.
          </p>

        </div>


        <div className="grid md:grid-cols-5 gap-4 mt-14">

          {[
            ["01", "Reported"],
            ["02", "Reviewed"],
            ["03", "Assigned"],
            ["04", "In Progress"],
            ["05", "Resolved"],
          ].map(([number, title]) => (

            <div
              key={number}
              className="rounded-2xl border border-white/10 bg-slate-950 p-7 text-center"
            >

              <div className="text-blue-500 text-sm font-bold">
                {number}
              </div>

              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mt-5">
                <CheckCircle2 size={19} />
              </div>

              <h3 className="font-semibold mt-4">
                {title}
              </h3>

            </div>

          ))}

        </div>

      </section>


      {/* ================= FINAL CTA ================= */}

      <section className="max-w-5xl mx-auto px-6 pb-24">

        <div className="rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 p-10 md:p-16 text-center">

          <Sparkles className="mx-auto" size={30} />

          <h2 className="text-4xl md:text-5xl font-bold mt-6">
            See the system in action.
          </h2>

          <p className="text-blue-100 max-w-2xl mx-auto mt-5 leading-7">
            Report an issue, explore the civic map or follow the complete
            journey from observation to resolution.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">

            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition"
            >
              Report an Issue
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/civic-map"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 hover:bg-white/10 transition font-semibold"
            >
              Explore Civic Map
              <Map size={18} />
            </Link>

          </div>

        </div>

      </section>


      <Footer />

    </div>
  );
}

export default Features;
