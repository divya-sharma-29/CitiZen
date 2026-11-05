
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import SplashScreen from "./components/SplashScreen/SplashScreen";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing/Landing";
import Features from "./pages/Features/Features";
import About from "./pages/About/About";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import ReportIssue from "./pages/ReportIssue/ReportIssue";
import MyReports from "./pages/MyReports/MyReports";
import CivicMap from "./pages/CivicMap/CivicMap";
import ReportDetails from "./pages/ReportDetails/ReportDetails";
import Notifications from "./pages/Notifications/Notifications";
import AuthorityDashboard from "./pages/AuthorityDashboard/AuthorityDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import Profile from "./pages/Profile/Profile";

// Keep these arrays outside App so they remain stable between renders.
const AUTHORITY_ROLES = ["authority"];
const ADMIN_ROLES = ["admin"];

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC PAGES */}
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />

        {/* AUTHENTICATION PAGES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ANY AUTHENTICATED USER */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/civic-map" element={<CivicMap />} />
          <Route path="/reports/:id" element={<ReportDetails />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* AUTHORITY ONLY */}
        <Route element={<ProtectedRoute allowedRoles={AUTHORITY_ROLES} />}>
          <Route path="/authority" element={<AuthorityDashboard />} />
        </Route>

        {/* ADMIN ONLY */}
        <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
