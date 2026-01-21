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
  Paper,
  Chip
} from "@mui/material";
import {
  Dashboard,
  LocalHospital,
  Assignment,
  Medication,
  Group,
  AccountCircle,
  Restaurant,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";

const drawerWidth = 240;

export default function Sidebar({ role }) {
  const commonLinks = [
    { to: "/profile", label: "Profile", icon: <AccountCircle /> }
  ];

  const roleLinks = {
    patient: [
      { to: "/patient/home-page", label: "Dashboard", icon: <Dashboard /> },
      { to: "/patient/medicine-reminders", label: "Medicine Reminders", icon: <Medication /> },
      { to: "/patient/diet-plan", label: "Diet Plans", icon: <Restaurant /> },
    ],
    doctor: [
      { to: "/doctor/patients", label: "My Patients", icon: <Group /> },
      { to: "/doctor/prescriptions", label: "Prescriptions", icon: <Assignment /> },
      { to: "/doctor/appointments", label: "Appointments", icon: <LocalHospital /> },
    ],
    admin: [
      { to: "/admin/manage-users", label: "Manage Users", icon: <Group /> },
      { to: "/admin/reports", label: "System Reports", icon: <Assignment /> },
    ],
  };

  const links = [...(roleLinks[role] || []), ...commonLinks];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          background: 'linear-gradient(180deg, #5b6fd8 0%, #7c5dcc 50%, #8b5fc7 100%)',
          color: "white",
          borderRight: 'none',
          boxShadow: 'none'
        },
      }}
    >
      {/* Spacer for AppBar */}
      <Toolbar sx={{ minHeight: '80px !important' }} />
      
      {/* Branding Section */}
      <Box sx={{ px: 2.5, pt: 2, pb: 3 }}>
        <Box sx={{ 
          p: 2.5, 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700,
            color: 'white',
            mb: 1,
            fontSize: '1.1rem',
            letterSpacing: '0.5px'
          }}>
            Health Dashboard
          </Typography>
          <Chip 
            label={role?.toUpperCase() || 'PATIENT'}
            size="small"
            sx={{ 
              background: 'rgba(91, 111, 216, 0.5)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: '22px',
              borderRadius: '11px'
            }}
          />
        </Box>
      </Box>

      {/* Navigation Links */}
      <List sx={{ px: 2, py: 0 }}>
        {links.map(({ to, label, icon }) => (
          <ListItemButton
            key={to}
            component={NavLink}
            to={to}
            sx={{
              borderRadius: 3,
              mb: 1,
              color: "rgba(255, 255, 255, 0.7)",
              py: 1.3,
              px: 2,
              transition: 'all 0.2s ease',
              "&.active": {
                bgcolor: "rgba(255, 255, 255, 0.15)",
                color: "white",
                fontWeight: "600",
                "& .MuiListItemIcon-root": {
                  color: "white"
                }
              },
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
                color: "white",
                "& .MuiListItemIcon-root": {
                  color: "white"
                }
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: "inherit",
              minWidth: 40
            }}>
              {icon}
            </ListItemIcon>
            <ListItemText 
              primary={label}
              primaryTypographyProps={{
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Bottom Section */}
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2.5, pb: 3 }}>
        <Box sx={{ 
          p: 2.5, 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <Typography variant="caption" sx={{ 
            color: "rgba(255,255,255,0.9)",
            fontWeight: 600,
            display: 'block',
            mb: 0.5,
            fontSize: '0.75rem'
          }}>
            Smart Health Assistant
          </Typography>
          <Typography variant="caption" sx={{ 
            color: "rgba(255,255,255,0.6)",
            fontSize: '0.7rem'
          }}>
            © {new Date().getFullYear()} Mediva
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}