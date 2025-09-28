import React from "react";
import { Box, Toolbar } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

const drawerWidth = 240;

const DashboardLayout = ({ children, role }) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            bgcolor: "grey.50",
            overflowY: "auto",
          }}
        >
          {/* Adds spacing below Navbar */}
          <Toolbar />
          {children}
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
