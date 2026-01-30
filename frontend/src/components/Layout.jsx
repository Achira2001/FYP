import React from "react";
import { Box, Toolbar } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "patient";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar onLogout={handleLogout} username={username} />

      <Box sx={{ display: "flex", flex: 1 }}>
        <Sidebar role={role} />

        <Box component="main" sx={{ flex: 1, p: 0, bgcolor: "grey.50" }}>
          <Outlet />
        </Box>
      </Box>

      {/* <Footer /> */}
    </Box>
  );
}
