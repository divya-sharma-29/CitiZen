import Button from "../Button/Button";
import {
  MapPin,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";

function Hero() {
  return (
    <section className="min-h-[90vh] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16">

        {/* ================= LEFT ================= */}

        <div className="flex-1">

          <p className="uppercase tracking-[0.3em] text-blue-400 font-semibold">
            AI-Powered Civic Intelligence Platform
          </p>

          <h1 className="mt-6 text-5xl md:text-7xl font-extrabold leading-tight">
            See.
            <br />
            <span className="text-blue-500">
              Report.
            </span>
            <br />
            Transform.
          </h1>

          <p className="mt-8 text-xl text-gray-300 leading-8 max-w-2xl">
            Building Better Cities, Together.
          </p>

          <p className="mt-6 text-lg text-gray-400 max-w-xl leading-8">
            Empowering citizens to report civic issues instantly,
            enabling AI-powered verification, and helping authorities
            resolve problems faster with complete transparency.
          </p>

          {/* Buttons */}

          <div className="mt-10 flex flex-wrap gap-5">

            <Button
              text="Start Reporting"
              to="/login"
            />

            <Button
              text="Learn More"
              to="/"
              variant="secondary"
            />

          </div>

          {/* Trust Indicators */}

          <div className="mt-10 flex flex-wrap gap-8 text-gray-300 text-sm">

            <div className="flex items-center gap-2">
              <ShieldCheck
                size={18}
                className="text-green-400"
              />
              <span>AI Verified Reports</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin
                size={18}
                className="text-blue-400"
              />
              <span>Live Tracking</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2
                size={18}
                className="text-yellow-400"
              />
              <span>Anonymous Reporting</span>
            </div>

          </div>

        </div>

        {/* ================= RIGHT ================= */}

        <div className="flex-1 flex justify-center items-center relative">

          {/* Bigger Glow */}

          <div className="absolute w-[650px] h-[650px] bg-blue-500/20 rounded-full blur-[140px]"></div>

          {/* Dashboard Card */}

          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-[430px] shadow-[0_20px_80px_rgba(37,99,235,0.35)]">

            {/* Header */}

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <img
                  src="/logo.png"
                  alt="logo"
                  className="w-11 h-11 rounded-lg"
                />

                <div>
                  <h2 className="font-bold text-2xl">
                    CitiZen
                  </h2>

                  <p className="text-gray-400 text-sm">
                    AI Civic Dashboard
                  </p>
                </div>

              </div>

              <span className="bg-green-500/20 text-green-400 px-4 py-1 rounded-full text-sm">
                Live
              </span>

            </div>

            {/* Statistics */}

            <div className="grid grid-cols-2 gap-4 mt-8">

              <div className="bg-slate-900/60 rounded-xl p-4">

                <p className="text-gray-400 text-sm">
                  Active Reports
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  1,248
                </h3>

              </div>

              <div className="bg-slate-900/60 rounded-xl p-4">

                <p className="text-gray-400 text-sm">
                  AI Accuracy
                </p>

                <h3 className="text-3xl font-bold text-green-400 mt-2">
                  97%
                </h3>

              </div>

              <div className="bg-slate-900/60 rounded-xl p-4">

                <p className="text-gray-400 text-sm">
                  Authorities Online
                </p>

                <h3 className="text-3xl font-bold text-blue-400 mt-2">
                  48
                </h3>

              </div>

              <div className="bg-slate-900/60 rounded-xl p-4">

                <p className="text-gray-400 text-sm">
                  Resolved Today
                </p>

                <h3 className="text-3xl font-bold text-emerald-400 mt-2">
                  312
                </h3>

              </div>

            </div>

            {/* Progress */}

            <div className="mt-8">

              <div className="flex justify-between text-sm">

                <span>Today's Resolution</span>

                <span className="font-semibold">
                  92%
                </span>

              </div>

              <div className="mt-3 h-3 rounded-full bg-slate-700 overflow-hidden">

                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>

              </div>

            </div>

            {/* Recent Report */}

            <div className="mt-8 rounded-xl bg-slate-900/60 p-4">

              <p className="text-sm text-gray-400">
                Latest Verified Report
              </p>

              <div className="flex justify-between items-center mt-3">

                <div>

                  <p className="font-semibold">
                    Road Damage
                  </p>

                  <p className="text-sm text-gray-400">
                    MG Road • Bengaluru
                  </p>

                </div>

                <span className="text-green-400 font-semibold">
                  Verified
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;