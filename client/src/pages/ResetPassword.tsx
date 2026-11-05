import { useState } from "react";
import { apiUrl } from "../lib/api";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get token from the reset link sent to email
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    setError("");
    setSuccess("");

    // Check token
    if (!token) {
      setError("Invalid or missing password reset link.");
      return;
    }

    // Check fields
    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    // Minimum password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        apiUrl("/api/auth/reset-password"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to reset password.");
        return;
      }

      setSuccess(
        "Password reset successful! Redirecting to login..."
      );

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img
              src="/logo.png"
              alt="CitiZen Logo"
              className="w-14 h-14"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">

          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Lock
                size={28}
                className="text-blue-400"
              />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-center">
            Reset Password
          </h1>

          <p className="text-gray-400 text-center mt-3">
            Create a new password for your CitiZen account.
          </p>

          {/* Error */}
          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-6 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
              <CheckCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{success}</span>
            </div>
          )}

          {/* New Password */}
          <div className="mt-8">
            <label className="text-sm text-gray-300">
              New Password
            </label>

            <div className="relative mt-2">

              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-12 outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>
          </div>

          {/* Confirm Password */}
          <div className="mt-5">

            <label className="text-sm text-gray-300">
              Confirm New Password
            </label>

            <div className="relative mt-2">

              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-12 outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={loading || !token}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}

            {!loading && (
              <ArrowRight size={18} />
            )}
          </button>

          {/* Login */}
          <p className="text-center text-gray-400 mt-6">
            Remember your password?{" "}

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

export default ResetPassword;