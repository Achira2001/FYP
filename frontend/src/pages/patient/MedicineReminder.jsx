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
  Avatar,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  Collapse,
  ButtonGroup,
  ThemeProvider,
  createTheme,
  CssBaseline
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
  CheckCircle,
  Save,
  ExpandMore,
  Phone,
  Email,
  Timer,
  Send,
} from '@mui/icons-material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#667eea',
      light: '#8b9aee',
      dark: '#4c63c9',
    },
    secondary: {
      main: '#764ba2',
      light: '#9567ba',
      dark: '#5a3878',
    },
    success: {
      main: '#03dac6',
      light: '#66fff9',
      dark: '#00a896',
    },
    error: {
      main: '#f5576c',
      light: '#ff8a95',
      dark: '#c83349',
    },
    warning: {
      main: '#ffc107',
      light: '#ffecb3',
      dark: '#c79100',
    },
    background: {
      default: '#0f1419',
      paper: '#1a1f2e',
    },
    text: {
      primary: '#e4e6eb',
      secondary: '#b0b3b8',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #1a1f2e 0%, #252b4a 100%)',
          border: '1px solid rgba(102, 126, 234, 0.15)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #1a1f2e 0%, #252b4a 100%)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

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
  const [userProfile, setUserProfile] = useState(null);
  
  const [doctorInfo, setDoctorInfo] = useState({
    name: '',
    hospital: '',
    email: '',
    phone: ''
  });
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [showAskDoctor, setShowAskDoctor] = useState(false);
  const [doctorQuery, setDoctorQuery] = useState('');

  const drugTypes = [
    {
      key: 'oral',
      label: 'Oral Medicines',
      icon: <Medication />,
      color: '#667eea',
      subcategories: ['Tablets', 'Capsules', 'Syrups', 'Powders', 'Suspensions']
    },
    {
      key: 'inhalers',
      label: 'Inhalers',
      icon: <Air />,
      color: '#03dac6',
      subcategories: ['MDI (Metered Dose)', 'DPI (Dry Powder)', 'Nebulizer', 'Soft Mist']
    },
    {
      key: 'patches',
      label: 'Patches',
      icon: <LocalHospital />,
      color: '#ffc107',
      subcategories: ['Transdermal', 'Nicotine Patches', 'Pain Relief', 'Hormone Patches']
    },
    {
      key: 'drops',
      label: 'Eye/Ear Drops',
      icon: <Visibility />,
      color: '#764ba2',
      subcategories: ['Eye Drops', 'Ear Drops', 'Nasal Drops', 'Nasal Spray']
    },
    {
      key: 'insulin',
      label: 'Insulin',
      icon: <Opacity />,
      color: '#f5576c',
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
    drugSubcategory: drugTypes[0].subcategories[0],
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

  const getAuthToken = () => localStorage.getItem('token');

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
      await apiRequest('/doctor-query', {
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
        mealTimes: { ...userProfile.mealTimes, [meal]: time }
      };
      apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(updatedProfile)
      }).catch(error => console.error('Failed to update meal times:', error));
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

  const currentDrugType = drugTypes[activeTab] || drugTypes[0];

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2 }}>
        <Container maxWidth="xl" sx={{ py: 1 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Drug Type Selection */}
          <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 80,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.05)',
                  }
                },
                '& .Mui-selected': {
                  color: currentDrugType.color + ' !important',
                }
              }}
            >
              {drugTypes.map((type) => (
                <Tab
                  key={type.key}
                  icon={<Box sx={{ fontSize: 28, mb: 0.5 }}>{type.icon}</Box>}
                  label={type.label}
                />
              ))}
            </Tabs>
          </Paper>

          <Grid container spacing={2.5}>
            {/* Left Column - Add Medication */}
            <Grid item xs={12} lg={8}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: currentDrugType.color, width: 48, height: 48, mr: 2 }}>
                      {currentDrugType.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ color: currentDrugType.color, fontWeight: 700 }}>
                        Add {currentDrugType.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Configure medication details and reminder preferences
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 1.5, color: 'primary.main', fontSize: '1.1rem' }}>
                        Basic Information
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Subcategory *</InputLabel>
                        <Select
                          value={currentMedication.drugSubcategory}
                          onChange={(e) => setCurrentMedication(prev => ({ ...prev, drugSubcategory: e.target.value }))}
                          label="Subcategory *"
                        >
                          {currentDrugType.subcategories.map(sub => (
                            <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Medicine Name *"
                        value={currentMedication.name}
                        onChange={(e) => setCurrentMedication(prev => ({ ...prev, name: e.target.value }))}
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Dosage *"
                        value={currentMedication.dosage}
                        onChange={(e) => setCurrentMedication(prev => ({ ...prev, dosage: e.target.value }))}
                        placeholder="e.g., 500mg"
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Quantity"
                        type="number"
                        value={currentMedication.quantity}
                        onChange={(e) => setCurrentMedication(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Duration (Days)"
                        type="number"
                        value={currentMedication.reminderDays}
                        onChange={(e) => setCurrentMedication(prev => ({ ...prev, reminderDays: parseInt(e.target.value) || 7 }))}
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 1.5, borderColor: 'rgba(102, 126, 234, 0.1)' }} />
                      <Typography variant="h6" sx={{ mb: 1.5, color: 'primary.main', fontSize: '1.1rem' }}>
                        Schedule & Timing
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1.5 }}>
                        Time Periods *
                      </Typography>
                      <ToggleButtonGroup
                        value={currentMedication.timePeriods}
                        onChange={handleTimePeriodChange}
                        sx={{ 
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1.5,
                          '& .MuiToggleButton-root': {
                            flex: '1 1 calc(25% - 12px)',
                            minWidth: 120,
                            border: '2px solid rgba(102, 126, 234, 0.2)',
                            borderRadius: 2,
                            p: 1.5,
                            '&.Mui-selected': {
                              bgcolor: currentDrugType.color + '20',
                              borderColor: currentDrugType.color,
                              color: currentDrugType.color,
                            }
                          }
                        }}
                      >
                        {timePeriods.map(period => (
                          <ToggleButton key={period.key} value={period.key}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.3 }}>
                                {period.label}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                {calculateReminderTime(period.key, currentMedication.mealRelation)}
                              </Typography>
                            </Box>
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
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

                    <Grid item xs={12} md={6}>
                      <Button
                        variant="outlined"
                        onClick={() => setShowMealTimes(!showMealTimes)}
                        endIcon={<ExpandMore sx={{ transform: showMealTimes ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />}
                        fullWidth
                        size="small"
                        sx={{ height: '40px' }}
                      >
                        Meal Times Settings
                      </Button>
                    </Grid>

                    <Grid item xs={12}>
                      <Collapse in={showMealTimes}>
                        <Paper sx={{ p: 2.5, bgcolor: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                          <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                            <Restaurant sx={{ mr: 1, fontSize: 20 }} />
                            Configure Your Meal Times
                          </Typography>
                          <Grid container spacing={1.5}>
                            {Object.entries({ breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', night: 'Night' }).map(([key, label]) => (
                              <Grid item xs={12} sm={6} md={3} key={key}>
                                <TextField
                                  label={label}
                                  type="time"
                                  value={mealTimes[key]}
                                  onChange={(e) => handleMealTimeChange(key, e.target.value)}
                                  fullWidth
                                  size="small"
                                  InputLabelProps={{ shrink: true }}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Collapse>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 1.5, borderColor: 'rgba(102, 126, 234, 0.1)' }} />
                      <Typography variant="h6" sx={{ mb: 1.5, color: 'primary.main', fontSize: '1.1rem' }}>
                        Reminder Methods
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Paper sx={{ p: 2.5, bgcolor: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                        <Grid container spacing={2}>
                          {[
                            { key: 'calendarEnabled', icon: <CalendarToday />, label: 'Calendar' },
                            { key: 'smsEnabled', icon: <Sms />, label: 'SMS' },
                            { key: 'emailEnabled', icon: <Email />, label: 'Email' },
                            { key: 'phoneCallEnabled', icon: <Phone />, label: 'Phone' }
                          ].map(method => (
                            <Grid item xs={6} sm={3} key={method.key}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={currentMedication.reminderSettings[method.key]}
                                    onChange={(e) => setCurrentMedication(prev => ({
                                      ...prev,
                                      reminderSettings: {
                                        ...prev.reminderSettings,
                                        [method.key]: e.target.checked
                                      }
                                    }))}
                                    color="primary"
                                    size="small"
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    {React.cloneElement(method.icon, { sx: { fontSize: 18 } })}
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{method.label}</Typography>
                                  </Box>
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Additional Notes"
                        value={currentMedication.notes}
                        onChange={(e) => setCurrentMedication(prev => ({ ...prev, notes: e.target.value }))}
                        multiline
                        rows={2}
                        placeholder="Special instructions, side effects, doctor's notes..."
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    {currentMedication.timePeriods.length > 0 && (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2.5, bgcolor: 'rgba(3, 218, 198, 0.1)', border: '1px solid rgba(3, 218, 198, 0.3)', borderRadius: 2 }}>
                          <Typography variant="subtitle1" sx={{ mb: 1.5, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                            <Timer />
                            Reminder Schedule Preview
                          </Typography>
                          <Grid container spacing={1.5}>
                            {currentMedication.timePeriods.map(period => (
                              <Grid item xs={12} sm={6} md={3} key={period}>
                                <Box sx={{ 
                                  p: 1.5, 
                                  bgcolor: 'background.paper', 
                                  borderRadius: 2,
                                  border: '1px solid rgba(3, 218, 198, 0.2)',
                                  textAlign: 'center'
                                }}>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                    {period}
                                  </Typography>
                                  <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700, my: 0.5 }}>
                                    {calculateReminderTime(period, currentMedication.mealRelation)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                    {currentMedication.reminderDays} days
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
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
                      background: `linear-gradient(135deg, ${currentDrugType.color} 0%, ${currentDrugType.color}AA 100%)`,
                      height: 48,
                      fontSize: '1rem',
                      fontWeight: 700,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${currentDrugType.color}DD 0%, ${currentDrugType.color} 100%)`,
                      }
                    }}
                  >
                    Add Medication & Schedule Reminders
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Right Column - Medications List & Doctor */}
            <Grid item xs={12} lg={4}>
              <Grid container spacing={2.5}>
                {/* Active Medications */}
                <Grid item xs={12}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(102, 126, 234, 0.2)', height: '100%' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.3, fontSize: '1.1rem' }}>
                            Active Medications
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            {medications.length} active reminder{medications.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'success.main', width: 44, height: 44 }}>
                          <Typography variant="h6" fontWeight="bold">{medications.length}</Typography>
                        </Avatar>
                      </Box>

                      {medications.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Box sx={{ 
                            width: 70, 
                            height: 70, 
                            borderRadius: '50%', 
                            bgcolor: 'rgba(102, 126, 234, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 1.5
                          }}>
                            <Medication sx={{ fontSize: 36, color: 'primary.main' }} />
                          </Box>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>No medications yet</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            Add your first medication to start tracking
                          </Typography>
                        </Box>
                      ) : (
                        <>
                          <Box sx={{ maxHeight: 350, overflow: 'auto', mb: 2 }}>
                            {medications.map((med) => {
                              const typeInfo = drugTypes.find(type => type.key === med.drugType);
                              return (
                                <Paper 
                                  key={med._id} 
                                  sx={{ 
                                    mb: 1.5, 
                                    p: 1.5, 
                                    bgcolor: 'rgba(102, 126, 234, 0.05)',
                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                    borderRadius: 2,
                                    '&:hover': {
                                      bgcolor: 'rgba(102, 126, 234, 0.08)',
                                      borderColor: 'rgba(102, 126, 234, 0.4)',
                                    }
                                  }}
                                >
                                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Avatar sx={{ bgcolor: typeInfo?.color || 'primary.main', width: 36, height: 36 }}>
                                      {React.cloneElement(typeInfo?.icon || <Medication />, { sx: { fontSize: 20 } })}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: typeInfo?.color, fontSize: '0.9rem' }}>
                                        {med.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        {med.dosage} • {med.quantity}x • {med.reminderDays || 30} days
                                      </Typography>
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.8 }}>
                                        {(med.timePeriods || []).map(period => (
                                          <Chip 
                                            key={period} 
                                            label={period} 
                                            size="small"
                                            sx={{ 
                                              bgcolor: typeInfo?.color + '30',
                                              color: typeInfo?.color,
                                              fontWeight: 600,
                                              fontSize: '0.65rem',
                                              height: 20
                                            }} 
                                          />
                                        ))}
                                      </Box>
                                    </Box>
                                    <IconButton 
                                      onClick={() => handleDeleteMedication(med._id)} 
                                      size="small"
                                      sx={{ 
                                        color: 'error.main',
                                        width: 32,
                                        height: 32,
                                        '&:hover': { bgcolor: 'rgba(245, 87, 108, 0.1)' }
                                      }}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Paper>
                              );
                            })}
                          </Box>

                          <ButtonGroup variant="contained" fullWidth size="small">
                            <Button startIcon={<CalendarToday fontSize="small" />} sx={{ bgcolor: 'success.main', fontSize: '0.8rem' }}>
                              Sync
                            </Button>
                            <Button startIcon={<Sms fontSize="small" />} sx={{ bgcolor: 'secondary.main', fontSize: '0.8rem' }}>
                              SMS
                            </Button>
                            <Button startIcon={<Email fontSize="small" />} sx={{ bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                              Email
                            </Button>
                          </ButtonGroup>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Doctor Info */}
                <Grid item xs={12}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: 'success.main', width: 36, height: 36 }}>
                            <LocalHospital sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>Doctor Info</Typography>
                        </Box>
                        <IconButton 
                          onClick={() => setShowDoctorForm(!showDoctorForm)}
                          size="small"
                          sx={{ 
                            transform: showDoctorForm ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.3s'
                          }}
                        >
                          <ExpandMore />
                        </IconButton>
                      </Box>

                      <Collapse in={showDoctorForm}>
                        <Grid container spacing={1.5} sx={{ mb: 2 }}>
                          <Grid item xs={12}>
                            <TextField 
                              label="Doctor Name" 
                              value={doctorInfo.name} 
                              onChange={(e) => setDoctorInfo(prev => ({ ...prev, name: e.target.value }))} 
                              fullWidth 
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField 
                              label="Hospital/Clinic" 
                              value={doctorInfo.hospital} 
                              onChange={(e) => setDoctorInfo(prev => ({ ...prev, hospital: e.target.value }))} 
                              fullWidth 
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField 
                              label="Email" 
                              type="email" 
                              value={doctorInfo.email} 
                              onChange={(e) => setDoctorInfo(prev => ({ ...prev, email: e.target.value }))} 
                              fullWidth 
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField 
                              label="Phone" 
                              value={doctorInfo.phone} 
                              onChange={(e) => setDoctorInfo(prev => ({ ...prev, phone: e.target.value }))} 
                              fullWidth 
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Button 
                              variant="contained" 
                              onClick={handleSaveDoctorInfo} 
                              fullWidth 
                              startIcon={<Save />}
                              size="small"
                              sx={{ bgcolor: 'success.main' }}
                            >
                              Save Doctor Info
                            </Button>
                          </Grid>
                        </Grid>
                      </Collapse>

                      {!showDoctorForm && doctorInfo.name && (
                        <Paper sx={{ p: 2, bgcolor: 'rgba(3, 218, 198, 0.1)', border: '1px solid rgba(3, 218, 198, 0.2)', mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                            Dr. {doctorInfo.name}
                          </Typography>
                          {doctorInfo.hospital && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                              <LocalHospital sx={{ fontSize: 16 }} /> {doctorInfo.hospital}
                            </Typography>
                          )}
                          {doctorInfo.email && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                              <Email sx={{ fontSize: 16 }} /> {doctorInfo.email}
                            </Typography>
                          )}
                          {doctorInfo.phone && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <Phone sx={{ fontSize: 16 }} /> {doctorInfo.phone}
                            </Typography>
                          )}
                        </Paper>
                      )}

                      <Button 
                        variant="outlined" 
                        onClick={() => setShowAskDoctor(true)} 
                        fullWidth 
                        startIcon={<Send />}
                        size="small"
                        disabled={!doctorInfo.email && !doctorInfo.phone}
                      >
                        Contact Doctor
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>

        {/* Success Dialog */}
        <Dialog 
          open={reminderDialog} 
          onClose={() => setReminderDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <CheckCircle />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">Reminders Scheduled!</Typography>
                <Typography variant="body2" color="text.secondary">
                  Your medication reminders are now active
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {[
                { icon: <CalendarToday />, title: 'Google Calendar', desc: 'Events with advance notifications', color: 'success.main' },
                { icon: <Sms />, title: 'SMS Alerts', desc: 'Text messages at medication times', color: 'secondary.main' },
                { icon: <Email />, title: 'Email Reminders', desc: 'Daily summary and alerts', color: 'primary.main' }
              ].map((item, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <Paper sx={{ 
                    p: 2.5, 
                    textAlign: 'center',
                    bgcolor: 'rgba(102, 126, 234, 0.05)',
                    border: '1px solid rgba(102, 126, 234, 0.2)'
                  }}>
                    <Avatar sx={{ bgcolor: item.color, width: 48, height: 48, mx: 'auto', mb: 1.5 }}>
                      {item.icon}
                    </Avatar>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>{item.desc}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setReminderDialog(false)} variant="contained" fullWidth>
              Got it!
            </Button>
          </DialogActions>
        </Dialog>

        {/* Ask Doctor Dialog */}
        <Dialog 
          open={showAskDoctor} 
          onClose={() => setShowAskDoctor(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">Contact Your Doctor</Typography>
            <Typography variant="body2" color="text.secondary">
              Dr. {doctorInfo.name || 'your doctor'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <TextField 
              label="Describe your concern" 
              value={doctorQuery} 
              onChange={(e) => setDoctorQuery(e.target.value)} 
              multiline 
              rows={5} 
              fullWidth 
              placeholder="Please describe your symptoms, concerns, or questions..."
              sx={{ mt: 1.5 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setShowAskDoctor(false)} variant="outlined">
              Cancel
            </Button>
            <Button 
              onClick={handleAskDoctor} 
              variant="contained" 
              disabled={loading || !doctorQuery.trim()} 
              startIcon={<Send />}
            >
              Send Message
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ 
              width: '100%',
              borderRadius: 2,
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default MedicalReminderSystem;