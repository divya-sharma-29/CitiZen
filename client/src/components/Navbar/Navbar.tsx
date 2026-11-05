import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Map,
  User,
  FileText,
  ShieldCheck,
  X,
} from "lucide-react";
import Button from "../Button/Button";
import { apiUrl } from "../../lib/api";

interface UserData {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role?: string;
}

function Navbar() {
  const navigate = useNavigate();

  const [notificationCount, setNotificationCount] = useState(0);
  const [user, setUser] = useState<UserData | null>(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? (JSON.parse(storedUser) as UserData) : null;
    } catch (error) {
      console.error("Failed to load user:", error);
      return null;
    }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const loadUser = useCallback(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setUser(null);
        return;
      }

      setUser(JSON.parse(storedUser) as UserData);
    } catch (error) {
      console.error("Failed to load user:", error);
      setUser(null);
    }
  }, []);

  const loadNotificationCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await fetch(apiUrl("/api/notifications/unread-count"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load unread notifications.");
      }

      const data = await response.json();
      setNotificationCount(data.count || 0);
    } catch (error) {
      console.error("Failed to load notification count:", error);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("storage", loadUser);
    window.addEventListener("citizen-session-changed", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("citizen-session-changed", loadUser);
    };
  }, [loadUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const initialLoad = window.setTimeout(() => {
      void loadNotificationCount();
    }, 0);

    const interval = setInterval(() => {
      loadNotificationCount();
    }, 30000);

    return () => {
      window.clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [user, loadNotificationCount]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setMenuOpen(false);
    setMobileMenuOpen(false);
    setNotificationCount(0);
    window.dispatchEvent(new Event("citizen-session-changed"));

    navigate("/");
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/75 text-white shadow-[0_12px_35px_rgba(2,8,23,0.2)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        {/* LOGO */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2"
        >
          <img
            src="/logo.png"
            alt="CitiZen"
            className="h-10 w-10 drop-shadow-[0_0_16px_rgba(103,232,249,0.22)]"
          />

          <span className="text-xl font-bold tracking-tight">
            Citi<span className="text-cyan-200">Zen</span>
          </span>
        </Link>

        {/* NAVIGATION */}
        <div className="hidden items-center gap-6 lg:flex">
          <Link
            to="/"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            Home
          </Link>

          <Link
            to="/features"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            Features
          </Link>

          <Link
            to="/about"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            About
          </Link>

          <Link
            to="/civic-map"
            className="flex items-center gap-1.5 text-sm text-slate-300 transition hover:text-white"
          >
            <Map size={17} />
            Map
          </Link>

          {/* NOTIFICATIONS */}
          {user && (
            <Link
              to="/notifications"
              className="relative flex items-center justify-center text-slate-300 transition hover:text-white"
              aria-label={`Notifications${
                notificationCount > 0
                  ? `, ${notificationCount} unread`
                  : ""
              }`}
            >
              <Bell size={21} />

              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-semibold">
                  {notificationCount > 99
                    ? "99+"
                    : notificationCount}
                </span>
              )}
            </Link>
          )}

          {/* LOGGED OUT */}
          {!user && (
            <>
              <Link
                to="/login"
                className="text-slate-300 hover:text-white transition"
              >
                Login
              </Link>

              <Button
                text="Get Started"
                to="/register"
              />
            </>
          )}

          {/* LOGGED IN USER */}
          {user && (
            <div
              className="relative"
              ref={menuRef}
            >
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white/5"
              >
                {/* AVATAR */}
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <span className="max-w-[120px] truncate font-medium">
                  {user.name}
                </span>

                <ChevronDown
                  size={17}
                  className={`transition-transform ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* DROPDOWN */}
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-2xl">
                  {/* USER INFO */}
                  <div className="px-4 py-4 border-b border-slate-800">
                    <p className="font-semibold truncate">
                      {user.name}
                    </p>

                    <p className="text-sm text-slate-400 truncate mt-1">
                      {user.email}
                    </p>

                    {user.role && (
                      <span className="inline-block mt-2 px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs capitalize">
                        {user.role}
                      </span>
                    )}
                  </div>

                  {/* PROFILE */}
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition"
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </Link>

                  {/* MY REPORTS */}
                  <Link
                    to="/my-reports"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition"
                  >
                    <FileText size={18} />
                    <span>My Reports</span>
                  </Link>

                  {/* NOTIFICATIONS */}
                  <Link
                    to="/notifications"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Bell size={18} />
                      <span>Notifications</span>
                    </div>

                    {notificationCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {notificationCount > 99
                          ? "99+"
                          : notificationCount}
                      </span>
                    )}
                  </Link>

                  {/* AUTHORITY */}
                  {user.role?.toLowerCase() === "authority" && (
                    <Link
                      to="/authority"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition"
                    >
                      <ShieldCheck size={18} />
                      <span>Authority Dashboard</span>
                    </Link>
                  )}

                  {user.role?.toLowerCase() === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/5"
                    >
                      <ShieldCheck size={18} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  {/* LOGOUT */}
                  <div className="border-t border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition text-left"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {user && (
            <Link
              to="/notifications"
              aria-label={`Notifications${
                notificationCount ? `, ${notificationCount} unread` : ""
              }`}
              className="relative rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300"
            >
              <Bell size={18} />
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Link>
          )}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-200 transition hover:bg-white/10"
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-white/10 bg-slate-950/95 px-5 py-4 backdrop-blur-2xl sm:px-8 lg:hidden"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            {[
              ["/", "Home"],
              ["/features", "Features"],
              ["/about", "About"],
              ["/civic-map", "Civic map"],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                {label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  My reports
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  My profile
                </Link>
                {user.role?.toLowerCase() === "authority" && (
                  <Link
                    to="/authority"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    Authority dashboard
                  </Link>
                )}
                {user.role?.toLowerCase() === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    Admin dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex items-center gap-2 rounded-xl border border-red-300/10 px-3 py-3 text-left text-sm text-red-200 transition hover:bg-red-400/10"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-medium text-slate-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;