import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, UserRound } from "lucide-react";
import { apiUrl } from "../../lib/api";

interface ProfileUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
  authorityStatus?: string;
  createdAt?: string;
}

export default function Profile() {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(
    token ? "" : "Sign in to view your profile."
  );

  useEffect(() => {
    const controller = new AbortController();

    if (!token) {
      return () => controller.abort();
    }

    fetch(apiUrl("/api/profile"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to load your profile.");
        }
        setUser(data.user);
      })
      .catch((loadError: unknown) => {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }
        console.error("Profile load failed:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your profile."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [token]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-5 py-10 text-white sm:px-8 sm:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-3xl">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>

        <header className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-semibold">My profile</h1>
          <p className="mt-2 text-sm text-slate-400">
            Your CitiZen account information.
          </p>
        </header>

        {loading ? (
          <div className="mt-8 h-64 animate-pulse rounded-3xl border border-white/10 bg-white/5 motion-reduce:animate-none" />
        ) : error ? (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-red-300/20 bg-red-300/5 p-5 text-sm text-red-100"
          >
            {error}
          </div>
        ) : user ? (
          <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_30px_90px_rgba(2,8,23,0.35)] backdrop-blur-xl sm:p-8">
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200/15 bg-cyan-200/10 text-cyan-100">
                {user.role === "authority" ? (
                  <ShieldCheck size={25} />
                ) : (
                  <UserRound size={25} />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold">{user.name}</h2>
                <p className="truncate text-sm text-slate-400">{user.email}</p>
              </div>
            </div>

            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">
                  Account type
                </dt>
                <dd className="mt-1 capitalize text-slate-200">{user.role}</dd>
              </div>
              {user.department && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">
                    Department
                  </dt>
                  <dd className="mt-1 text-slate-200">{user.department}</dd>
                </div>
              )}
              {user.authorityStatus &&
                user.authorityStatus !== "not_applicable" && (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-slate-500">
                      Authority access
                    </dt>
                    <dd className="mt-1 capitalize text-slate-200">
                      {user.authorityStatus}
                    </dd>
                  </div>
                )}
              {user.createdAt && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">
                    Member since
                  </dt>
                  <dd className="mt-1 text-slate-200">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        ) : null}
      </div>
    </main>
  );
}
