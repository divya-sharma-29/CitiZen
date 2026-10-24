import { useState } from "react";
import { Link, useNavigate , useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin() {
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Login failed."
        );
        return;
      }

      // -----------------------------
      // SAVE LOGIN INFORMATION
      // -----------------------------

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      console.log(
        "Logged in user:",
        data.user
      );

      setSuccess(
        "Login successful! 🎉"
      );

      // -----------------------------
      // GO TO HOME PAGE
      // -----------------------------

      setTimeout(() => {
        const redirectTo = location.state?.from || "/dashboard";

navigate(redirectTo, {
  replace: true,
});
      }, 800);

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        {/* LOGO */}

        <div className="flex justify-center mb-8">

          <Link to="/">
            <img
              src="/logo.png"
              alt="CitiZen Logo"
              className="w-14 h-14"
            />
          </Link>

        </div>

        {/* CARD */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">

          <h1 className="text-3xl font-bold text-center">
            Welcome Back
          </h1>

          <p className="text-gray-400 text-center mt-3">
            Login to continue to CitiZen.
          </p>

          {/* ERROR */}

          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mt-6 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm">
              {success}
            </div>
          )}

          {/* EMAIL */}

          <div className="mt-8">

            <label className="text-sm text-gray-300">
              Email
            </label>

            <div className="relative mt-2">

              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-500"
              />

            </div>

          </div>

          {/* PASSWORD */}

          <div className="mt-5">

            <div className="flex items-center justify-between">

              <label className="text-sm text-gray-300">
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Forgot Password?
              </Link>

            </div>

            <div className="relative mt-2">

              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-11 outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
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

          {/* LOGIN BUTTON */}

          <button
            type="button"
            onClick={handleLogin}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            Login

            <ArrowRight size={18} />

          </button>

          {/* REGISTER */}

          <p className="text-center text-gray-400 mt-6">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="text-blue-400 hover:text-blue-300"
            >
              Create Account
            </Link>

          </p>

        </div>

        {/* BACK */}

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

export default Login;