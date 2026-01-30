import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider
} from "@mui/material";
import {
  Notifications,
  Settings,
  Logout,
  AccountCircle
} from "@mui/icons-material";
import { Medication } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onLogout, username, notificationCount = 5 }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const navigate = useNavigate();

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifClick = (event) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNotifAnchor(null);
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(135deg, #1a1f2e 0%, #252b4a 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        {/* Left Side - Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            width: 48, 
            height: 48, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)'
          }}>
            <Medication sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>
              Mediva
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(228, 230, 235, 0.7)',
              fontWeight: 600
            }}>
              Smart Health Assistant
            </Typography>
          </Box>
        </Box>

        {/* Right Side - User Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Notifications */}
          <IconButton 
            onClick={handleNotifClick}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              width: 48,
              height: 48,
              transition: 'transform 0.2s',
              '&:hover': { 
                transform: 'scale(1.1)',
                background: 'linear-gradient(135deg, #7689ed 0%, #8558b5 100%)'
              }
            }}
          >
            <Badge badgeContent={notificationCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* User Profile */}
          <Box 
            onClick={handleProfileClick}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              cursor: 'pointer',
              px: 2,
              py: 1,
              borderRadius: 3,
              transition: 'all 0.2s',
              '&:hover': {
                background: 'rgba(102, 126, 234, 0.15)'
              }
            }}
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 700,
                color: '#e4e6eb',
                lineHeight: 1.2
              }}>
                {username || 'John Doe'}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'rgba(228, 230, 235, 0.6)',
                fontWeight: 500
              }}>
                Patient
              </Typography>
            </Box>
            <Avatar sx={{ 
              width: 48, 
              height: 48,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 700,
              fontSize: '1.2rem',
              border: '3px solid rgba(102, 126, 234, 0.3)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              {(username || 'U').charAt(0).toUpperCase()}
            </Avatar>
          </Box>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                borderRadius: 3,
                mt: 1,
                minWidth: 200,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                background: 'linear-gradient(135deg, #1a1f2e 0%, #252b4a 100%)',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }
            }}
          >
            <MenuItem 
              onClick={() => {
                handleClose();
                navigate("/profile");   // <-- ✅ GO TO PROFILE PAGE
              }}
            >
              <ListItemIcon>
                <AccountCircle sx={{ color: '#e4e6eb' }} />
              </ListItemIcon>
              <Typography sx={{ color: '#e4e6eb' }}>Profile</Typography>
            </MenuItem>

            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Settings sx={{ color: '#e4e6eb' }} />
              </ListItemIcon>
              <Typography sx={{ color: '#e4e6eb' }}>Settings</Typography>
            </MenuItem>

            <Divider sx={{ borderColor: 'rgba(102, 126, 234, 0.2)' }} />

            <MenuItem 
              onClick={() => {
                handleClose();
                onLogout();
              }}
              sx={{ 
                color: '#f5576c',
                '&:hover': {
                  bgcolor: 'rgba(245, 87, 108, 0.1)'
                }
              }}
            >
              <ListItemIcon>
                <Logout sx={{ color: '#f5576c' }} />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>


          {/* Notifications Menu */}
          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                borderRadius: 3,
                mt: 1,
                maxWidth: 360,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                background: 'linear-gradient(135deg, #1a1f2e 0%, #252b4a 100%)',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(102, 126, 234, 0.2)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#e4e6eb' }}>
                Notifications
              </Typography>
            </Box>
            {[1, 2, 3].map((i) => (
              <MenuItem 
                key={i} 
                onClick={handleClose} 
                sx={{ 
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.1)'
                  }
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#e4e6eb' }}>
                    💊 Medicine Reminder
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(228, 230, 235, 0.7)' }}>
                    Time to take your morning medication
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            <Divider sx={{ borderColor: 'rgba(102, 126, 234, 0.2)' }} />
            <MenuItem 
              onClick={handleClose} 
              sx={{ 
                justifyContent: 'center', 
                color: '#667eea', 
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.1)'
                }
              }}
            >
              View All Notifications
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}