import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
} from "@mui/material";
import {
  Dashboard,
  Medication,
  Group,
  AccountCircle,
  Restaurant,
  MedicalServices,
  ManageAccounts,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";

const drawerWidth = 240;

export default function Sidebar({ role, onItemClick }) {
  const commonLinks = [
    { to: "/profile", label: "Profile", icon: <AccountCircle /> },
  ];

  const roleLinks = {
    patient: [
      { to: "/patient", label: "Dashboard", icon: <Dashboard /> },
      { to: "/patient/medicine-reminders", label: "Medicine Reminders", icon: <Medication /> },
      { to: "/patient/diet-plan", label: "Diet Plans", icon: <Restaurant /> },
    ],
    doctor: [
      { to: "/doctor", label: "Dashboard", icon: <MedicalServices /> },
      { to: "/doctor/patients", label: "My Patients", icon: <Group /> },
    ],
    admin: [
      { to: "/admin", label: "Dashboard", icon: <Dashboard /> },

    ],
  };

  const links = [...(roleLinks[role] || []), ...commonLinks];

  return (
    <Box
      sx={{
        width: drawerWidth,
        height: "100vh",
        overflowX: "hidden",
        overflowY: "auto",
        background: "linear-gradient(180deg, #5b6fd8 0%, #7c5dcc 50%, #8b5fc7 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top space for navbar */}
      <Box sx={{ height: { xs: "64px", sm: "70px" }, flexShrink: 0 }} />

      {/* Branding */}
      <Box sx={{ px: 2.5, pt: 2, pb: 3 }}>
        <Box
          sx={{
            p: 2.5,
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "white",
              mb: 1,
              fontSize: "1.1rem",
              letterSpacing: "0.5px",
            }}
          >
            Health Dashboard
          </Typography>

          <Chip
            label={role ? role.toUpperCase() : "PATIENT"}
            size="small"
            sx={{
              background: "rgba(91, 111, 216, 0.5)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.7rem",
              height: "22px",
              borderRadius: "11px",
            }}
          />
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ px: 2, py: 0 }}>
        {links.map(({ to, label, icon }) => (
          <ListItemButton
            key={to}
            component={NavLink}
            to={to}
            end={to === `/${role}`}
            onClick={onItemClick}
            sx={{
              borderRadius: 3,
              mb: 1,
              color: "rgba(255, 255, 255, 0.78)",
              py: 1.3,
              px: 2,
              transition: "all 0.2s ease",
              "&.active": {
                bgcolor: "rgba(255, 255, 255, 0.15)",
                color: "white",
                fontWeight: 600,
                "& .MuiListItemIcon-root": {
                  color: "white",
                },
              },
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
                color: "white",
                "& .MuiListItemIcon-root": {
                  color: "white",
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: "inherit",
                minWidth: 40,
              }}
            >
              {icon}
            </ListItemIcon>

            <ListItemText
              primary={label}
              primaryTypographyProps={{
                fontWeight: 500,
                fontSize: "0.9rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Bottom card */}
      <Box sx={{ p: 2.5, pb: 3 }}>
        <Box
          sx={{
            p: 2.5,
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.9)",
              fontWeight: 600,
              display: "block",
              mb: 0.5,
              fontSize: "0.75rem",
            }}
          >
            Smart Health Assistant
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "0.7rem",
            }}
          >
            © {new Date().getFullYear()} Mediva
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}