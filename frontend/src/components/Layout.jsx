import React, { useState } from "react";
import { Box, Drawer, useMediaQuery } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const drawerWidth = 240;

export default function Layout() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "patient";

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleMenuClick = () => {
    setMobileOpen(true);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        bgcolor: "#061339",
      }}
    >
      {/* Top Navbar */}
      <Navbar
        onLogout={handleLogout}
        username={username}
        role={role}
        onMenuClick={handleMenuClick}
        isMobile={isMobile}
      />

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: drawerWidth,
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            zIndex: 1200,
          }}
        >
          <Sidebar role={role} />
        </Box>
      )}

      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: drawerWidth,
              borderRight: "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              bgcolor: "transparent",
            },
          }}
        >
          <Sidebar role={role} onItemClick={handleDrawerClose} />
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          ml: { md: `${drawerWidth}px` },
          pt: { xs: "64px", sm: "70px" },
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          overflowX: "hidden",
          bgcolor: "#061339",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}