import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  Avatar,
  Fab,
  CircularProgress,
  Badge,
  Divider,
  Switch,
  FormControlLabel,
  Collapse,
  ButtonGroup
} from '@mui/material';
import {
  Medication,
  Air,
  LocalHospital,
  Visibility,
  Opacity,
  Add,
  Delete,
  Schedule,
  CalendarToday,
  Sms,
  NotificationAdd,
  Restaurant,
  AccessTime,
  CheckCircle,
  Save,
  ExpandMore,
  Phone,
  Email,
  Notifications,
  CloudSync,
  Timer,
  Send
} from '@mui/icons-material';

// API base URL
const API_BASE = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MedicalReminderSystem = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMealTimes, setShowMealTimes] = useState(false);
  const [mealTimes, setMealTimes] = useState({
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '19:00',
    night: '22:00' 
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [reminderDialog, setReminderDialog] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    calendar: false,
    sms: false,
    email: false
  });
  const [userProfile, setUserProfile] = useState(null);
  
  // Doctor Info States
  const [doctorInfo, setDoctorInfo] = useState({
    name: '',
    hospital: '',
    email: '',
    phone: ''
  });
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [showAskDoctor, setShowAskDoctor] = useState(false);
  const [doctorQuery, setDoctorQuery] = useState('');

  // Drug types configuration
  const drugTypes = [
    {
      key: 'oral',
      label: 'Oral Medicines',
      icon: <Medication />,
      color: '#2196F3',
      subcategories: ['Tablets', 'Capsules', 'Syrups', 'Powders', 'Suspensions']
    },
    {
      key: 'inhalers',
      label: 'Inhalers',
      icon: <Air />,
      color: '#4CAF50',
      subcategories: ['MDI (Metered Dose)', 'DPI (Dry Powder)', 'Nebulizer', 'Soft Mist']
    },
    {
      key: 'patches',
      label: 'Patches',
      icon: <LocalHospital />,
      color: '#FF9800',
      subcategories: ['Transdermal', 'Nicotine Patches', 'Pain Relief', 'Hormone Patches']
    },
    {
      key: 'drops',
      label: 'Eye/Ear Drops',
      icon: <Visibility />,
      color: '#9C27B0',
      subcategories: ['Eye Drops', 'Ear Drops', 'Nasal Drops', 'Nasal Spray']
    },
    {
      key: 'insulin',
      label: 'Insulin',
      icon: <Opacity />,
      color: '#F44336',
      subcategories: ['Rapid Acting', 'Long Acting', 'Intermediate', 'Mixed Insulin']
    }
  ];

  const timePeriods = [
    { key: 'morning', label: 'Morning', time: '08:00' },
    { key: 'afternoon', label: 'Afternoon', time: '14:00' },
    { key: 'evening', label: 'Evening', time: '18:00' },
    { key: 'night', label: 'Night', time: '22:00' }
  ];

  const mealRelations = [
    { key: 'before_meals', label: 'Before Meals', offset: -30 },
    { key: 'with_meals', label: 'With Meals', offset: 0 },
    { key: 'after_meals', label: 'After Meals', offset: 30 },
    { key: 'independent_of_meals', label: 'Independent of Meals', offset: null }
  ];

  const [currentMedication, setCurrentMedication] = useState({
    drugType: drugTypes[0].key,
    drugSubcategory: '',
    name: '',
    dosage: '',
    quantity: 1,
    timePeriods: [],
    mealRelation: 'before_meals',
    notes: '',
    reminderDays: 7,
    reminderSettings: {
      smsEnabled: true,
      emailEnabled: true,
      calendarEnabled: true,
      phoneCallEnabled: false
    },
    frequency: {
      type: 'daily',
      interval: 1,
      duration: 30
    }
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API request helper
  const apiRequest = async (url, options = {}) => {
    const token = getAuthToken();
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${API_BASE}${url}`, defaultOptions);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  // Load user profile
  const loadUserProfile = async () => {
    try {
      const response = await apiRequest('/profile');
      setUserProfile(response.user);
      
      if (response.user.mealTimes) {
        setMealTimes(response.user.mealTimes);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      showSnackbar('Failed to load user profile', 'error');
    }
  };

  // Load medications
  const loadMedications = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/medications');
      
      let medicationsData = [];
      
      if (Array.isArray(response)) {
        medicationsData = response;
      } else if (response && Array.isArray(response.data)) {
        medicationsData = response.data;
      } else if (response && Array.isArray(response.medications)) {
        medicationsData = response.medications;
      } else {
        console.warn('Unexpected API response structure:', response);
        medicationsData = [];
      }
      
      setMedications(medicationsData);
    } catch (error) {
      console.error('Failed to load medications:', error);
      showSnackbar('Failed to load medications', 'error');
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  // Load doctor info
  const loadDoctorInfo = async () => {
    try {
      const response = await apiRequest('/doctor-info');
      if (response.data) {
        setDoctorInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to load doctor info:', error);
    }
  };

  // Save doctor info
  const handleSaveDoctorInfo = async () => {
    try {
      setLoading(true);
      await apiRequest('/doctor-info', {
        method: 'PUT',
        body: JSON.stringify(doctorInfo)
      });
      showSnackbar('Doctor information saved successfully!');
      setShowDoctorForm(false);
    } catch (error) {
      console.error('Failed to save doctor info:', error);
      showSnackbar('Failed to save doctor information', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Send query to doctor
  const handleAskDoctor = async () => {
    if (!doctorQuery.trim()) {
      showSnackbar('Please describe your problem', 'error');
      return;
    }

    if (!doctorInfo.email && !doctorInfo.phone) {
      showSnackbar('Please add doctor information first', 'error');
      setShowAskDoctor(false);
      setShowDoctorForm(true);
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest('/doctor-query', {
        method: 'POST',
        body: JSON.stringify({ problem: doctorQuery })
      });
      
      showSnackbar('Query sent to doctor successfully!');
      setShowAskDoctor(false);
      setDoctorQuery('');
    } catch (error) {
      console.error('Failed to send query:', error);
      showSnackbar('Failed to send query to doctor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
    loadMedications();
    loadDoctorInfo();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentMedication(prev => ({
      ...prev,
      drugType: drugTypes[newValue].key,
      drugSubcategory: drugTypes[newValue].subcategories[0]
    }));
  };

  const handleTimePeriodChange = (event, newTimePeriods) => {
    setCurrentMedication(prev => ({
      ...prev,
      timePeriods: newTimePeriods
    }));
  };

  const handleMealTimeChange = (meal, time) => {
    setMealTimes(prev => ({ ...prev, [meal]: time }));
    
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        mealTimes: {
          ...userProfile.mealTimes,
          [meal]: time
        }
      };
      
      apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(updatedProfile)
      }).catch(error => {
        console.error('Failed to update meal times:', error);
      });
    }
  };

  const calculateReminderTime = (timePeriod, mealRelation) => {
    const mealTimeMap = {
      morning: mealTimes.breakfast,
      afternoon: mealTimes.lunch,
      evening: mealTimes.dinner,
      night: mealTimes.night 
    };

    const relation = mealRelations.find(r => r.key === mealRelation);
    
    if (!relation || relation.offset === null) {
      const defaultTimes = {
        morning: '08:00',
        afternoon: '14:00',
        evening: '18:00',
        night: '22:00'
      };
      return defaultTimes[timePeriod] || '12:00';
    }

    const baseTime = mealTimeMap[timePeriod] || '12:00';
    const [hours, minutes] = baseTime.split(':').map(Number);
    
    const totalMinutes = hours * 60 + minutes + relation.offset;
    const finalHours = Math.floor(totalMinutes / 60) % 24;
    const finalMinutes = totalMinutes % 60;
    
    return `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
  };

  const handleAddMedication = async () => {
    if (!currentMedication.name || !currentMedication.dosage || currentMedication.timePeriods.length === 0) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const reminders = currentMedication.timePeriods.map(period => ({
        period,
        time: calculateReminderTime(period, currentMedication.mealRelation)
      }));

      const medicationData = {
        ...currentMedication,
        reminders,
        mealTimesSnapshot: mealTimes
      };

      const response = await apiRequest('/medications', {
        method: 'POST',
        body: JSON.stringify(medicationData)
      });

      const newMedication = response.data || response.medication;
      setMedications(prev => [newMedication, ...prev]);
      
      setCurrentMedication({
        drugType: drugTypes[activeTab].key,
        drugSubcategory: drugTypes[activeTab].subcategories[0],
        name: '',
        dosage: '',
        quantity: 1,
        timePeriods: [],
        mealRelation: 'before_meals',
        notes: '',
        reminderDays: 7,
        reminderSettings: {
          smsEnabled: true,
          emailEnabled: true,
          calendarEnabled: true,
          phoneCallEnabled: false
        },
        frequency: {
          type: 'daily',
          interval: 1,
          duration: 30
        }
      });

      showSnackbar('Medication added successfully!');
      
      if (currentMedication.reminderSettings.calendarEnabled) {
        handleSyncCalendar([newMedication]);
      }
      if (currentMedication.reminderSettings.smsEnabled) {
        handleScheduleSMS([newMedication]);
      }
      if (currentMedication.reminderSettings.emailEnabled) {
        handleScheduleEmailReminders([newMedication]);
      }

    } catch (error) {
      console.error('Add medication error:', error);
      showSnackbar('Failed to add medication: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedication = async (id) => {
    try {
      setLoading(true);
      await apiRequest(`/medications/${id}`, { method: 'DELETE' });
      
      setMedications(prev => prev.filter(med => med._id !== id));
      showSnackbar('Medication deleted successfully!');
    } catch (error) {
      console.error('Delete medication error:', error);
      showSnackbar('Failed to delete medication: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCalendar = async (medicationsToSync = medications) => {
    if (medicationsToSync.length === 0) {
      showSnackbar('No medications to sync', 'warning');
      return;
    }

    if (!userProfile || !userProfile.email) {
      showSnackbar('Please add your email in your profile to sync with calendar', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      const response = await apiRequest('/medications/sync/google-calendar', {
        method: 'POST',
        body: JSON.stringify({ medications: medicationsToSync })
      });
      
      setSyncStatus(prev => ({ ...prev, calendar: true }));
      showSnackbar(response.message || 'Calendar sync initiated!');
      setReminderDialog(true);
      
    } catch (error) {
      console.error('Calendar sync error:', error);
      showSnackbar('Calendar sync failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSMS = async (medicationsToSync = medications) => {
    if (medicationsToSync.length === 0) {
      showSnackbar('No medications to schedule', 'warning');
      return;
    }

    if (!userProfile || !userProfile.phone) {
      showSnackbar('Please add your phone number in your profile to receive SMS reminders', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      const response = await apiRequest('/medications/schedule/sms', {
        method: 'POST',
        body: JSON.stringify({ medications: medicationsToSync })
      });
      
      setSyncStatus(prev => ({ ...prev, sms: true }));
      showSnackbar(response.message || 'SMS reminders scheduled!');
      
    } catch (error) {
      console.error('SMS scheduling error:', error);
      showSnackbar('SMS scheduling failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleEmailReminders = async (medicationsToSync = medications) => {
    if (medicationsToSync.length === 0) {
      showSnackbar('No medications to schedule', 'warning');
      return;
    }

    if (!userProfile || !userProfile.email) {
      showSnackbar('Please add your email in your profile to receive email reminders', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      const response = await apiRequest('/medications/schedule/email', {
        method: 'POST',
        body: JSON.stringify({ medications: medicationsToSync })
      });
      
      setSyncStatus(prev => ({ ...prev, email: true }));
      
      const message = response.message || response.data?.message || 'Email reminders scheduled!';
      showSnackbar(message);
      
    } catch (error) {
      console.error('Email scheduling error:', error);
      
      let errorMessage = 'Email scheduling failed';
      if (error.message.includes('email not configured')) {
        errorMessage = 'Email service not configured (test mode only)';
      } else if (error.message.includes('credentials')) {
        errorMessage = 'Email service configuration issue';
      }
      
      showSnackbar(errorMessage, 'warning');
    } finally {
      setLoading(false);
    }
  };

  const currentDrugType = drugTypes[activeTab] || drugTypes[0];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
        }}
      >
        <Toolbar>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
            <Medication />
          </Avatar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Smart Medical Reminder System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={medications.length} color="error">
              <NotificationAdd />
            </Badge>
            <Typography variant="body2" sx={{ ml: 1 }}>
              {userProfile?.fullName || 'User'}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Sync Status Bar */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <CloudSync sx={{ mr: 1 }} />
              Sync Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip 
                icon={<CalendarToday />} 
                label={`Calendar ${syncStatus.calendar ? '✓' : '✗'}`}
                color={syncStatus.calendar ? 'success' : 'default'}
                size="small"
              />
              <Chip 
                icon={<Sms />} 
                label={`SMS ${syncStatus.sms ? '✓' : '✗'}`}
                color={syncStatus.sms ? 'success' : 'default'}
                size="small"
              />
              <Chip 
                icon={<Email />} 
                label={`Email ${syncStatus.email ? '✓' : '✗'}`}
                color={syncStatus.email ? 'success' : 'default'}
                size="small"
              />
              <Button 
                size="small" 
                variant="outlined"
                onClick={() => handleScheduleEmailReminders()}
                disabled={loading}
              >
                Setup Email
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Drug Type Tabs */}
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                minHeight: 80,
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 'medium'
              }
            }}
          >
            {drugTypes.map((type, index) => (
              <Tab
                key={type.key}
                icon={type.icon}
                label={type.label}
                iconPosition="top"
                sx={{
                  '&.Mui-selected': {
                    color: type.color,
                    bgcolor: `${type.color}10`
                  }
                }}
              />
            ))}
          </Tabs>
        </Paper>

        <Grid container spacing={3}>
          {/* Add Medication Form */}
          <Grid item xs={12} md={7}>
            <Card 
              elevation={4}
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: currentDrugType.color, mr: 2, width: 48, height: 48 }}>
                    {currentDrugType.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      Add {currentDrugType.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure medication details and reminder preferences
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  {/* Basic Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: currentDrugType.color }}>
                      Basic Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Subcategory *</InputLabel>
                      <Select
                        value={currentMedication.drugSubcategory}
                        onChange={(e) => setCurrentMedication(prev => ({ ...prev, drugSubcategory: e.target.value }))}
                        label="Subcategory *"
                        required
                      >
                        {currentDrugType.subcategories.map(sub => (
                          <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Medicine Name *"
                      value={currentMedication.name}
                      onChange={(e) => setCurrentMedication(prev => ({ ...prev, name: e.target.value }))}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Dosage *"
                      value={currentMedication.dosage}
                      onChange={(e) => setCurrentMedication(prev => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 500mg, 2 drops"
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={currentMedication.quantity}
                      onChange={(e) => setCurrentMedication(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      fullWidth
                      inputProps={{ min: 1 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Frequency</InputLabel>
                      <Select
                        value={currentMedication.frequency.type}
                        onChange={(e) => setCurrentMedication(prev => ({ 
                          ...prev, 
                          frequency: { ...prev.frequency, type: e.target.value }
                        }))}
                        label="Frequency"
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="as_needed">As Needed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Reminder Duration (Days)"
                      type="number"
                      value={currentMedication.reminderDays}
                      onChange={(e) => setCurrentMedication(prev => ({ 
                        ...prev, 
                        reminderDays: parseInt(e.target.value) || 30 
                      }))}
                      fullWidth
                      inputProps={{ min: 1, max: 365 }}
                      helperText="Number of days to send reminders"
                    />
                  </Grid>

                  {/* Timing Configuration */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2, color: currentDrugType.color }}>
                      Timing & Schedule
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Time Periods * (Select when to take)
                    </Typography>
                    <ToggleButtonGroup
                      value={currentMedication.timePeriods}
                      onChange={handleTimePeriodChange}
                      aria-label="time periods"
                      sx={{ 
                        flexWrap: 'wrap',
                        '& .MuiToggleButton-root': {
                          m: 0.5,
                          textTransform: 'capitalize',
                          border: '1px solid #ddd',
                          minWidth: 100,
                          '&.Mui-selected': {
                            bgcolor: currentDrugType.color,
                            color: 'white',
                            '&:hover': {
                              bgcolor: currentDrugType.color,
                            }
                          }
                        }
                      }}
                    >
                      {timePeriods.map(period => {
                        const calculatedTime = calculateReminderTime(period.key, currentMedication.mealRelation);
                        return (
                          <ToggleButton key={period.key} value={period.key}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {period.label}
                              </Typography>
                              <Typography variant="caption">
                                {calculatedTime}
                              </Typography>
                            </Box>
                          </ToggleButton>
                        );
                      })}
                    </ToggleButtonGroup>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Meal Relation</InputLabel>
                      <Select
                        value={currentMedication.mealRelation}
                        onChange={(e) => setCurrentMedication(prev => ({ ...prev, mealRelation: e.target.value }))}
                        label="Meal Relation"
                      >
                        {mealRelations.map(relation => (
                          <MenuItem key={relation.key} value={relation.key}>
                            {relation.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Meal Times Configuration */}
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      onClick={() => setShowMealTimes(!showMealTimes)}
                      endIcon={<ExpandMore sx={{ transform: showMealTimes ? 'rotate(180deg)' : 'none' }} />}
                      fullWidth
                      sx={{ height: '56px' }}
                    >
                      Configure Meal Times
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Collapse in={showMealTimes}>
                      <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                          <Restaurant sx={{ mr: 1 }} />
                          Meal Times Configuration
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={3}>
                          <TextField
                              label="Breakfast (Morning)"
                              type="time"
                              value={mealTimes.breakfast}
                              onChange={(e) => handleMealTimeChange('breakfast', e.target.value)}
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              label="Lunch (Afternoon)"
                              type="time"
                              value={mealTimes.lunch}
                              onChange={(e) => handleMealTimeChange('lunch', e.target.value)}
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              label="Dinner (Evening)"
                              type="time"
                              value={mealTimes.dinner}
                              onChange={(e) => handleMealTimeChange('dinner', e.target.value)}
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              label="Night"
                              type="time"
                              value={mealTimes.night}
                              onChange={(e) => handleMealTimeChange('night', e.target.value)}
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              size="small"
                            />
                          </Grid>
                        </Grid>
                        <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
                          These times will be used to calculate reminder schedules based on meal relations
                        </Typography>
                      </Paper>
                    </Collapse>
                  </Grid>

                  {/* Reminder Settings */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2, color: currentDrugType.color }}>
                      Reminder Preferences
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={currentMedication.reminderSettings.calendarEnabled}
                                onChange={(e) => setCurrentMedication(prev => ({
                                  ...prev,
                                  reminderSettings: {
                                    ...prev.reminderSettings,
                                    calendarEnabled: e.target.checked
                                  }
                                }))}
                                color="primary"
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarToday sx={{ mr: 1, fontSize: 18 }} />
                                <Typography variant="body2">Calendar</Typography>
                              </Box>
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={currentMedication.reminderSettings.smsEnabled}
                                onChange={(e) => setCurrentMedication(prev => ({
                                  ...prev,
                                  reminderSettings: {
                                    ...prev.reminderSettings,
                                    smsEnabled: e.target.checked
                                  }
                                }))}
                                color="secondary"
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Sms sx={{ mr: 1, fontSize: 18 }} />
                                <Typography variant="body2">SMS</Typography>
                              </Box>
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={currentMedication.reminderSettings.emailEnabled}
                                onChange={(e) => setCurrentMedication(prev => ({
                                  ...prev,
                                  reminderSettings: {
                                    ...prev.reminderSettings,
                                    emailEnabled: e.target.checked
                                  }
                                }))}
                                color="success"
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Email sx={{ mr: 1, fontSize: 18 }} />
                                <Typography variant="body2">Email</Typography>
                              </Box>
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={currentMedication.reminderSettings.phoneCallEnabled}
                                onChange={(e) => setCurrentMedication(prev => ({
                                  ...prev,
                                  reminderSettings: {
                                    ...prev.reminderSettings,
                                    phoneCallEnabled: e.target.checked
                                  }
                                }))}
                                color="warning"
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Phone sx={{ mr: 1, fontSize: 18 }} />
                                <Typography variant="body2">Phone</Typography>
                              </Box>
                            }
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Additional Notes"
                      value={currentMedication.notes}
                      onChange={(e) => setCurrentMedication(prev => ({ ...prev, notes: e.target.value }))}
                      multiline
                      rows={3}
                      placeholder="Special instructions, side effects to watch for, doctor's notes, etc."
                      fullWidth
                    />
                  </Grid>

                  {/* Reminder Preview */}
                  {currentMedication.timePeriods.length > 0 && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #2196f3' }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                          <Timer sx={{ mr: 1 }} />
                          Reminder Schedule Preview ({currentMedication.reminderDays} days)
                        </Typography>
                        <Grid container spacing={1}>
                          {currentMedication.timePeriods.map(period => {
                            const reminderTime = calculateReminderTime(period, currentMedication.mealRelation);
                            return (
                              <Grid item xs={12} sm={6} key={period}>
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                                  <Schedule sx={{ mr: 1, color: currentDrugType.color }} />
                                  <Typography variant="body2">
                                    <strong>{period.charAt(0).toUpperCase() + period.slice(1)}:</strong> {reminderTime}
                                  </Typography>
                                </Box>
                              </Grid>
                            );
                          })}
                        </Grid>
                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#1976d2' }}>
                          Reminders will be sent for {currentMedication.reminderDays} days
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
              
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="contained"
                  onClick={handleAddMedication}
                  startIcon={<Add />}
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{
                    background: `linear-gradient(45deg, ${currentDrugType.color} 30%, ${currentDrugType.color}AA 90%)`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${currentDrugType.color}DD 30%, ${currentDrugType.color} 90%)`
                    },
                    height: 48
                  }}
                >
                  Add Medication & Schedule Reminders
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Medications List & Doctor Info */}
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>
              {/* Active Medications Card */}
              <Grid item xs={12}>
                <Card elevation={4} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <NotificationAdd />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">Active Medications</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {medications.length} medications with reminders
                          </Typography>
                        </Box>
                      </Box>
                      {medications.length > 0 && (
                        <Chip label={`${medications.length} Active`} color="success" size="small" icon={<CheckCircle />} />
                      )}
                    </Box>

                    {medications.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                          <Medication fontSize="large" />
                        </Avatar>
                        <Typography variant="h6" gutterBottom>No medications added yet</Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                          Add your first medication to get started with smart reminders and automated scheduling.
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 3 }}>
                          {medications.map((med) => {
                            const typeInfo = drugTypes.find(type => type.key === med.drugType);
                            return (
                              <Card key={med._id} sx={{ mb: 2, bgcolor: 'grey.50', border: '1px solid #e0e0e0' }}>
                                <CardContent sx={{ pb: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                      <Avatar sx={{ bgcolor: typeInfo?.color || '#2196F3', mr: 2 }}>
                                        {typeInfo?.icon || <Medication />}
                                      </Avatar>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" gutterBottom sx={{ color: typeInfo?.color || '#2196F3' }}>
                                          {med.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                          <strong>Dosage:</strong> {med.dosage} • <strong>Qty:</strong> {med.quantity}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          <strong>Duration:</strong> {med.reminderDays || 30} days
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                          {(med.timePeriods || []).map(period => (
                                            <Chip key={period} label={period} size="small" 
                                              sx={{ bgcolor: typeInfo?.color + '20', color: typeInfo?.color, fontWeight: 'bold' }} />
                                          ))}
                                        </Box>
                                        <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                          {(med.mealRelation || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Typography>
                                        {med.notes && (
                                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1, bgcolor: '#f9f9f9', p: 1, borderRadius: 1, fontSize: '0.75rem' }}>
                                            {med.notes}
                                          </Typography>
                                        )}
                                      </Box>
                                    </Box>
                                    <IconButton onClick={() => handleDeleteMedication(med._id)} color="error" size="small" disabled={loading}>
                                      <Delete />
                                    </IconButton>
                                  </Box>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </Box>

                        <ButtonGroup variant="contained" fullWidth size="large" sx={{ mb: 2 }}>
                          <Button onClick={() => handleSyncCalendar()} startIcon={<CalendarToday />} disabled={loading} sx={{ bgcolor: '#4CAF50' }}>
                            Sync All
                          </Button>
                          <Button onClick={() => handleScheduleSMS()} startIcon={<Sms />} disabled={loading} sx={{ bgcolor: '#9C27B0' }}>
                            SMS All
                          </Button>
                        </ButtonGroup>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Doctor Info Card */}
              <Grid item xs={12}>
                <Card elevation={4} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#4CAF50', mr: 2 }}>
                          <LocalHospital />
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">Doctor Information</Typography>
                      </Box>
                      <IconButton onClick={() => setShowDoctorForm(!showDoctorForm)} color="primary" size="small">
                        {showDoctorForm ? <ExpandMore sx={{ transform: 'rotate(180deg)' }} /> : <ExpandMore />}
                      </IconButton>
                    </Box>

                    <Collapse in={showDoctorForm}>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12}>
                          <TextField label="Doctor Name" value={doctorInfo.name} onChange={(e) => setDoctorInfo(prev => ({ ...prev, name: e.target.value }))} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField label="Hospital/Clinic" value={doctorInfo.hospital} onChange={(e) => setDoctorInfo(prev => ({ ...prev, hospital: e.target.value }))} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Email" type="email" value={doctorInfo.email} onChange={(e) => setDoctorInfo(prev => ({ ...prev, email: e.target.value }))} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Phone" value={doctorInfo.phone} onChange={(e) => setDoctorInfo(prev => ({ ...prev, phone: e.target.value }))} fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12}>
                          <Button variant="contained" onClick={handleSaveDoctorInfo} fullWidth disabled={loading} startIcon={<Save />}>
                            Save Doctor Info
                          </Button>
                        </Grid>
                      </Grid>
                    </Collapse>

                    {!showDoctorForm && doctorInfo.name && (
                      <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 1, mb: 2 }}>
                        <Typography variant="body2"><strong>Dr. {doctorInfo.name}</strong></Typography>
                        {doctorInfo.hospital && <Typography variant="body2" color="text.secondary">{doctorInfo.hospital}</Typography>}
                        {doctorInfo.email && <Typography variant="body2" color="text.secondary">{doctorInfo.email}</Typography>}
                        {doctorInfo.phone && <Typography variant="body2" color="text.secondary">{doctorInfo.phone}</Typography>}
                      </Box>
                    )}

                    <Button variant="outlined" onClick={() => setShowAskDoctor(true)} fullWidth startIcon={<Email />} 
                      disabled={!doctorInfo.email && !doctorInfo.phone}>
                      Ask Doctor
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="scroll to top"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Notifications />
      </Fab>

      {/* Success Dialog */}
      <Dialog open={reminderDialog} onClose={() => setReminderDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle color="success" sx={{ mr: 2 }} />
            Reminders Successfully Scheduled
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom sx={{ mb: 3 }}>
            Your medication reminders have been successfully configured across all enabled platforms:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: '#e8f5e8', textAlign: 'center' }}>
                <CalendarToday color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Google Calendar</Typography>
                <Typography variant="body2">
                  Events created with 10-30 minute advance notifications
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: '#f3e5f5', textAlign: 'center' }}>
                <Sms color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">SMS Alerts</Typography>
                <Typography variant="body2">
                  Text messages scheduled for medication times
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: '#e3f2fd', textAlign: 'center' }}>
                <Email color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Email Reminders</Typography>
                <Typography variant="body2">
                  Daily summary and individual medication alerts
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Next Steps:</strong> Check your Google Calendar, phone, and email for the scheduled reminders. 
              You can modify or disable individual reminders anytime from this dashboard.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderDialog(false)} variant="contained">
            Got it!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ask Doctor Dialog */}
      <Dialog open={showAskDoctor} onClose={() => setShowAskDoctor(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ask Your Doctor</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Describe your problem or question for Dr. {doctorInfo.name || 'your doctor'}
          </Typography>
          <TextField 
            label="Describe your problem" 
            value={doctorQuery} 
            onChange={(e) => setDoctorQuery(e.target.value)} 
            multiline 
            rows={6} 
            fullWidth 
            placeholder="Please describe your symptoms, concerns, or questions..." 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAskDoctor(false)}>Cancel</Button>
          <Button onClick={handleAskDoctor} variant="contained" disabled={loading || !doctorQuery.trim()} startIcon={<Send />}>
            Send Query
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MedicalReminderSystem;