import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../../lib/api";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Users,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";

type RegistrationRole = "citizen" | "authority";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<RegistrationRole>("citizen");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [department, setDepartment] = useState("");
  async function handleRegister() {
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (role === "authority" && !department) {
      setError("Please select your department.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        apiUrl("/api/auth/register"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
            department: role === "authority" ? department : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      if (role === "authority") {
        // Authority accounts need admin approval, so no auto-login.
        setSuccess(
          "Registration submitted! Your authority access must be approved before you can use the Authority Dashboard."
        );
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      // Citizen: sign in automatically and go straight to the dashboard.
      let token: string | undefined = data.token;
      let sessionUser = data.user;

      // If the register response has no token (e.g. older backend still
      // running), log in with the credentials the user just entered.
      if (!token) {
        const loginResponse = await fetch(apiUrl("/api/auth/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const loginData = await loginResponse.json().catch(() => null);

        if (loginResponse.ok && loginData?.token && loginData?.user) {
          token = loginData.token;
          sessionUser = loginData.user;
        }
      }

      if (token && sessionUser) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(sessionUser));
        window.dispatchEvent(new Event("citizen-session-changed"));
        navigate("/dashboard", { replace: true });
        return;
      }

      // Last resort: send them to the login page.
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full bg-slate-900/70 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-blue-500 transition";

  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-3 text-white sm:px-8">
      <div className="grid w-full max-w-6xl items-center gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <Link to="/" aria-label="CitiZen home">
            <img
              src="/logo.png"
              alt="CitiZen Logo"
              className="h-12 w-12 rounded-xl shadow-lg shadow-cyan-950/30 sm:h-14 sm:w-14"
            />
          </Link>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 lg:mt-5">
            CitiZen community
          </p>
          <h2 className="mt-1 max-w-md text-2xl font-bold leading-tight sm:text-3xl lg:mt-3 lg:text-4xl">
            Make your voice part of the change.
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-300 sm:text-base lg:mt-4 lg:leading-7">
            Create an account to report local issues, follow their progress, and
            help your neighborhood move forward.
          </p>
          <Link
            to="/"
            className="mt-3 text-sm text-slate-400 transition hover:text-white lg:mt-6"
          >
            â† Back to CitiZen
          </Link>
        </div>

        <div className="w-full rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:p-5 lg:p-6">
          <h1 className="text-xl font-bold sm:text-2xl">
            Create your account
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Choose how you want to contribute to a better city.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-3 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300"
            >
              {success}
            </div>
          )}

          {/* Role selection */}
          <div className="mt-3">
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              I want to register as
            </label>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setRole("citizen")}
                aria-pressed={role === "citizen"}
                className={`relative flex items-start gap-2 rounded-xl border p-2.5 text-left transition sm:p-3 ${
                  role === "citizen"
                    ? "border-blue-400 bg-blue-500/15 ring-1 ring-blue-400"
                    : "border-white/10 bg-slate-900/50 hover:border-white/30"
                }`}
              >
                {role === "citizen" && (
                  <CheckCircle2
                    size={19}
                    className="absolute top-3 right-3 text-blue-400"
                  />
                )}

                <Users size={20} className="mt-0.5 shrink-0 text-blue-400" />
                <div>
                  <h2 className="font-semibold">Citizen</h2>
                  <p className="mt-1 text-xs leading-4 text-gray-400">
                    Report issues and track progress.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("authority")}
                aria-pressed={role === "authority"}
                className={`relative flex items-start gap-2 rounded-xl border p-2.5 text-left transition sm:p-3 ${
                  role === "authority"
                    ? "border-cyan-400 bg-cyan-500/15 ring-1 ring-cyan-400"
                    : "border-white/10 bg-slate-900/50 hover:border-white/30"
                }`}
              >
                {role === "authority" && (
                  <CheckCircle2
                    size={19}
                    className="absolute top-3 right-3 text-cyan-400"
                  />
                )}

                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-cyan-400" />
                <div>
                  <h2 className="font-semibold">Civic Authority</h2>
                  <p className="mt-1 text-xs leading-4 text-gray-400">
                    Manage reports after approval.
                  </p>
                  <span className="mt-1 inline-block text-[11px] text-cyan-300">
                    Approval required
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-x-3 gap-y-2.5 sm:grid-cols-2">
          {/* Name */}
          <div>
            <label htmlFor="register-name" className="text-sm text-gray-300">
              Full Name
            </label>

              <div className="relative mt-1">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="register-email" className="text-sm text-gray-300">
              Email Address
            </label>

            <div className="relative mt-1">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="register-password"
              className="text-sm text-gray-300"
            >
              Password
            </label>

            <div className="relative mt-1">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password (8+ characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-12`}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {role === "authority" && (
            <div>
              <label htmlFor="department" className="text-sm text-gray-300">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={department}
                onChange={(e) => { setDepartment(e.target.value); setError(""); }}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-2.5 text-white outline-none transition focus:border-blue-500"
                required
              >
                <option value="">Select your department</option>
                <option value="Roads and Infrastructure">Roads and Infrastructure</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Drainage">Drainage</option>
                <option value="Street Lighting">Street Lighting</option>
              </select>
            </div>
          )}
          </div>

          {role === "authority" && (
            <p className="mt-2 text-xs text-cyan-200">
              Authority access is available after administrator approval.
            </p>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleRegister}
            disabled={submitting}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create {role === "citizen" ? "Citizen" : "Authority"} Account
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="mt-2 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300"
            >
              Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;
