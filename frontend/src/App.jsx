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

import Layout from "./components/Layout";
import PatientDashboard from "./pages/patient/PatientDashboard";


import DoctorDashboard from "./pages/doctor/DoctorDashboard";

// PrivateRoute wrapper
function PrivateRoute({ role, children }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (role && role !== userRole) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OTPVerifyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* PATIENT ROUTES */}
        <Route
          path="/patient"
          element={
            <PrivateRoute role="patient">
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<PatientDashboard />} />
  
        </Route>

        {/* DOCTOR ROUTES */}
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


        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* PROFILE ROUTE - FIXED */}
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

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Toast container for global notifications */}
      <ToastContainer position="bottom-right" />
    </BrowserRouter>
  );
}