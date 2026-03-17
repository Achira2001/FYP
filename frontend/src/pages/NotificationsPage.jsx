import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Badge,
} from "@mui/material";
import {
  DoneAll,
  Delete,
  DeleteSweep,
  FilterList,
  Refresh,
  NotificationsNone,
  CheckCircleOutline,
  OpenInNew,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ─── Constants ───────────────────────────────────────────────────────────────
const TYPE_META = {
  medication_reminder:  { icon: "💊", label: "Medication Reminder",  color: "#4fc3f7" },
  medication_scheduled: { icon: "📅", label: "Medication Scheduled", color: "#81c784" },
  doctor_response:      { icon: "🩺", label: "Doctor Response",      color: "#ce93d8" },
  patient_query:        { icon: "❓", label: "Patient Query",         color: "#ffb74d" },
  appointment:          { icon: "📋", label: "Appointment",           color: "#f48fb1" },
  system:               { icon: "⚙️", label: "System",               color: "#90a4ae" },
  diet_recommendation:  { icon: "🥗", label: "Diet Recommendation",  color: "#a5d6a7" },
};

const PRIORITY_COLOR = {
  low:    "#90a4ae",
  medium: "#4fc3f7",
  high:   "#ffb74d",
  urgent: "#ef5350",
};

const ALL_TYPES = ["all", ...Object.keys(TYPE_META)];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fullDate(dateStr) {
  return new Date(dateStr).toLocaleString("en-US", {
    weekday: "short", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

// ─── NotificationCard ─────────────────────────────────────────────────────────
function NotificationCard({ notif, onRead, onDelete, onClick }) {
  const meta = TYPE_META[notif.type] || { icon: "🔔", label: notif.type, color: "#667eea" };
  const priorityColor = PRIORITY_COLOR[notif.priority] || PRIORITY_COLOR.medium;

  return (
    <Fade in timeout={300}>
      <Box
        onClick={() => onClick(notif)}
        sx={{
          display: "flex",
          gap: 2,
          px: 2.5,
          py: 2,
          cursor: "pointer",
          borderLeft: `4px solid ${notif.isRead ? "transparent" : meta.color}`,
          background: notif.isRead
            ? "rgba(255,255,255,0.02)"
            : `linear-gradient(90deg, ${meta.color}10 0%, transparent 100%)`,
          transition: "all 0.2s ease",
          "&:hover": {
            background: `rgba(102, 126, 234, 0.08)`,
            transform: "translateX(2px)",
          },
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          alignItems: "flex-start",
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            background: `${meta.color}22`,
            border: `1px solid ${meta.color}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
            mt: 0.25,
          }}
        >
          {notif.icon || meta.icon}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: notif.isRead ? 500 : 700, color: "#e4e6eb", flex: 1 }}
            >
              {notif.title}
            </Typography>

            {/* Priority badge */}
            {notif.priority && notif.priority !== "medium" && (
              <Box
                sx={{
                  px: 1,
                  py: 0.2,
                  borderRadius: "6px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  background: `${priorityColor}22`,
                  color: priorityColor,
                  border: `1px solid ${priorityColor}44`,
                }}
              >
                {notif.priority}
              </Box>
            )}

            {/* Unread dot */}
            {!notif.isRead && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: meta.color,
                  flexShrink: 0,
                }}
              />
            )}
          </Box>

          <Typography
            variant="caption"
            sx={{ color: "rgba(228,230,235,0.65)", display: "block", mb: 0.75 }}
          >
            {notif.message}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Chip
              label={meta.label}
              size="small"
              sx={{
                fontSize: "0.65rem",
                height: 20,
                background: `${meta.color}18`,
                color: meta.color,
                border: `1px solid ${meta.color}33`,
                fontWeight: 600,
              }}
            />
            <Typography variant="caption" sx={{ color: "rgba(228,230,235,0.35)" }}>
              {timeAgo(notif.createdAt)}
            </Typography>
            {notif.isRead && notif.readAt && (
              <Typography variant="caption" sx={{ color: "rgba(228,230,235,0.25)" }}>
                · Read {timeAgo(notif.readAt)}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flexShrink: 0 }}>
          {!notif.isRead && (
            <Tooltip title="Mark as read" placement="left">
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onRead(notif._id); }}
                sx={{ color: meta.color, "&:hover": { background: `${meta.color}22` } }}
              >
                <CheckCircleOutline fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete" placement="left">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(notif._id); }}
              sx={{ color: "#ef5350", "&:hover": { background: "rgba(239,83,80,0.12)" } }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Fade>
  );
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────
function NotificationDetail({ notif, onClose, onRead, onDelete, navigate }) {
  if (!notif) return null;
  const meta = TYPE_META[notif.type] || { icon: "🔔", label: notif.type, color: "#667eea" };

  return (
    <Dialog
      open={!!notif}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: "linear-gradient(135deg, #1a1f2e 0%, #252b4a 100%)",
          border: "1px solid rgba(102,126,234,0.25)",
          borderRadius: 3,
          color: "#e4e6eb",
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: "14px",
              background: `${meta.color}22`, border: `1px solid ${meta.color}44`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
            }}
          >
            {notif.icon || meta.icon}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#e4e6eb", lineHeight: 1.2 }}>
              {notif.title}
            </Typography>
            <Chip
              label={meta.label}
              size="small"
              sx={{
                mt: 0.5, fontSize: "0.65rem", height: 20,
                background: `${meta.color}18`, color: meta.color,
                border: `1px solid ${meta.color}33`, fontWeight: 600,
              }}
            />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography sx={{ color: "rgba(228,230,235,0.8)", mb: 2, lineHeight: 1.7 }}>
          {notif.message}
        </Typography>

        <Divider sx={{ borderColor: "rgba(102,126,234,0.15)", mb: 2 }} />

        {/* Meta fields */}
        {[
          ["Priority",   notif.priority?.toUpperCase(), PRIORITY_COLOR[notif.priority]],
          ["Received",   fullDate(notif.createdAt), null],
          notif.isRead && notif.readAt
            ? ["Read at",  fullDate(notif.readAt), null]
            : null,
          notif.expiresAt
            ? ["Expires",  fullDate(notif.expiresAt), "#ffb74d"]
            : null,
        ]
          .filter(Boolean)
          .map(([label, value, color]) => (
            <Box key={label} sx={{ display: "flex", gap: 1, mb: 1 }}>
              <Typography variant="caption" sx={{ color: "rgba(228,230,235,0.4)", width: 80, flexShrink: 0 }}>
                {label}
              </Typography>
              <Typography variant="caption" sx={{ color: color || "rgba(228,230,235,0.7)", fontWeight: 600 }}>
                {value}
              </Typography>
            </Box>
          ))}

        {/* Metadata extras (e.g. patientName, queryPreview) */}
        {notif.metadata && Object.keys(notif.metadata).length > 0 && (
          <>
            <Divider sx={{ borderColor: "rgba(102,126,234,0.15)", my: 2 }} />
            <Typography variant="caption" sx={{ color: "rgba(228,230,235,0.4)", display: "block", mb: 1 }}>
              ADDITIONAL DETAILS
            </Typography>
            {Object.entries(notif.metadata).map(([key, val]) => (
              <Box key={key} sx={{ display: "flex", gap: 1, mb: 0.75 }}>
                <Typography variant="caption" sx={{ color: "rgba(228,230,235,0.4)", width: 120, flexShrink: 0 }}>
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(228,230,235,0.7)" }}>
                  {String(val)}
                </Typography>
              </Box>
            ))}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        {notif.actionUrl && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<OpenInNew />}
            onClick={() => { onClose(); navigate(notif.actionUrl); }}
            sx={{ borderColor: meta.color, color: meta.color, "&:hover": { background: `${meta.color}18` } }}
          >
            Go to page
          </Button>
        )}
        {!notif.isRead && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<CheckCircleOutline />}
            onClick={() => { onRead(notif._id); onClose(); }}
            sx={{ borderColor: "#81c784", color: "#81c784", "&:hover": { background: "rgba(129,199,132,0.1)" } }}
          >
            Mark read
          </Button>
        )}
        <Button
          variant="outlined"
          size="small"
          color="error"
          startIcon={<Delete />}
          onClick={() => { onDelete(notif._id); onClose(); }}
        >
          Delete
        </Button>
        <Button onClick={onClose} sx={{ color: "rgba(228,230,235,0.6)" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [total,         setTotal]         = useState(0);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [page,          setPage]          = useState(1);
  const [loading,       setLoading]       = useState(false);
  const [selected,      setSelected]      = useState(null);   // detail dialog

  // Filters
  const [typeFilter,   setTypeFilter]   = useState("all");
  const [readFilter,   setReadFilter]   = useState("all");   // "all" | "true" | "false"

  const LIMIT = 15;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (typeFilter !== "all") params.set("type",   typeFilter);
      if (readFilter !== "all") params.set("isRead", readFilter);

      const { data } = await axios.get(`/api/notifications?${params}`);
      if (data.success) {
        setNotifications(data.data);
        setTotal(data.pagination.total);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, readFilter]);

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/notifications/unread/count");
      if (data.success) setUnreadCount(data.count);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  useEffect(() => { fetchUnread(); },       [fetchUnread]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [typeFilter, readFilter]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setTotal(t => t - 1);
      await fetchUnread();
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch("/api/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const handleDeleteAllRead = async () => {
    try {
      await axios.delete("/api/notifications/read");
      setNotifications(prev => prev.filter(n => !n.isRead));
      await fetchUnread();
      setTotal(0); // will recalculate on next fetch
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const handleCardClick = async (notif) => {
    setSelected(notif);
    // Auto-mark as read when opened
    if (!notif.isRead) await handleRead(notif._id);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f1322 0%, #1a1f2e 50%, #0f1322 100%)",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{ maxWidth: 820, mx: "auto", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <Box sx={{ width: 8, height: 8 }} />
              </Badge>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchNotifications} sx={{ color: "#667eea" }}>
                <Refresh />
              </IconButton>
            </Tooltip>
            {unreadCount > 0 && (
              <Tooltip title="Mark all as read">
                <IconButton onClick={handleMarkAllRead} sx={{ color: "#81c784" }}>
                  <DoneAll />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete all read">
              <IconButton onClick={handleDeleteAllRead} sx={{ color: "#ef5350" }}>
                <DeleteSweep />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: "rgba(228,230,235,0.5)" }}>
          {total} total · {unreadCount} unread
        </Typography>
      </Box>

      {/* ── Filters ── */}
      <Box
        sx={{
          maxWidth: 820, mx: "auto", mb: 3,
          display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center",
        }}
      >
        <FilterList sx={{ color: "rgba(228,230,235,0.4)" }} />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: "rgba(228,230,235,0.5)" }}>Type</InputLabel>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            label="Type"
            sx={{
              color: "#e4e6eb",
              ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(102,126,234,0.3)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#667eea" },
              ".MuiSvgIcon-root": { color: "#667eea" },
            }}
          >
            {ALL_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t === "all" ? "All Types" : (TYPE_META[t]?.icon + " " + TYPE_META[t]?.label)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel sx={{ color: "rgba(228,230,235,0.5)" }}>Status</InputLabel>
          <Select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            label="Status"
            sx={{
              color: "#e4e6eb",
              ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(102,126,234,0.3)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#667eea" },
              ".MuiSvgIcon-root": { color: "#667eea" },
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="false">Unread</MenuItem>
            <MenuItem value="true">Read</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ── List ── */}
      <Box
        sx={{
          maxWidth: 820,
          mx: "auto",
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid rgba(102,126,234,0.18)",
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(10px)",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#667eea" }} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <NotificationsNone sx={{ fontSize: 64, color: "rgba(228,230,235,0.15)", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "rgba(228,230,235,0.3)", fontWeight: 600 }}>
              No notifications found
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(228,230,235,0.2)", mt: 0.5 }}>
              {typeFilter !== "all" || readFilter !== "all"
                ? "Try adjusting your filters"
                : "You're all caught up!"}
            </Typography>
          </Box>
        ) : (
          notifications.map((n) => (
            <NotificationCard
              key={n._id}
              notif={n}
              onRead={handleRead}
              onDelete={handleDelete}
              onClick={handleCardClick}
            />
          ))
        )}
      </Box>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            sx={{
              "& .MuiPaginationItem-root": { color: "rgba(228,230,235,0.6)" },
              "& .Mui-selected": {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important",
                color: "#fff",
              },
            }}
          />
        </Box>
      )}

      {/* ── Detail Dialog ── */}
      <NotificationDetail
        notif={selected}
        onClose={() => setSelected(null)}
        onRead={handleRead}
        onDelete={handleDelete}
        navigate={navigate}
      />
    </Box>
  );
}