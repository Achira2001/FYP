// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OTPVerifyPage from "./pages/OTPVerifyPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";

import Layout from "./components/Layout";
import MedicineReminder from "./pages/patient/MedicineReminder";
import DietPlan from "./pages/patient/DietPlan";
import HomePage from "./pages/HomePage";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";

/* ================================
   PRIVATE ROUTE
================================ */
function PrivateRoute({ role, children }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && role !== userRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* ================================
   DASHBOARD REDIRECT
   Shows HomePage for non-authenticated users
   Redirects authenticated users to their dashboard
================================ */
function DashboardRedirect() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If not authenticated, show HomePage
  if (!token) {
    return <HomePage />;
  }

  // If authenticated, redirect to appropriate dashboard
  if (role === "patient") {
    return <Navigate to="/patient" replace />;
  }

  if (role === "doctor") {
    return <Navigate to="/doctor" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  // Fallback to login
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= ROOT / HOMEPAGE ================= */}
        <Route path="/" element={<DashboardRedirect />} />

        {/* ================= AUTH ROUTES ================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OTPVerifyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ================= PATIENT ROUTES ================= */}
        <Route
          path="/patient"
          element={
            <PrivateRoute role="patient">
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<PatientDashboard />} />
          <Route path="patient-dashboard" element={<PatientDashboard />} />
          <Route path="medicine-reminders" element={<MedicineReminder />} />
          <Route path="diet-plan" element={<DietPlan />} />
        </Route>

        {/* ================= DOCTOR ROUTES ================= */}
        <Route
          path="/doctor"
          element={
            <PrivateRoute role="doctor">
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<DoctorDashboard />} />
        </Route>

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="manage-users" element={<ManageUsers />} />
        </Route>

        {/* ================= PROFILE ROUTE ================= */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<ProfilePage />} />
        </Route>

        {/* ================= CATCH ALL ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="bottom-right" />
    </BrowserRouter>
  );
}