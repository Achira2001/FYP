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
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { format } from 'date-fns';
import axios from 'axios';

// ========================================
// THEME CONFIGURATION
// ========================================
const dashboardTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1',
      light: '#A5B4FC',
      dark: '#4338CA',
    },
    secondary: {
      main: '#A855F7',
      light: '#D946EF',
      dark: '#7E22CE',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
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
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ========================================
  // FETCH DATA
  // ========================================
  useEffect(() => {
    fetchDashboardData();
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

  // ========================================
  // RENDER: LOADING STATE
  // ========================================
  if (loading) {
    return (
      <ThemeProvider theme={dashboardTheme}>
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom right, #0F172A, #1E293B)',
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
  // RENDER: HEALTH INFO TAB
  // ========================================
  const renderHealthInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            💪 Health Information
          </Typography>
          <Button
            variant={editMode ? "contained" : "outlined"}
            startIcon={editMode ? <CheckCircle /> : <EditIcon />}
            onClick={() => {
              if (editMode) {
                handleSave();
              } else {
                setEditMode(true);
              }
            }}
          >
            {editMode ? 'Save Changes' : 'Edit'}
          </Button>
        </Box>
      </Grid>

      {/* Health Metrics Card */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FitnessIcon /> Health Metrics
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Blood Type"
                  select
                  value={editData.bloodType || ''}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                  disabled={!editMode}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <BloodTypeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  type="number"
                  value={editData.height || ''}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  disabled={!editMode}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <HeightIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  type="number"
                  value={editData.weight || ''}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  disabled={!editMode}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <WeightIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              {userData?.height && userData?.weight && (
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="center" mt={1}>
                    <Chip 
                      label={`BMI: ${(userData.weight / ((userData.height / 100) ** 2)).toFixed(1)}`} 
                      color="success"
                      sx={{ fontSize: '1rem', py: 2.5, px: 3 }}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Meal Times Card */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestaurantIcon /> Meal Times
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Breakfast"
                  type="time"
                  value={editData.mealTimes?.breakfast || '08:00'}
                  onChange={(e) => handleInputChange('mealTimes', {
                    ...editData.mealTimes,
                    breakfast: e.target.value
                  })}
                  disabled={!editMode}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Lunch"
                  type="time"
                  value={editData.mealTimes?.lunch || '13:00'}
                  onChange={(e) => handleInputChange('mealTimes', {
                    ...editData.mealTimes,
                    lunch: e.target.value
                  })}
                  disabled={!editMode}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Dinner"
                  type="time"
                  value={editData.mealTimes?.dinner || '19:00'}
                  onChange={(e) => handleInputChange('mealTimes', {
                    ...editData.mealTimes,
                    dinner: e.target.value
                  })}
                  disabled={!editMode}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Night"
                  type="time"
                  value={editData.mealTimes?.night || '22:00'}
                  onChange={(e) => handleInputChange('mealTimes', {
                    ...editData.mealTimes,
                    night: e.target.value
                  })}
                  disabled={!editMode}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
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
                onClick={() => {/* Add medical history */}}
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
    <ThemeProvider theme={dashboardTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #0F172A, #1E293B, #0F172A)',
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
                <Box>
                  <Typography variant="h4" gutterBottom>
                    Welcome, {userData?.fullName}! 👋
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage your health information and medical records
                  </Typography>
                </Box>
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
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {selectedTab === 0 && renderHealthInfo()}
          {selectedTab === 1 && renderMedicalHistory()}
          {selectedTab === 2 && renderMedications()}
        </Container>
      </Box>
    </ThemeProvider>
  );
}