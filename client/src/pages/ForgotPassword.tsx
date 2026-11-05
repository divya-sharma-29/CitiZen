import { useState } from "react";
import type { FormEvent } from "react";
import { apiUrl } from "../lib/api";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        apiUrl("/api/auth/forgot-password"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to process request."
        );
        return;
      }

      setSuccess(
        "If an account exists with this email, a password reset link has been sent."
      );

    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the server."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-center px-6">

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

          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Mail
                size={28}
                className="text-blue-400"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center">
            Forgot Password?
          </h1>

          <p className="text-gray-400 text-center mt-3">
            Enter your email and we'll send you a
            password reset link.
          </p>

          {/* Error */}
          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-6 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleForgotPassword}>
            <div className="mt-8">
              <label htmlFor="forgot-password-email" className="text-sm text-gray-300">
                Email
              </label>

              <div className="relative mt-2">
                <Mail
                  size={18}
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="forgot-password-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              {loading ? "Sending..." : "Send Reset Link"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Back to login */}
          <div className="flex justify-center mt-6">

            <Link
              to="/login"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;