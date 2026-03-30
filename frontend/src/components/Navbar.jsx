import React, { useState, useEffect, useCallback } from "react";
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
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Notifications,
  Settings,
  Logout,
  AccountCircle,
  DoneAll,
  NotificationsNone,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { Medication } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TYPE_ICON = {
  medication_reminder: "💊",
  medication_scheduled: "📅",
  doctor_response: "🩺",
  patient_query: "❓",
  appointment: "📋",
  system: "⚙️",
  diet_recommendation: "🥗",
};

export default function Navbar({ onLogout, username, role, onMenuClick, isMobile }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const navigate = useNavigate();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/notifications/unread/count");
      if (data.success) setUnreadCount(data.count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const { data } = await axios.get("/api/notifications?limit=5");
      if (data.success) setNotifications(data.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch("/api/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleProfileClick = (e) => setAnchorEl(e.currentTarget);

  const handleNotifClick = (e) => {
    setNotifAnchor(e.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNotifAnchor(null);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const roleLabel = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "User";

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #1a1f2e 0%, #252b4a 100%)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(102, 126, 234, 0.2)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
          zIndex: (theme) => theme.zIndex.drawer + 10,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: { xs: 1.5, sm: 2, md: 3 },
            minHeight: { xs: 64, sm: 70 },
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 }, minWidth: 0 }}>
            {isMobile && (
              <IconButton
                onClick={onMenuClick}
                sx={{
                  color: "white",
                  background: "rgba(102, 126, 234, 0.18)",
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Avatar
              sx={{
                width: { xs: 40, sm: 46, md: 48 },
                height: { xs: 40, sm: 46, md: 48 },
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 8px 16px rgba(102, 126, 234, 0.4)",
              }}
            >
              <Medication sx={{ fontSize: { xs: 22, sm: 26, md: 28 } }} />
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.1rem", sm: "1.35rem", md: "1.5rem" },
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                  whiteSpace: "nowrap",
                }}
              >
                Mediva
              </Typography>

              {!isMobile && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(228, 230, 235, 0.7)",
                    fontWeight: 600,
                  }}
                >
                  Smart Health Assistant
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
            <IconButton
              onClick={handleNotifClick}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                width: { xs: 42, md: 48 },
                height: { xs: 42, md: 48 },
              }}
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <Notifications />
              </Badge>
            </IconButton>

            {!isMobile && (
              <Box
                onClick={handleProfileClick}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  cursor: "pointer",
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  "&:hover": { background: "rgba(102, 126, 234, 0.15)" },
                }}
              >
                <Box sx={{ textAlign: "right", minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: "#e4e6eb",
                      lineHeight: 1.2,
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {username || "User"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(228, 230, 235, 0.6)",
                      fontWeight: 500,
                    }}
                  >
                    {roleLabel}
                  </Typography>
                </Box>

                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    border: "3px solid rgba(102, 126, 234, 0.3)",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  {(username || "U").charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            mt: 1,
            minWidth: 200,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            background: "linear-gradient(135deg, #1a1f2e 0%, #252b4a 100%)",
            border: "1px solid rgba(102, 126, 234, 0.2)",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            navigate("/profile");
          }}
        >
          <ListItemIcon>
            <AccountCircle sx={{ color: "#e4e6eb" }} />
          </ListItemIcon>
          <Typography sx={{ color: "#e4e6eb" }}>Profile</Typography>
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Settings sx={{ color: "#e4e6eb" }} />
          </ListItemIcon>
          <Typography sx={{ color: "#e4e6eb" }}>Settings</Typography>
        </MenuItem>

        <Divider sx={{ borderColor: "rgba(102, 126, 234, 0.2)" }} />

        <MenuItem
          onClick={() => {
            handleClose();
            onLogout();
          }}
          sx={{
            color: "#f5576c",
            "&:hover": { bgcolor: "rgba(245, 87, 108, 0.1)" },
          }}
        >
          <ListItemIcon>
            <Logout sx={{ color: "#f5576c" }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            mt: 1,
            width: { xs: 300, sm: 360 },
            maxWidth: "95vw",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            background: "linear-gradient(135deg, #1a1f2e 0%, #252b4a 100%)",
            border: "1px solid rgba(102, 126, 234, 0.2)",
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid rgba(102, 126, 234, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#e4e6eb" }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <IconButton size="small" onClick={handleMarkAllRead} sx={{ color: "#667eea" }}>
              <DoneAll fontSize="small" />
            </IconButton>
          )}
        </Box>

        {notifLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} sx={{ color: "#667eea" }} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <NotificationsNone sx={{ color: "rgba(228,230,235,0.3)", fontSize: 48 }} />
            <Typography variant="body2" sx={{ color: "rgba(228,230,235,0.5)", mt: 1 }}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          notifications.map((n) => (
            <MenuItem
              key={n._id}
              onClick={() => {
                if (!n.isRead) handleMarkRead(n._id);
                handleClose();
                if (n.actionUrl) navigate(n.actionUrl);
              }}
              sx={{
                py: 1.5,
                px: 2,
                alignItems: "flex-start",
                gap: 1.5,
                background: n.isRead ? "transparent" : "rgba(102, 126, 234, 0.08)",
                borderLeft: n.isRead ? "3px solid transparent" : "3px solid #667eea",
                "&:hover": { bgcolor: "rgba(102, 126, 234, 0.12)" },
              }}
            >
              <Typography sx={{ fontSize: 20, lineHeight: 1.4 }}>
                {n.icon || TYPE_ICON[n.type] || "🔔"}
              </Typography>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: n.isRead ? 500 : 700,
                    color: "#e4e6eb",
                    mb: 0.25,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  {n.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(228,230,235,0.65)",
                    display: "block",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  {n.message}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(228,230,235,0.4)",
                    mt: 0.5,
                    display: "block",
                  }}
                >
                  {timeAgo(n.createdAt)}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}

        <Divider sx={{ borderColor: "rgba(102, 126, 234, 0.2)" }} />

        <MenuItem
          onClick={() => {
            handleClose();
            navigate("/notifications");
          }}
          sx={{
            justifyContent: "center",
            color: "#667eea",
            fontWeight: 600,
            "&:hover": { bgcolor: "rgba(102, 126, 234, 0.1)" },
          }}
        >
          View All Notifications
        </MenuItem>
      </Menu>
    </>
  );
}