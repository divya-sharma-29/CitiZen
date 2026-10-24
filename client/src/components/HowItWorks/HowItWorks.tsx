import {
  Camera,
  BrainCircuit,
  Building2,
  MapPinned,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Capture",
    description:
      "Take a photo or upload evidence of the civic issue with its location.",
  },
  {
    icon: BrainCircuit,
    title: "AI Analysis",
    description:
      "AI detects the issue type, checks duplicates, and assigns priority.",
  },
  {
    icon: Building2,
    title: "Authority Assignment",
    description:
      "The responsible department receives the report instantly.",
  },
  {
    icon: MapPinned,
    title: "Track Progress",
    description:
      "Citizens monitor every stage through live status updates.",
  },
  {
    icon: CheckCircle2,
    title: "Issue Resolved",
    description:
      "Authorities complete the task and notify citizens with proof.",
  },
];

function HowItWorks() {
  return (
    <section className="bg-slate-900 text-white py-28 px-8">

      <div className="max-w-7xl mx-auto">

        <p className="uppercase tracking-[0.3em] text-blue-400 text-center font-semibold">
          Workflow
        </p>

        <h2 className="text-5xl font-bold text-center mt-6">
          How CitiZen Works
        </h2>

        <p className="text-center text-gray-400 max-w-3xl mx-auto mt-6 leading-8">
          From reporting a problem to resolving it, every step is transparent,
          AI-assisted, and trackable in real time.
        </p>

        <div className="grid md:grid-cols-5 gap-8 mt-20">

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={index}
                className="relative text-center"
              >

                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mx-auto shadow-lg">

                  <Icon size={36} />

                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-4 text-gray-400 leading-7">
                  {step.description}
                </p>

                {index !== steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[70%] w-full h-[2px] bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                )}

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}

export default HowItWorks;