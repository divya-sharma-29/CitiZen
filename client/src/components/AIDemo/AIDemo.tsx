import {
  BrainCircuit,
  Image,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

function AIDemo() {
  return (
    <section className="bg-slate-950 text-white py-28 px-8">

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

        {/* Left */}

        <div>

          <p className="uppercase tracking-[0.3em] text-blue-400 font-semibold">
            AI Intelligence
          </p>

          <h2 className="text-5xl font-bold mt-6 leading-tight">
            Artificial Intelligence
            <br />
            Working Behind Every Report
          </h2>

          <p className="mt-8 text-gray-400 leading-8 text-lg">
            CitiZen doesn't simply collect complaints.
            Our AI understands images, detects duplicate reports,
            prioritizes emergencies, and helps authorities respond
            faster than traditional systems.
          </p>

          <div className="mt-12 space-y-8">

            <div className="flex gap-4">

              <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center">
                <Image size={26}/>
              </div>

              <div>

                <h3 className="text-xl font-semibold">
                  Image Recognition
                </h3>

                <p className="text-gray-400 mt-2">
                  Detects potholes, garbage,
                  water leakage and damaged roads.
                </p>

              </div>

            </div>

            <div className="flex gap-4">

              <div className="w-14 h-14 rounded-xl bg-green-600 flex items-center justify-center">
                <BrainCircuit size={26}/>
              </div>

              <div>

                <h3 className="text-xl font-semibold">
                  Smart Prioritization
                </h3>

                <p className="text-gray-400 mt-2">
                  Assigns severity scores automatically
                  using AI.
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
                  Prevents multiple reports
                  for the same issue.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Right */}

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8">

          <h3 className="text-2xl font-bold">
            AI Analysis
          </h3>

          <div className="mt-8 space-y-6">

            <div>

              <div className="flex justify-between">

                <span>Pothole Detection</span>

                <span className="text-green-400">
                  98%
                </span>

              </div>

              <div className="mt-2 h-3 bg-slate-700 rounded-full">

                <div className="w-[98%] h-full rounded-full bg-green-500"></div>

              </div>

            </div>

            <div>

              <div className="flex justify-between">

                <span>Duplicate Match</span>

                <span className="text-blue-400">
                  94%
                </span>

              </div>

              <div className="mt-2 h-3 bg-slate-700 rounded-full">

                <div className="w-[94%] h-full rounded-full bg-blue-500"></div>

              </div>

            </div>

            <div>

              <div className="flex justify-between">

                <span>Priority Score</span>

                <span className="text-red-400">
                  Critical
                </span>

              </div>

              <div className="mt-2 h-3 bg-slate-700 rounded-full">

                <div className="w-full h-full rounded-full bg-red-500"></div>

              </div>

            </div>

          </div>

          <div className="mt-10 p-5 rounded-xl bg-slate-900">

            <div className="flex gap-3">

              <CheckCircle2
                className="text-green-400"
              />

              <p className="text-gray-300">
                AI has verified this report and
                automatically assigned it to
                the Road Maintenance Department.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default AIDemo;