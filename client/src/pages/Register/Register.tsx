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
        setSuccess(
          "Registration submitted! Your authority access must be approved before you can use the Authority Dashboard."
        );
      } else {
        setSuccess(
          "Account created successfully! Redirecting to login..."
        );
      }

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
    "w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-500 transition";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img
              src="/logo.png"
              alt="CitiZen Logo"
              className="w-14 h-14"
            />
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-center">
            Create your account
          </h1>

          <p className="text-gray-400 text-center mt-3">
            Choose how you want to contribute to a better city.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-5 bg-green-500/10 border border-green-500/30 text-green-300 rounded-xl px-4 py-3 text-sm"
            >
              {success}
            </div>
          )}

          {/* Role selection */}
          <div className="mt-7">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              I want to register as
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("citizen")}
                aria-pressed={role === "citizen"}
                className={`relative text-left p-4 rounded-2xl border transition ${
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

                <Users size={27} className="text-blue-400 mb-3" />

                <h2 className="font-semibold">Citizen</h2>

                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  Report civic issues, track complaints, and help improve your neighbourhood.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole("authority")}
                aria-pressed={role === "authority"}
                className={`relative text-left p-4 rounded-2xl border transition ${
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

                <ShieldCheck size={27} className="text-cyan-400 mb-3" />

                <h2 className="font-semibold">Civic Authority</h2>

                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  Manage assigned civic reports and update resolution progress after approval.
                </p>

                <span className="inline-block mt-3 text-xs text-cyan-300">
                  Approval required
                </span>
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="mt-6">
            <label htmlFor="register-name" className="text-sm text-gray-300">
              Full Name
            </label>

            <div className="relative mt-2">
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
          <div className="mt-5">
            <label htmlFor="register-email" className="text-sm text-gray-300">
              Email Address
            </label>

            <div className="relative mt-2">
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
          <div className="mt-5">
            <label
              htmlFor="register-password"
              className="text-sm text-gray-300"
            >
              Password
            </label>

            <div className="relative mt-2">
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
    <label htmlFor="department">Department</label>
    <select
      id="department"
      name="department"
      value={department}
      onChange={(e) => { setDepartment(e.target.value); setError(""); }}
      required
    >
      <option value="">Select your department</option>
      <option value="Roads and Infrastructure">
        Roads and Infrastructure
      </option>
      <option value="Water Supply">Water Supply</option>
      <option value="Sanitation">Sanitation</option>
      <option value="Drainage">Drainage</option>
      <option value="Street Lighting">Street Lighting</option>
    </select>
  </div>
)}

          {role === "authority" && (
            <div className="mt-5 p-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5">
              <p className="text-sm text-cyan-200 font-medium">
                Authority verification
              </p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Your request will need administrator approval. Selecting this
                option alone will not grant authority permissions.
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleRegister}
            disabled={submitting}
            className="w-full mt-7 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
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

          <p className="text-center text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300"
            >
              Login
            </Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Back to CitiZen
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;