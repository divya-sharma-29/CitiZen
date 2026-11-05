import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { apiUrl } from "../../lib/api";
import cityInfrastructure from "../../assets/city-infrastructure.jpg";

interface LoginResponse {
  message?: string;
  token?: string;
  user?: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    role: string;
    authorityStatus?: string;
  };
}

interface LoginNavigationState {
  from?: string | { pathname?: string };
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | LoginResponse
        | null;

      if (!data) {
        throw new Error(
          "The server returned an unreadable response. Please try again."
        );
      }

      if (!response.ok) {
        setError(data.message || "We couldn't sign you in.");
        return;
      }

      if (!data.token || !data.user) {
        throw new Error(
          "The server response was incomplete. Please try again."
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("citizen-session-changed"));

      const state = location.state as LoginNavigationState | null;
      const requestedPath =
        typeof state?.from === "string"
          ? state.from
          : state?.from?.pathname;
      const safeRequestedPath =
        requestedPath?.startsWith("/") &&
        !requestedPath.startsWith("//")
          ? requestedPath
          : null;
      const defaultPath =
        data.user.role === "admin"
          ? "/admin"
          : data.user.role === "authority"
            ? "/authority"
            : "/dashboard";

      setSuccess(`Welcome back, ${data.user.name}.`);
      navigate(safeRequestedPath || defaultPath, { replace: true });
    } catch (loginError) {
      console.error("Login request failed:", loginError);
      setError(
        loginError instanceof TypeError
          ? "CitiZen couldn't reach its API. Make sure the backend is running, then try again."
          : loginError instanceof Error
            ? loginError.message
            : "Unable to connect to the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-slate-950/65 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b18] text-white">
      <img
        src={cityInfrastructure}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/80 to-blue-950/80" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-blue-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-0 h-[34rem] w-[34rem] rounded-full bg-cyan-400/10 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-5 py-10 sm:px-8">
        <Link
          to="/"
          className="absolute left-5 top-6 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white sm:left-8"
        >
          <ArrowLeft size={16} />
          Back to CitiZen
        </Link>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <section className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/5 px-3 py-1.5 text-xs font-medium tracking-wide text-cyan-100">
              <Sparkles size={14} />
              A clearer view of your city
            </div>
            <h1 className="mt-7 max-w-xl text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">
              Civic progress,
              <span className="block bg-gradient-to-r from-cyan-200 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                brought into view.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
              One secure place to raise local issues, follow real updates, and
              work with the people responsible for improving your neighborhood.
            </p>

            <div className="relative mt-10 max-w-xl">
              <div className="absolute -inset-4 rounded-[2rem] bg-cyan-400/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-slate-900/35 p-2 shadow-[0_35px_100px_rgba(2,8,23,0.55)] backdrop-blur-xl">
                <img
                  src={cityInfrastructure}
                  alt="City infrastructure illuminated at dusk"
                  className="h-72 w-full rounded-[1.35rem] object-cover opacity-85"
                />
                <div className="absolute inset-x-2 bottom-2 rounded-b-[1.35rem] bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent px-6 pb-5 pt-16">
                  <div className="flex items-end justify-between gap-5">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
                        Citizen + city
                      </p>
                      <p className="mt-2 text-xl font-semibold">
                        Every report has a next step.
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-cyan-100 backdrop-blur-md">
                      <ShieldCheck size={23} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-7 -top-5 hidden animate-float-slow rounded-2xl border border-white/15 bg-slate-900/75 px-4 py-3 shadow-xl backdrop-blur-xl xl:block motion-reduce:animate-none">
                <p className="text-xs text-slate-400">Built around</p>
                <p className="mt-1 text-sm font-medium text-cyan-100">
                  Trust & transparency
                </p>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="mb-6 flex justify-center lg:justify-start">
              <Link to="/" className="inline-flex items-center gap-3">
                <img src="/logo.png" alt="" className="h-11 w-11" />
                <span className="text-xl font-semibold tracking-tight">
                  Citi<span className="text-cyan-200">Zen</span>
                </span>
              </Link>
            </div>

            <div className="rounded-[1.75rem] border border-white/15 bg-slate-950/65 p-6 shadow-[0_35px_100px_rgba(2,8,23,0.58)] backdrop-blur-2xl sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  Secure access
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Sign in to continue to your CitiZen workspace.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-6 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-100"
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  role="status"
                  className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"
                >
                  {success}
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="login-email"
                    className="text-sm font-medium text-slate-200"
                  >
                    Email address
                  </label>
                  <div className="relative mt-2">
                    <Mail
                      size={17}
                      aria-hidden="true"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className={inputClass}
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <label
                      htmlFor="login-password"
                      className="text-sm font-medium text-slate-200"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-cyan-200 transition hover:text-white"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative mt-2">
                    <LockKeyhole
                      size={17}
                      aria-hidden="true"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className={`${inputClass} pr-12`}
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 font-semibold shadow-lg shadow-blue-950/40 transition hover:-translate-y-0.5 hover:shadow-cyan-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-wait disabled:opacity-70 motion-reduce:transform-none"
                >
                  {submitting ? "Signing in…" : "Sign in"}
                  {!submitting && (
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
                    />
                  )}
                </button>
              </form>

              <div className="mt-7 border-t border-white/10 pt-6 text-center">
                <p className="text-sm text-slate-400">
                  New to CitiZen?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-cyan-200 transition hover:text-white"
                  >
                    Create an account
                  </Link>
                </p>
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Authority accounts created by an administrator can sign in
                  immediately. Self-registered authority accounts need approval.
                </p>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              Protected access for citizens and municipal teams.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Login;
