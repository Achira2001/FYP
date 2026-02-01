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
  LinearProgress,
  IconButton,
  Divider,
  Paper,
  Tab,
  Tabs,
  Alert,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Medication as MedicationIcon,
  Restaurant as RestaurantIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  LocalHospital as HospitalIcon,
  CalendarToday as CalendarIcon,
  AccessTime as ClockIcon,
  FitnessCenter as FitnessIcon,
  Favorite as HeartIcon,
  Speed as SpeedIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
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
  const [dietPlans, setDietPlans] = useState([]);
  const [todaysMedications, setTodaysMedications] = useState([]);
  const [adherenceData, setAdherenceData] = useState([]);
  const [activeDietPlan, setActiveDietPlan] = useState(null);

  // ========================================
  // FETCH DATA
  // ========================================
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const userResponse = await axios.get(`${API_BASE_URL}/users/profile`);
      setUserData(userResponse.data.data);

      // Fetch medications
      const medsResponse = await axios.get(`${API_BASE_URL}/medications`);
      setMedications(medsResponse.data.data || []);

      // Fetch diet plans
      const dietResponse = await axios.get(`${API_BASE_URL}/diet-plans/recent`);
      setDietPlans(dietResponse.data.data || []);
      
      if (dietResponse.data.data && dietResponse.data.data.length > 0) {
        setActiveDietPlan(dietResponse.data.data[0]);
      }

      // Fetch adherence stats
      const adherenceResponse = await axios.get(`${API_BASE_URL}/medications/adherence/stats`);
      setAdherenceData(adherenceResponse.data.data || []);

      // Get today's medications
      const today = new Date();
      const currentHour = today.getHours();
      let currentPeriod = 'morning';
      
      if (currentHour >= 12 && currentHour < 17) currentPeriod = 'afternoon';
      else if (currentHour >= 17 && currentHour < 21) currentPeriod = 'evening';
      else if (currentHour >= 21 || currentHour < 6) currentPeriod = 'night';

      const todayMeds = medsResponse.data.data?.filter(med => 
        med.isActive && med.timePeriods.includes(currentPeriod)
      ) || [];
      setTodaysMedications(todayMeds);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  const getBMIStatus = (bmi) => {
    if (!bmi) return { status: 'Unknown', color: 'default' };
    if (bmi < 18.5) return { status: 'Underweight', color: 'info' };
    if (bmi < 25) return { status: 'Normal', color: 'success' };
    if (bmi < 30) return { status: 'Overweight', color: 'warning' };
    return { status: 'Obese', color: 'error' };
  };

  const getAdherenceRate = () => {
    if (!adherenceData || adherenceData.length === 0) return 0;
    const total = adherenceData.reduce((sum, day) => sum + day.total, 0);
    const taken = adherenceData.reduce((sum, day) => sum + day.taken, 0);
    return total > 0 ? Math.round((taken / total) * 100) : 0;
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return medications
      .filter(med => med.isActive)
      .flatMap(med => 
        med.reminders.map(reminder => ({
          medication: med.name,
          time: reminder.time,
          period: reminder.period,
        }))
      )
      .filter(reminder => reminder.time > currentTime)
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(0, 3);
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

  const bmiInfo = getBMIStatus(userData?.bmi);
  const adherenceRate = getAdherenceRate();
  const upcomingReminders = getUpcomingReminders();

  // ========================================
  // RENDER: OVERVIEW TAB
  // ========================================
  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Welcome Card */}
      <Grid item xs={12}>
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {userData?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h4" gutterBottom>
                  Welcome back, {userData?.fullName}! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Here's your health summary for today
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {/* Navigate to profile edit */}}
              >
                Edit Profile
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Stats */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <MedicationIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">{medications.filter(m => m.isActive).length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Medications
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <CheckCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">{adherenceRate}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Adherence Rate
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <RestaurantIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">{dietPlans.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Diet Plans
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <SpeedIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">{userData?.bmi?.toFixed(1) || 'N/A'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  BMI
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Health Status Card */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Health Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Body Mass Index (BMI)
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h6">{userData?.bmi?.toFixed(1) || 'N/A'}</Typography>
                    <Chip
                      label={bmiInfo.status}
                      color={bmiInfo.color}
                      size="small"
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((userData?.bmi / 40) * 100, 100)}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Height / Weight
                  </Typography>
                  <Typography variant="body1">
                    {userData?.height || 'N/A'} cm / {userData?.weight || 'N/A'} kg
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Blood Type
                  </Typography>
                  <Typography variant="body1">
                    {userData?.bloodType || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Age
                  </Typography>
                  <Typography variant="body1">
                    {userData?.age || 'N/A'} years
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Medical Conditions
                  </Typography>
                  {userData?.medicalHistory && userData.medicalHistory.length > 0 ? (
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {userData.medicalHistory
                        .filter(h => h.isActive)
                        .map((history, idx) => (
                          <Chip
                            key={idx}
                            label={history.condition}
                            size="small"
                            color="warning"
                          />
                        ))}
                    </Box>
                  ) : (
                    <Typography variant="body2">None reported</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Today's Schedule */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🕐 Today's Schedule
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {todaysMedications.length > 0 ? (
              <List dense>
                {todaysMedications.map((med, idx) => (
                  <ListItem key={idx} divider={idx < todaysMedications.length - 1}>
                    <ListItemIcon>
                      <MedicationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={med.name}
                      secondary={`${med.dosage} - ${med.quantity} dose(s)`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">No medications scheduled for this period</Alert>
            )}

            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Upcoming Reminders:
              </Typography>
              {upcomingReminders.length > 0 ? (
                <List dense>
                  {upcomingReminders.map((reminder, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon>
                        <ClockIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={reminder.medication}
                        secondary={`${reminder.time} (${reminder.period})`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No upcoming reminders today
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Active Diet Plan */}
      {activeDietPlan && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  🍽️ Active Diet Plan
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedTab(2)}
                >
                  View Details
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary.main">
                      {activeDietPlan.recommendations.daily_calories}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Daily Calories
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {activeDietPlan.recommendations.protein_grams}g
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Protein
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {activeDietPlan.recommendations.carbs_grams}g
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Carbs
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary.main">
                      {activeDietPlan.recommendations.fats_grams}g
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fats
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Meal Plan Type:
                </Typography>
                <Chip
                  label={activeDietPlan.recommendations.meal_plan_type}
                  color="primary"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  // ========================================
  // RENDER: MEDICATIONS TAB
  // ========================================
  const renderMedicationsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            💊 My Medications
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {/* Navigate to add medication */}}
          >
            Add Medication
          </Button>
        </Box>
      </Grid>

      {medications.filter(m => m.isActive).map((med) => (
        <Grid item xs={12} md={6} key={med._id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {med.name}
                  </Typography>
                  <Chip
                    label={med.drugType}
                    size="small"
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={med.drugSubcategory}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <IconButton size="small" onClick={() => {/* Edit medication */}}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Dosage
                  </Typography>
                  <Typography variant="body1">
                    {med.quantity} {med.dosage}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Meal Relation
                  </Typography>
                  <Typography variant="body1">
                    {med.mealRelation.replace(/_/g, ' ')}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Schedule
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {med.reminders.map((reminder, idx) => (
                      <Chip
                        key={idx}
                        icon={<ClockIcon />}
                        label={`${reminder.period} - ${reminder.time}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>

                {med.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2">
                      {med.notes}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Reminders
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {med.reminderSettings.smsEnabled && (
                      <Chip label="SMS" size="small" color="success" />
                    )}
                    {med.reminderSettings.emailEnabled && (
                      <Chip label="Email" size="small" color="success" />
                    )}
                    {med.reminderSettings.calendarEnabled && (
                      <Chip label="Calendar" size="small" color="success" />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {medications.filter(m => m.isActive).length === 0 && (
        <Grid item xs={12}>
          <Alert severity="info">
            No active medications. Click "Add Medication" to add your first one!
          </Alert>
        </Grid>
      )}
    </Grid>
  );

  // ========================================
  // RENDER: DIET PLANS TAB
  // ========================================
  const renderDietPlansTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            🥗 My Diet Plans
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {/* Navigate to create diet plan */}}
          >
            Create New Plan
          </Button>
        </Box>
      </Grid>

      {dietPlans.map((plan, idx) => (
        <Grid item xs={12} md={6} key={plan._id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {plan.userInfo.name}'s Plan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(plan.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                {idx === 0 && (
                  <Chip label="Active" color="success" size="small" />
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Goal
                  </Typography>
                  <Typography variant="body1">
                    {plan.userInfo.goal}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    BMI
                  </Typography>
                  <Typography variant="body1">
                    {plan.userInfo.bmi.toFixed(1)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Daily Targets
                  </Typography>
                  <Box display="flex" gap={2}>
                    <Chip
                      label={`${plan.recommendations.daily_calories} kcal`}
                      size="small"
                      color="primary"
                    />
                    <Chip
                      label={`${plan.recommendations.protein_grams}g protein`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Meal Plan
                  </Typography>
                  <Typography variant="body1">
                    {plan.recommendations.meal_plan_type}
                  </Typography>
                </Grid>
              </Grid>

              <Box mt={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {/* View plan details */}}
                >
                  View Full Plan
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {dietPlans.length === 0 && (
        <Grid item xs={12}>
          <Alert severity="info">
            No diet plans yet. Create your first personalized diet plan!
          </Alert>
        </Grid>
      )}
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
          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={(e, newValue) => setSelectedTab(newValue)}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab icon={<PersonIcon />} label="Overview" iconPosition="start" />
              <Tab icon={<MedicationIcon />} label="Medications" iconPosition="start" />
              <Tab icon={<RestaurantIcon />} label="Diet Plans" iconPosition="start" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {selectedTab === 0 && renderOverviewTab()}
          {selectedTab === 1 && renderMedicationsTab()}
          {selectedTab === 2 && renderDietPlansTab()}
        </Container>
      </Box>
    </ThemeProvider>
  );
}