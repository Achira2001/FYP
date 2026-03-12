import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  Divider,
  Paper,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
} from '@mui/material';
import {
  FitnessCenter as FitnessIcon,
  Restaurant as RestaurantIcon,
  Medication as MedicationIcon,
  LocalHospital as HospitalIcon,
  Height as HeightIcon,
  MonitorWeight as WeightIcon,
  Bloodtype as BloodTypeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle,
  Message as MessageIcon,
  Visibility as VisibilityIcon,
  AccessTime as ClockIcon,
  CheckCircleOutline as CheckIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { format } from 'date-fns';
import axios from 'axios';

// ========================================
// THEME CONFIGURATION
// ========================================
const unifiedTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1', // Indigo
      light: '#A5B4FC',
      dark: '#4338CA',
    },
    secondary: {
      main: '#A855F7', // Purple
      light: '#D946EF',
      dark: '#7E22CE',
    },
    success: {
      main: '#10B981', // Emerald
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B', // Amber
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444', // Red
      light: '#F87171',
      dark: '#DC2626',
    },
    background: {
      default: '#0F172A', // App Background
      paper: '#1E293B',   // Cards, Dialogs, Papers
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
      disabled: '#475569',
    },
    divider: 'rgba(99, 102, 241, 0.1)',
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
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03))',
          backdropFilter: 'blur(10px)',
          backgroundColor: '#1E293B',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1E293B',
          border: '1px solid rgba(99, 102, 241, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
        },
      },
    },
  },
});

// ========================================
// API CONFIGURATION
// ========================================
const API_BASE_URL = 'http://localhost:5000/api';

// ========================================
// MAIN COMPONENT
// ========================================
export default function PatientDashboard() {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [userData, setUserData] = useState(null);
  const [medications, setMedications] = useState([]);
  const [queries, setQueries] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [queryDialog, setQueryDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ========================================
  // FETCH DATA
  // ========================================
  useEffect(() => {
    fetchDashboardData();
    fetchPatientQueries();
    fetchUnreadCount();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Please login to continue');
      }

      // Fetch user profile
      const userResponse = await axios.get(`${API_BASE_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUserData(userResponse.data.user);
      setEditData(userResponse.data.user);

      // Fetch medications
      try {
        const medsResponse = await axios.get(`${API_BASE_URL}/medications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const medsData = medsResponse.data;
        if (Array.isArray(medsData)) {
          setMedications(medsData);
        } else if (medsData.data && Array.isArray(medsData.data)) {
          setMedications(medsData.data);
        } else if (medsData.medications && Array.isArray(medsData.medications)) {
          setMedications(medsData.medications);
        }
      } catch (medError) {
        console.error('Failed to load medications:', medError);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientQueries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/patient/queries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQueries(response.data.data || []);
    } catch (error) {
      console.error('Failed to load queries:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/patient/queries/unread/count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleViewQuery = async (queryId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/patient/queries/${queryId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedQuery(response.data.data);
      setQueryDialog(true);

      // Refresh unread count after viewing
      fetchUnreadCount();
      fetchPatientQueries();
    } catch (error) {
      console.error('Failed to load query details:', error);
      setError('Failed to load query details');
    }
  };

  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/profile`, editData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setUserData(response.data.user);
      setEditData(response.data.user);
      setEditMode(false);
      setSuccess('Health information updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.message || err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'responded': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon fontSize="small" />;
      case 'responded': return <CheckIcon fontSize="small" />;
      default: return <ClockIcon fontSize="small" />;
    }
  };

  // ========================================
  // RENDER: LOADING STATE
  // ========================================
  if (loading) {
    return (
      <ThemeProvider theme={unifiedTheme}>
        <Box
          sx={{
            minHeight: '100vh',
            background: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </ThemeProvider>
    );
  }

  // ========================================
  // RENDER: DOCTOR MESSAGES TAB
  // ========================================
  const renderDoctorMessages = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MessageIcon /> Doctor Messages
              </Typography>
              <Chip
                label={`${unreadCount} Unread`}
                color={unreadCount > 0 ? 'error' : 'default'}
                size="small"
              />
            </Box>

            {queries.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <MessageIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No messages yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Send a message to your doctor from the Medicine Reminders page
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Doctor</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Your Question</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {queries.map((query) => (
                      <TableRow
                        key={query._id}
                        hover
                        sx={{
                          bgcolor: query.status === 'responded' && !query.isReadByPatient
                            ? 'rgba(16, 185, 129, 0.05)'
                            : 'transparent'
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {query.doctorEmail?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {query.doctorId?.fullName || 'Dr. ' + query.doctorEmail?.split('@')[0]}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {query.doctorEmail}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                            {query.question.substring(0, 80)}
                            {query.question.length > 80 ? '...' : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(new Date(query.createdAt), 'MMM dd, yyyy')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={query.status}
                              color={getStatusColor(query.status)}
                              size="small"
                              icon={getStatusIcon(query.status)}
                            />
                            {query.status === 'responded' && !query.isReadByPatient && (
                              <Badge color="error" variant="dot" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleViewQuery(query._id)}
                            color="primary"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // ========================================
  // RENDER: HEALTH INFO TAB
  // ========================================
  const renderHealthInfo = () => (
    <Box>
      {/* HEADER */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" sx={{ color: '#FFFFFF' }}>💪 Health Information</Typography>
        <Button
          variant={editMode ? "contained" : "outlined"}
          startIcon={editMode ? <CheckCircle /> : <EditIcon />}
          onClick={() => {
            if (editMode) handleSave();
            else setEditMode(true);
          }}
        >
          {editMode ? "Save Changes" : "Edit"}
        </Button>
      </Box>

      {/* TWO COLUMN ROW */}
      <Grid container spacing={3}>
        {/* LEFT – HEALTH METRICS */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <FitnessIcon /> Health Metrics
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    label="Blood Type"
                    value={editData.bloodType || ""}
                    disabled={!editMode}
                    onChange={(e) =>
                      handleInputChange("bloodType", e.target.value)
                    }
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Height (cm)"
                    type="number"
                    value={editData.height || ""}
                    disabled={!editMode}
                    onChange={(e) =>
                      handleInputChange("height", e.target.value)
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Weight (kg)"
                    type="number"
                    value={editData.weight || ""}
                    disabled={!editMode}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                  />
                </Grid>

                {editData.height && editData.weight && (
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="center" mt={1}>
                      <Chip
                        color="success"
                        label={`BMI: ${(
                          editData.weight /
                          ((editData.height / 100) ** 2)
                        ).toFixed(1)}`}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT – MEAL TIMES */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <RestaurantIcon /> Meal Times
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Breakfast"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    value={editData.mealTimes?.breakfast || "08:00"}
                    disabled={!editMode}
                    onChange={(e) =>
                      handleInputChange("mealTimes", {
                        ...editData.mealTimes,
                        breakfast: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Lunch"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    value={editData.mealTimes?.lunch || "13:00"}
                    disabled={!editMode}
                    onChange={(e) =>
                      handleInputChange("mealTimes", {
                        ...editData.mealTimes,
                        lunch: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dinner"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    value={editData.mealTimes?.dinner || "19:00"}
                    disabled={!editMode}
                    onChange={(e) =>
                      handleInputChange("mealTimes", {
                        ...editData.mealTimes,
                        dinner: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Night"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    value={editData.mealTimes?.night || "22:00"}
                    disabled={!editMode}
                    onChange={(e) =>
                      handleInputChange("mealTimes", {
                        ...editData.mealTimes,
                        night: e.target.value,
                      })
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // ========================================
  // RENDER: MEDICAL HISTORY TAB
  // ========================================
  const renderMedicalHistory = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HospitalIcon /> Medical History
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {/* Add medical history */ }}
              >
                Add Condition
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Condition</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Diagnosed Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userData?.medicalHistory?.map((condition, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{condition.condition}</TableCell>
                      <TableCell>
                        {condition.diagnosedDate ? format(new Date(condition.diagnosedDate), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>{condition.notes || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={condition.isActive ? 'Active' : 'Inactive'}
                          color={condition.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!userData?.medicalHistory || userData.medicalHistory.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No medical history recorded
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // ========================================
  // RENDER: MEDICATIONS TAB
  // ========================================
  const renderMedications = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MedicationIcon /> Current Medications
              </Typography>
            </Box>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(168, 85, 247, 0.1)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Medication</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Dosage</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Times</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Meal Relation</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medications.map((medication, index) => (
                    <TableRow key={medication._id || index} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{medication.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={medication.drugType?.toUpperCase() || 'N/A'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{medication.quantity}x {medication.dosage}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {medication.timePeriods?.map((period, idx) => (
                            <Chip
                              key={idx}
                              label={period}
                              size="small"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {medication.mealRelation?.replace('_', ' ') || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>{medication.reminderDays || 30} days</TableCell>
                      <TableCell>
                        <Chip
                          label={medication.isActive ? 'Active' : 'Inactive'}
                          color={medication.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {medications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No medications recorded. Add medications from the Medicine Reminders page.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {medications.length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 18 }} />
                  <strong>{medications.length}</strong> active medication{medications.length !== 1 ? 's' : ''} with scheduled reminders
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // ========================================
  // MAIN RENDER
  // ========================================
  return (
    <ThemeProvider theme={unifiedTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: '#0F172A',
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Welcome Header */}
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar
                  sx={{
                    width: 70,
                    height: 70,
                    bgcolor: 'primary.main',
                    fontSize: '1.8rem',
                  }}
                >
                  {userData?.fullName?.charAt(0).toUpperCase()}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h4" gutterBottom>
                    Welcome, {userData?.fullName}! 👋
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage your health information and medical records
                  </Typography>
                </Box>
                {unreadCount > 0 && (
                  <Chip
                    icon={<MessageIcon />}
                    label={`${unreadCount} New Response${unreadCount > 1 ? 's' : ''}`}
                    color="error"
                    onClick={() => setSelectedTab(3)}
                    sx={{ cursor: 'pointer' }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={(e, newValue) => setSelectedTab(newValue)}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab icon={<FitnessIcon />} label="Health Info" iconPosition="start" />
              <Tab icon={<HospitalIcon />} label="Medical History" iconPosition="start" />
              <Tab icon={<MedicationIcon />} label="Medications" iconPosition="start" />
              <Tab
                icon={
                  <Badge badgeContent={unreadCount} color="error">
                    <MessageIcon />
                  </Badge>
                }
                label="Doctor Messages"
                iconPosition="start"
              />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {selectedTab === 0 && renderHealthInfo()}
          {selectedTab === 1 && renderMedicalHistory()}
          {selectedTab === 2 && renderMedications()}
          {selectedTab === 3 && renderDoctorMessages()}
        </Container>

        {/* Query Details Dialog */}
        <Dialog
          open={queryDialog}
          onClose={() => setQueryDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              Message Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Conversation with {selectedQuery?.doctorId?.fullName || selectedQuery?.doctorEmail}
            </Typography>
          </DialogTitle>
          <DialogContent>
            {selectedQuery && (
              <Box>
                {/* Your Question */}
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Your Question:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedQuery.question}
                    </Typography>
                  </Paper>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Sent: {format(new Date(selectedQuery.createdAt), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>

                {/* Doctor's Response */}
                {selectedQuery.response ? (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Doctor's Response:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedQuery.response}
                      </Typography>
                    </Paper>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Responded: {selectedQuery.respondedAt ? format(new Date(selectedQuery.respondedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </Typography>
                  </Box>
                ) : (
                  <Alert severity="info" icon={<ClockIcon />}>
                    Waiting for doctor's response...
                  </Alert>
                )}

                {/* Status */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                  <Chip
                    label={selectedQuery.status.charAt(0).toUpperCase() + selectedQuery.status.slice(1)}
                    color={getStatusColor(selectedQuery.status)}
                    icon={getStatusIcon(selectedQuery.status)}
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setQueryDialog(false)} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}