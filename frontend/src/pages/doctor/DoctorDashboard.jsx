import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Divider,
  Container,
  Fade,
  Zoom,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Stack,
  Tooltip,
  TableContainer,
  TablePagination
} from "@mui/material";
import {
  Calendar,
  FileText,
  Users,
  Activity,
  Bell,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Eye,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import {
  MedicalServices as MedicalServicesIcon,
  People as PeopleIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon
} from "@mui/icons-material";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#667eea",
      light: "#8b9aee",
      dark: "#4c63c9",
    },
    secondary: {
      main: "#764ba2",
      light: "#9567ba",
      dark: "#5a3878",
    },
    success: {
      main: "#03dac6",
      light: "#66fff9",
      dark: "#00a896",
    },
    error: {
      main: "#f5576c",
      light: "#ff8a95",
      dark: "#c83349",
    },
    warning: {
      main: "#ffc107",
      light: "#ffecb3",
      dark: "#c79100",
    },
    background: {
      default: "#0f1419",
      paper: "#1a1f2e",
    },
    text: {
      primary: "#e4e6eb",
      secondary: "#b0b3b8",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "linear-gradient(135deg, #1a1f2e 0%, #252b4a 100%)",
          border: "1px solid rgba(102, 126, 234, 0.15)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "linear-gradient(135deg, #1a1f2e 0%, #252b4a 100%)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "rgba(102, 126, 234, 0.1)",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function DoctorDashboard() {
  const [stats, setStats] = useState(null);
  const [queries, setQueries] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [response, setResponse] = useState("");
  const [responseDialog, setResponseDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getAuthToken = () => localStorage.getItem("token");

  const apiRequest = async (url, options = {}) => {
    const token = getAuthToken();
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, defaultOptions);
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          throw new Error("Authentication failed");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const statsResponse = await apiRequest("/dashboard/stats");
      setStats(statsResponse.data);
      const queriesResponse = await apiRequest("/queries?limit=10");
      setQueries(queriesResponse.data);
      const patientsResponse = await apiRequest("/patients");
      setPatients(patientsResponse.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      showSnackbar("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleViewQuery = async (queryId) => {
    try {
      const response = await apiRequest(`/queries/${queryId}`);
      setSelectedQuery(response.data);
      setDetailsDialog(true);
    } catch (error) {
      console.error("Failed to load query details:", error);
      showSnackbar("Failed to load query details", "error");
    }
  };

  const handleOpenResponseDialog = (query) => {
    setSelectedQuery(query);
    setResponse("");
    setResponseDialog(true);
  };

  const handleSendResponse = async () => {
    if (!response.trim()) {
      showSnackbar("Please enter a response", "error");
      return;
    }
    try {
      await apiRequest(`/queries/${selectedQuery._id}/reply`, {
        method: "POST",
        body: JSON.stringify({ response }),
      });
      showSnackbar("Response sent successfully!");
      setResponseDialog(false);
      setResponse("");
      loadDashboardData();
    } catch (error) {
      console.error("Failed to send response:", error);
      showSnackbar("Failed to send response", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "warning";
      case "responded": return "success";
      case "closed": return "default";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock size={14} />;
      case "responded": return <CheckCircle size={14} />;
      case "closed": return <CheckCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Card sx={{ p: 4, borderRadius: 3 }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <CircularProgress size={60} thickness={4} sx={{ color: "primary.main" }} />
              <Typography variant="h6" sx={{ mt: 2, color: "text.secondary" }}>
                Loading dashboard...
              </Typography>
            </Box>
          </Card>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
        <Container maxWidth="xl">
          <Fade in timeout={800}>
            <Box>
              {snackbar.open && (
                <Alert
                  severity={snackbar.severity}
                  sx={{ mb: 3, borderRadius: 2 }}
                  onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                  {snackbar.message}
                </Alert>
              )}

              {/* Header Banner */}
              <Zoom in timeout={600}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    mb: 4,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "1px solid rgba(102, 126, 234, 0.3)",
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 2, md: 4 }
                    }}
                  >
                    <Box
                      display="flex"
                      flexDirection={{ xs: "column", md: "row" }}
                      alignItems="center"
                      justifyContent="space-between"
                      textAlign={{ xs: "center", md: "left" }}
                      gap={2}
                    >
                      {/* LEFT SIDE */}
                      <Box
                        display="flex"
                        flexDirection={{ xs: "column", md: "row" }}
                        alignItems="center"
                        gap={2}
                      >
                        <Avatar
                          sx={{
                            width: { xs: 60, md: 80 },
                            height: { xs: 60, md: 80 },
                            bgcolor: "rgba(255,255,255,0.2)",
                            border: "3px solid rgba(255,255,255,0.3)"
                          }}
                        >
                          <MedicalServicesIcon sx={{ fontSize: { xs: 28, md: 40 } }} />
                        </Avatar>

                        <Box>
                          <Typography
                            sx={{
                              fontSize: { xs: "1.4rem", md: "2.5rem" },
                              fontWeight: 700,
                              color: "white",
                              mb: 0.5
                            }}
                          >
                            Doctor Dashboard
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: { xs: "0.85rem", md: "1rem" },
                              color: "rgba(255,255,255,0.9)"
                            }}
                          >
                            Manage your patients and respond to queries
                          </Typography>
                        </Box>
                      </Box>

                      {/* RIGHT SIDE */}
                      <Box
                        display="flex"
                        flexDirection={{ xs: "column", sm: "row" }}
                        gap={1}
                        width={{ xs: "100%", md: "auto" }}
                        justifyContent={{ xs: "center", md: "flex-end" }}
                        alignItems="center"
                      >
                        {stats?.unreadQueries > 0 && (
                          <Chip
                            label={`${stats.unreadQueries} unread`}
                            sx={{
                              bgcolor: "rgba(255,255,255,0.2)",
                              color: "white",
                              fontWeight: 600,
                              width: { xs: "100%", sm: "auto" }
                            }}
                          />
                        )}

                        <Button
                          variant="contained"
                          startIcon={<RefreshIcon />}
                          onClick={loadDashboardData}
                          fullWidth
                          sx={{
                            bgcolor: "rgba(255,255,255,0.15)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                            width: { xs: "100%", sm: "auto" }
                          }}
                        >
                          Refresh
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>

              {/* Stats Cards */}
              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(102, 126, 234, 0.2)" }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="text.secondary">Total Queries</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
                            {stats?.totalQueries || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {stats?.recentQueries || 0} this week
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: "rgba(102, 126, 234, 0.2)", width: 56, height: 56 }}>
                          <MessageSquare size={28} color="#667eea" />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(255, 193, 7, 0.2)" }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="text.secondary">Pending</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: "warning.main" }}>
                            {stats?.pendingQueries || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Awaiting response
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: "rgba(255, 193, 7, 0.2)", width: 56, height: 56 }}>
                          <Clock size={28} color="#ffc107" />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(118, 75, 162, 0.2)" }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="text.secondary">Patients</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: "secondary.main" }}>
                            {stats?.totalPatients || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Active patients
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: "rgba(118, 75, 162, 0.2)", width: 56, height: 56 }}>
                          <Users size={28} color="#764ba2" />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(3, 218, 198, 0.2)" }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="text.secondary">Response Rate</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: "success.main" }}>
                            {stats?.responseRate || 0}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Avg: {stats?.avgResponseTimeHours || 0}h
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: "rgba(3, 218, 198, 0.2)", width: 56, height: 56 }}>
                          <TrendingUp size={28} color="#03dac6" />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Tabs */}
              <Card elevation={0} sx={{ borderRadius: 3, mb: 3, border: "1px solid rgba(102, 126, 234, 0.2)" }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  sx={{
                    px: 2,
                    "& .MuiTabs-indicator": { backgroundColor: "primary.main" },
                    "& .Mui-selected": { color: "primary.main !important" },
                  }}
                >
                  <Tab label="Patient Queries" />
                  <Tab label="My Patients" />
                </Tabs>
              </Card>

              {/* Patient Queries Tab */}
              {activeTab === 0 && (
                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(102, 126, 234, 0.2)" }}>
                  <CardContent sx={{ pb: 0 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2} color="text.primary">
                      Recent Patient Queries
                    </Typography>
                  </CardContent>

                  {queries.length === 0 ? (
                    <Box sx={{ p: 3 }}>
                      <Alert severity="info" sx={{ borderRadius: 2 }}>No patient queries yet</Alert>
                    </Box>
                  ) : (
                    <>
                      <TableContainer>
                        <Table>
                          <TableHead sx={{ backgroundColor: "rgba(102, 126, 234, 0.1)" }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Query</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {queries
                              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                              .map((query) => (
                                <TableRow
                                  key={query._id}
                                  hover
                                  sx={{ "&:hover": { bgcolor: "rgba(102, 126, 234, 0.05)" } }}
                                >
                                  <TableCell>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                      <Avatar sx={{ bgcolor: "primary.dark", width: 38, height: 38, fontSize: "0.9rem" }}>
                                        {query.patientInfo?.name?.charAt(0) || "?"}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="body2" fontWeight={600}>
                                          {query.patientInfo?.name || "Unknown"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {query.patientInfo?.email}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                                      {query.question.substring(0, 80)}
                                      {query.question.length > 80 ? "..." : ""}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {new Date(query.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(query.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={query.status}
                                      color={getStatusColor(query.status)}
                                      size="small"
                                      icon={getStatusIcon(query.status)}
                                      sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Box display="flex" justifyContent="center" gap={0.5}>
                                      <Tooltip title="View Details">
                                        <IconButton
                                          size="small"
                                          color="primary"
                                          onClick={() => handleViewQuery(query._id)}
                                        >
                                          <Eye size={18} />
                                        </IconButton>
                                      </Tooltip>
                                      {query.status === "pending" && (
                                        <Tooltip title="Send Response">
                                          <IconButton
                                            size="small"
                                            color="success"
                                            onClick={() => handleOpenResponseDialog(query)}
                                          >
                                            <Send size={18} />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={queries.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                      />
                    </>
                  )}
                </Card>
              )}

              {/* Patients Tab */}
              {activeTab === 1 && (
                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(102, 126, 234, 0.2)" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={2} color="text.primary">
                      My Patients
                    </Typography>

                    {patients.length === 0 ? (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>No patients yet</Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {patients.map((patient) => (
                          <Grid item xs={12} md={6} lg={4} key={patient._id}>
                            <Card
                              elevation={0}
                              sx={{
                                borderRadius: 3,
                                border: "1px solid rgba(102, 126, 234, 0.2)",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  border: "1px solid rgba(102, 126, 234, 0.5)",
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
                                },
                              }}
                            >
                              <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                  <Avatar
                                    sx={{
                                      width: 50,
                                      height: 50,
                                      mr: 2,
                                      bgcolor: "rgba(102, 126, 234, 0.3)",
                                      border: "2px solid rgba(102, 126, 234, 0.4)",
                                      color: "primary.light",
                                      fontWeight: 700,
                                      fontSize: "1.2rem",
                                    }}
                                  >
                                    {patient.fullName?.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                      {patient.fullName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {patient.email}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Divider sx={{ my: 1.5, borderColor: "rgba(102, 126, 234, 0.15)" }} />
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                  <Typography variant="body2" color="text.secondary">Total Queries:</Typography>
                                  <Typography variant="body2" fontWeight="bold" color="text.primary">
                                    {patient.totalQueries || 0}
                                  </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                  <Typography variant="body2" color="text.secondary">Pending:</Typography>
                                  <Chip
                                    label={patient.pendingQueries || 0}
                                    size="small"
                                    color={patient.pendingQueries > 0 ? "warning" : "default"}
                                    sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                                  />
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">Last Contact:</Typography>
                                  <Typography variant="body2" color="text.primary">
                                    {patient.lastQueryDate
                                      ? new Date(patient.lastQueryDate).toLocaleDateString()
                                      : "N/A"}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Response Dialog */}
              <Dialog
                open={responseDialog}
                onClose={() => setResponseDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
              >
                <DialogTitle
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                    <Send size={20} color="white" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="white">
                      Respond to Patient Query
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                      {selectedQuery?.patientInfo?.name}
                    </Typography>
                  </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Patient's Question:
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: "rgba(102, 126, 234, 0.1)",
                        border: "1px solid rgba(102, 126, 234, 0.2)",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2">{selectedQuery?.question}</Typography>
                    </Paper>
                  </Box>
                  <TextField
                    label="Your Response"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    multiline
                    rows={6}
                    fullWidth
                    placeholder="Type your response here..."
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                  <Button onClick={() => setResponseDialog(false)} variant="outlined">
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSendResponse}
                    startIcon={<Send size={16} />}
                    disabled={!response.trim()}
                  >
                    Send Response
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Query Details Dialog */}
              <Dialog
                open={detailsDialog}
                onClose={() => setDetailsDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
              >
                <DialogTitle
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                    <Eye size={20} color="white" />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" color="white">
                    Query Details
                  </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                  {selectedQuery && (
                    <Box>
                      <Box mb={3}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Patient Information:
                        </Typography>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: "rgba(102, 126, 234, 0.1)",
                            border: "1px solid rgba(102, 126, 234, 0.2)",
                            borderRadius: 2,
                          }}
                        >
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">Name</Typography>
                              <Typography variant="body2" fontWeight={600}>{selectedQuery.patientInfo?.name}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">Email</Typography>
                              <Typography variant="body2">{selectedQuery.patientInfo?.email}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">Phone</Typography>
                              <Typography variant="body2">{selectedQuery.patientInfo?.phone || "N/A"}</Typography>
                            </Grid>
                            {selectedQuery.patientInfo?.age && (
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Age</Typography>
                                <Typography variant="body2">{selectedQuery.patientInfo.age} years</Typography>
                              </Grid>
                            )}
                          </Grid>
                        </Paper>
                      </Box>

                      <Box mb={3}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Question:
                        </Typography>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: "rgba(102, 126, 234, 0.08)",
                            border: "1px solid rgba(102, 126, 234, 0.15)",
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                            {selectedQuery.question}
                          </Typography>
                        </Paper>
                      </Box>

                      {selectedQuery.response && (
                        <Box mb={3}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Your Response:
                          </Typography>
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor: "rgba(3, 218, 198, 0.08)",
                              border: "1px solid rgba(3, 218, 198, 0.2)",
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                              {selectedQuery.response}
                            </Typography>
                          </Paper>
                        </Box>
                      )}

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Chip
                          label={selectedQuery.status}
                          color={getStatusColor(selectedQuery.status)}
                          icon={getStatusIcon(selectedQuery.status)}
                          sx={{ fontWeight: 600 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Submitted: {new Date(selectedQuery.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                  <Button onClick={() => setDetailsDialog(false)} variant="outlined">
                    Close
                  </Button>
                  {selectedQuery?.status === "pending" && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        setDetailsDialog(false);
                        handleOpenResponseDialog(selectedQuery);
                      }}
                      startIcon={<Send size={16} />}
                    >
                      Respond
                    </Button>
                  )}
                </DialogActions>
              </Dialog>
            </Box>
          </Fade>
        </Container>
      </Box>
    </ThemeProvider>
  );
}