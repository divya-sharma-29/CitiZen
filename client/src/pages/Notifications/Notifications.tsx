import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, CheckCheck, Clock3 } from "lucide-react";

interface NotificationReport {
  _id: string;
  title?: string;
  status?: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  reportId?: NotificationReport | null;
}

const API_URL = "http://localhost:5000";

async function fetchNotifications(
  token: string,
  signal?: AbortSignal
): Promise<Notification[]> {
  const response = await fetch(`${API_URL}/api/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load notifications.");
  }

  return data.notifications || [];
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem("token"))
  );
  const [markingAll, setMarkingAll] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setNotifications(await fetchNotifications(token));
      setError("");
    } catch (loadError) {
      console.error("Notification load failed:", loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let active = true;
    const controller = new AbortController();

    fetchNotifications(token, controller.signal)
      .then((items) => {
        if (active) {
          setNotifications(items);
          setError("");
        }
      })
      .catch((loadError: unknown) => {
        if (
          !active ||
          (loadError instanceof DOMException &&
            loadError.name === "AbortError")
        ) {
          return;
        }

        console.error("Notification load failed:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to connect to the server."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const markRead = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setUpdatingId(id);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update notification.");
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (updateError) {
      console.error("Mark notification read failed:", updateError);
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update notification."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setMarkingAll(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update notifications.");
      }

      setNotifications((current) =>
        current.map((notification) => ({ ...notification, read: true }))
      );
    } catch (updateError) {
      console.error("Mark all notifications read failed:", updateError);
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update notifications."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
      />
      <main className="relative mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          to="/dashboard"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Dashboard
        </Link>

        <header className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-xl border border-cyan-300/15 bg-cyan-300/10 p-2.5 text-cyan-200">
                <Bell size={20} />
              </span>
              <div>
                <h1 className="text-3xl font-semibold">Notifications</h1>
                <p className="mt-1 text-sm text-slate-400">
                  {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0 || markingAll}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-300/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck size={17} />
            {markingAll ? "Updating…" : "Mark all as read"}
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void loadNotifications()}
              className="shrink-0 rounded-lg border border-red-200/20 px-3 py-1.5 font-medium hover:bg-red-200/10"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-8 space-y-3" aria-label="Loading notifications">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl border border-white/5 bg-white/5 motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-16 text-center backdrop-blur-xl">
            <Bell className="mx-auto text-slate-500" size={28} />
            <h2 className="mt-4 text-lg font-semibold">You’re all caught up</h2>
            <p className="mt-2 text-sm text-slate-400">
              New report updates and community activity will appear here.
            </p>
          </section>
        ) : (
          <ol className="mt-8 space-y-3">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`rounded-2xl border p-5 shadow-[0_18px_50px_rgba(2,8,23,0.2)] backdrop-blur-xl transition ${
                  notification.read
                    ? "border-white/10 bg-white/[0.035]"
                    : "border-blue-300/20 bg-blue-400/[0.07]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{notification.title}</h2>
                      {!notification.read && (
                        <span className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-200">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {notification.message}
                    </p>
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock3 size={13} />
                      <time dateTime={notification.createdAt}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </time>
                    </p>
                  </div>

                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => void markRead(notification._id)}
                      disabled={updatingId === notification._id}
                      aria-label={`Mark ${notification.title} as read`}
                      className="shrink-0 rounded-lg border border-white/10 p-2 text-slate-300 transition hover:border-cyan-300/20 hover:text-white disabled:opacity-50"
                    >
                      <Check size={17} />
                    </button>
                  )}
                </div>

                {notification.reportId && (
                  <Link
                    to={`/reports/${notification.reportId._id}`}
                    className="mt-4 inline-flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:border-cyan-200/20 hover:text-white"
                  >
                    <span className="truncate">
                      {notification.reportId.title || "View report"}
                    </span>
                    {notification.reportId.status && (
                      <span className="shrink-0 text-slate-500">
                        · {notification.reportId.status}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
