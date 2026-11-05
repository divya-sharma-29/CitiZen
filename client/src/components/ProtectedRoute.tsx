
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { apiUrl } from "../lib/api";

type User = {
  role?: string;
};

type ProtectedRouteProps = {
  allowedRoles?: string[];
};

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    async function verifySession() {
      const token = localStorage.getItem("token");

      if (!token) {
        if (active) {
          setAuthorized(false);
          setChecking(false);
        }
        return;
      }

      try {
        const response = await fetch(apiUrl("/api/auth/me"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          if (active) setAuthorized(false);
          return;
        }

        const data = await response.json();
        const user: User = data.user ?? data;

        const roleAllowed =
          !allowedRoles ||
          (typeof user.role === "string" &&
            allowedRoles.includes(user.role.toLowerCase()));

        if (active) setAuthorized(roleAllowed);
      } catch (error) {
        console.error("Session verification failed:", error);
        if (active) setAuthorized(false);
      } finally {
        if (active) setChecking(false);
      }
    }

    verifySession();

    return () => {
      active = false;
    };
  }, [location.pathname, allowedRoles]);

  if (checking) {
    return <div className="p-6 text-center">Verifying your session...</div>;
  }

  if (!authorized) {
    const token = localStorage.getItem("token");

    if (!token) {
      return (
        <Navigate
          to="/login"
          replace
          state={{ from: location }}
        />
      );
    }

    // A logged-in user without the required role should not enter this page.
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
