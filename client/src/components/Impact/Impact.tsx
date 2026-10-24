import {
  Activity,
  BrainCircuit,
  Clock3,
  Building2,
} from "lucide-react";

function Impact() {
  return (
    <section className="bg-slate-900 text-white py-28 px-8">

      <div className="max-w-7xl mx-auto">

        <p className="uppercase tracking-[0.3em] text-blue-400 text-center font-semibold">
          Impact Dashboard
        </p>

        <h2 className="text-5xl font-bold text-center mt-6">
          Making Cities Smarter Every Day
        </h2>

        <p className="text-gray-400 text-center max-w-3xl mx-auto mt-6 leading-8">
          AI-powered insights help authorities respond faster,
          improve transparency, and create safer communities.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">

            <Activity className="mx-auto text-blue-400" size={40} />

            <h3 className="text-5xl font-bold mt-6">
              12K+
            </h3>

            <p className="mt-4 text-gray-400">
              Reports Submitted
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">

            <BrainCircuit className="mx-auto text-green-400" size={40} />

            <h3 className="text-5xl font-bold mt-6">
              97%
            </h3>

            <p className="mt-4 text-gray-400">
              AI Accuracy
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">

            <Clock3 className="mx-auto text-yellow-400" size={40} />

            <h3 className="text-5xl font-bold mt-6">
              3.2 hrs
            </h3>

            <p className="mt-4 text-gray-400">
              Avg. Response Time
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">

            <Building2 className="mx-auto text-cyan-400" size={40} />

            <h3 className="text-5xl font-bold mt-6">
              48
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