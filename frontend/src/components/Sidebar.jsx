import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import {
  Dashboard,
  LocalHospital,
  Assignment,
  Medication,
  NotificationsActive,
  Group,
  AccountCircle,
  Restaurant,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";

const drawerWidth = 240;

export default function Sidebar({ role }) {
  const commonLinks = [{ to: "/profile", label: "Profile", icon: <AccountCircle /> }];

  const roleLinks = {
    patient: [
      { to: "/patient/dashboard", label: "Dashboard", icon: <Dashboard /> },
      { to: "/patient/medicine-reminders", label: "Medicine Reminders", icon: <Medication /> },
      { to: "/patient/diet-plans", label: "Diet Plans", icon: <Restaurant /> },
      { to: "/patient/notifications", label: "Notifications", icon: <NotificationsActive /> },
    ],
    doctor: [
      { to: "/doctor/patients", label: "My Patients", icon: <Group /> },
      { to: "/doctor/prescriptions", label: "Prescriptions", icon: <Assignment /> },
      { to: "/doctor/appointments", label: "Appointments", icon: <LocalHospital /> },
    ],
    admin: [
      { to: "/admin/users", label: "Manage Users", icon: <Group /> },
      { to: "/admin/reports", label: "System Reports", icon: <Assignment /> },
    ],
  };

  const links = [...(roleLinks[role] || []), ...commonLinks];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          // Attractive healthcare gradient
          background: "linear-gradient(180deg, #0288d1 0%, #26c6da 100%)",
          color: "white",
        },
      }}
    >
      {/* App Branding */}
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ fontWeight: "bold" }}>
          🏥 Health Assistant
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />

      {/* Nav Links */}
      <List sx={{ mt: 1 }}>
        {links.map(({ to, label, icon }) => (
          <ListItemButton
            key={to}
            component={NavLink}
            to={to}
            sx={{
              borderRadius: 2,
              mx: 1,
              mb: 1,
              color: "white",
              "&.active": {
                bgcolor: "rgba(255,255,255,0.25)",
                fontWeight: "bold",
              },
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.15)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>

      {/* Footer inside Sidebar */}
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
          © {new Date().getFullYear()} Smart Health Assistant
        </Typography>
      </Box>
    </Drawer>
  );
}
