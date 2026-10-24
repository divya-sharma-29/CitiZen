import {
  Camera,
  BrainCircuit,
  Route,
  Eye,
} from "lucide-react";

const highlights = [
  {
    icon: Camera,
    number: "01",
    title: "Report in seconds",
    description:
      "Capture a civic problem, add the relevant details and submit it with its real-world location.",
  },
  {
    icon: BrainCircuit,
    number: "02",
    title: "Let CitiZen organize it",
    description:
      "Reports can be structured using categories, priority information and intelligent analysis.",
  },
  {
    icon: Route,
    number: "03",
    title: "Follow what happens next",
    description:
      "Track the journey of an issue as it moves through review, assignment, progress and resolution.",
  },
  {
    icon: Eye,
    number: "04",
    title: "Keep the process visible",
    description:
      "Citizens can understand the current state of reported issues instead of losing visibility after submission.",
  },
];

function Features() {
  return (
    <section className="bg-slate-950 text-white py-28 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="max-w-3xl">
          <p className="uppercase tracking-[0.3em] text-blue-400 font-semibold text-sm">
            How CitiZen works
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-5 leading-tight">
            A civic issue should not
            <span className="text-blue-500"> disappear after you report it.</span>
          </h2>

          <p className="text-slate-400 mt-6 text-lg leading-8">
            CitiZen is designed around the complete journey of a civic issue —
            from the moment a citizen notices a problem to the moment its
            progress becomes visible.
          </p>
        </div>

        {/* PROCESS CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">

          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.number}
                className="group relative rounded-3xl border border-white/10 bg-white/[0.03] p-7 hover:border-blue-500/40 hover:bg-blue-500/[0.04] transition duration-300"
              >

                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                    <Icon size={23} />
                  </div>

                  <span className="text-sm font-bold text-slate-600">
                    {item.number}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mt-7">
                  {item.title}
                </h3>

                <p className="text-slate-400 mt-4 leading-7 text-sm">
                  {item.description}
                </p>

              </div>
            );
          })}

        </div>

        {/* BOTTOM STATEMENT */}
        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <p className="text-slate-400 max-w-2xl leading-7">
            One platform connects the citizen, the issue, the authority and
            the resolution.
          </p>

          <div className="text-blue-400 font-semibold">
            Citizen → Intelligence → Action → Resolution
          </div>

        </div>

      </div>
    </section>
  );
}

export default Features;