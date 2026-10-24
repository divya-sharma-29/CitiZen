import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

async function handleRegister() {
  setError("");
  setSuccess("");

  if (!name || !email || !password) {
    setError("Please fill in all fields.");
    return;
  }

  if (!email.includes("@")) {
    setError("Please enter a valid email address.");
    return;
  }

  if (password.length < 8) {
    setError("Password must be at least 8 characters.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Registration failed.");
      return;
    }

    setSuccess("Registration successful! 🎉");

    setTimeout(() => {
      navigate("/login");
    }, 1500);

  } catch (error) {
    console.error(error);
    setError("Unable to connect to the server.");
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-center px-6 py-12">

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

          <h1 className="text-3xl font-bold text-center">
            Create your account
          </h1>

          <p className="text-gray-400 text-center mt-3">
            Join CitiZen and help build better cities.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {success && (
          <div className="mt-6 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm">
            {success}
          </div>
          )}


          {/* Name */}
          <div className="mt-8">

            <label className="text-sm text-gray-300">
              Full Name
            </label>

            <div className="relative mt-2">

              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-500"
              />

            </div>

          </div>

          {/* Email */}
          <div className="mt-5">

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
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-500"
              />

            </div>

          </div>

          {/* Password */}
          <div className="mt-5">

            <label className="text-sm text-gray-300">
              Password
            </label>

            <div className="relative mt-2">

              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-500"
              />

            </div>

          </div>

          {/* Register Button */}
          <button
            type="button"
            onClick={handleRegister}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            Create Account
            <ArrowRight size={18} />
          </button>

          {/* Login */}
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

        {/* Back */}
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