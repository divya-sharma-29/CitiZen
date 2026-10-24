import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Map,
  User,
  FileText,
  ShieldCheck,
} from "lucide-react";
import Button from "../Button/Button";

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
  const [user, setUser] = useState<UserData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUser();

    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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
    if (!user) {
      setNotificationCount(0);
      return;
    }

    loadNotificationCount();

    const interval = setInterval(() => {
      loadNotificationCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  function loadUser() {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setUser(null);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Failed to load user:", error);
      setUser(null);
    }
  }

  async function loadNotificationCount() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setNotificationCount(0);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/notifications/unread-count",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      setNotificationCount(data.count || 0);
    } catch (error) {
      console.error("Failed to load notification count:", error);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setMenuOpen(false);
    setNotificationCount(0);

    navigate("/");
  }

  return (
    <nav className="w-full bg-slate-950 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8 py-4">
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
        >
          <img
            src="/logo.png"
            alt="CitiZen"
            className="h-10 w-10"
          />

          <span className="text-xl font-bold">
            CitiZen
          </span>
        </Link>

        {/* NAVIGATION */}
        <div className="hidden md:flex items-center gap-7">
          <Link
            to="/"
            className="text-slate-300 hover:text-white transition"
          >
            Home
          </Link>

          <Link
            to="/features"
            className="text-slate-300 hover:text-white transition"
          >
            Features
          </Link>

          <Link
            to="/about"
            className="text-slate-300 hover:text-white transition"
          >
            About
          </Link>

          <Link
            to="/civic-map"
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition"
          >
            <Map size={17} />
            Map
          </Link>

          {/* NOTIFICATIONS */}
          {user && (
            <Link
              to="/notifications"
              className="relative flex items-center justify-center text-slate-300 hover:text-white transition"
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
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 transition"
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
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
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
      </div>
    </nav>
  );
}

export default Navbar;