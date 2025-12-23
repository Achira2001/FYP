import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Card,
  CardContent,
  Divider,
  Stack,
  Fade,
  Zoom,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Home as HomeIcon,
  EmergencyRecording as EmergencyIcon,
  Height as HeightIcon,
  MonitorWeight as WeightIcon,
  Bloodtype as BloodTypeIcon,
  LocalHospital as HospitalIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
  FitnessCenter as FitnessIcon,
  Restaurant as RestaurantIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

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
    h3: {
      fontWeight: 700,
    },
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

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }

        const response = await fetch('http://localhost:5000/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        const contentType = response.headers.get('content-type');
        const responseText = await response.text();
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        if (contentType && contentType.includes('application/json')) {
          const data = JSON.parse(responseText);
          setUser(data.user);
          setEditData(data.user);
        } else {
          throw new Error('Server configuration error. Please check API endpoints.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      setEditData(user);
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      setUser(data.user);
      setEditMode(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/update-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to change password');
      }
      
      setChangePasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderRoleIcon = () => {
    switch (user?.role) {
      case 'doctor':
        return <MedicalServicesIcon sx={{ fontSize: 60 }} />;
      case 'admin':
        return <AdminIcon sx={{ fontSize: 60 }} />;
      default:
        return <PersonIcon sx={{ fontSize: 60 }} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'doctor': return 'primary';
      default: return 'secondary';
    }
  };

  const renderBasicInfo = () => (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
          Personal Information
        </Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={editData.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              disabled={!editMode}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={editData.email || ''}
              disabled
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={editData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!editMode}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              }}
            />
          </Grid>
          {user?.role === 'patient' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={editData.dateOfBirth ? format(new Date(editData.dateOfBirth), 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={!editMode}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CakeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  value={editData.emergencyContact || ''}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  disabled={!editMode}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: <EmergencyIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={3}
                  value={editData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!editMode}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: <HomeIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1, fontSize: 20 }} />
                  }}
                />
              </Grid>
            </>
          )}
          {user?.role === 'doctor' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Medical License"
                  value={editData.medicalLicense || ''}
                  onChange={(e) => handleInputChange('medicalLicense', e.target.value)}
                  disabled={!editMode}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Specialization"
                  value={editData.specialization || ''}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  disabled={!editMode}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Workplace"
                  value={editData.workplace || ''}
                  onChange={(e) => handleInputChange('workplace', e.target.value)}
                  disabled={!editMode}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: <HospitalIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderHealthInfo = () => (
    <Stack spacing={2.5}>
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
            <FitnessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Health Metrics
          </Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Blood Type"
                select
                value={editData.bloodType || ''}
                onChange={(e) => handleInputChange('bloodType', e.target.value)}
                disabled={!editMode}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: <BloodTypeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                }}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Height (cm)"
                type="number"
                value={editData.height || ''}
                onChange={(e) => handleInputChange('height', e.target.value)}
                disabled={!editMode}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: <HeightIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={editData.weight || ''}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                disabled={!editMode}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: <WeightIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                }}
              />
            </Grid>
            {user?.height && user?.weight && (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" mt={1}>
                  <Chip 
                    label={`BMI: ${(user.weight / ((user.height / 100) ** 2)).toFixed(1)}`} 
                    sx={{ 
                      bgcolor: 'rgba(3, 218, 198, 0.2)', 
                      color: 'success.main', 
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      px: 2,
                      py: 1,
                      border: '1px solid rgba(3, 218, 198, 0.3)'
                    }}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
            <RestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Meal Times
          </Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
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
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
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
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
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
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );

  const renderMedicalHistory = () => (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Medical History
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            disabled={!editMode}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Add Condition
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Condition</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Diagnosed Date</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Notes</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user?.medicalHistory?.map((condition, index) => (
                <TableRow key={index} hover sx={{ '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.05)' } }}>
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
                      sx={{ fontWeight: 500, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" disabled={!editMode} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {(!user?.medicalHistory || user.medicalHistory.length === 0) && (
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
  );

  const renderMedications = () => (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Current Medications
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            disabled={!editMode}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Add Medication
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(118, 75, 162, 0.1)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Medication</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Dosage</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Frequency</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Before Food</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user?.medications?.map((medication, index) => (
                <TableRow key={index} hover sx={{ '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.05)' } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{medication.name}</TableCell>
                  <TableCell>{medication.dosage}</TableCell>
                  <TableCell>{medication.frequency}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={medication.beforeFood || false} 
                      disabled 
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={medication.isActive ? 'Active' : 'Inactive'} 
                      color={medication.isActive ? 'success' : 'default'} 
                      size="small"
                      sx={{ fontWeight: 500, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" disabled={!editMode} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {(!user?.medications || user.medications.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No medications recorded
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderDoctorInfo = () => (
    <Stack spacing={2.5}>
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
            <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Professional Details
          </Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Consultation Fee"
                type="number"
                value={editData.consultationFee || ''}
                onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                disabled={!editMode}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
            <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Availability Schedule
          </Typography>
          <Grid container spacing={2.5}>
            {user?.availability?.map((slot, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Day"
                    select
                    value={slot.day || ''}
                    onChange={(e) => {
                      const newAvailability = [...editData.availability];
                      newAvailability[index].day = e.target.value;
                      handleInputChange('availability', newAvailability);
                    }}
                    disabled={!editMode}
                    variant="outlined"
                    size="small"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <MenuItem key={day} value={day}>{day}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    type="time"
                    value={slot.startTime || ''}
                    onChange={(e) => {
                      const newAvailability = [...editData.availability];
                      newAvailability[index].startTime = e.target.value;
                      handleInputChange('availability', newAvailability);
                    }}
                    disabled={!editMode}
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="End Time"
                    type="time"
                    value={slot.endTime || ''}
                    onChange={(e) => {
                      const newAvailability = [...editData.availability];
                      newAvailability[index].endTime = e.target.value;
                      handleInputChange('availability', newAvailability);
                    }}
                    disabled={!editMode}
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton 
                    disabled={!editMode}
                    onClick={() => {
                      const newAvailability = [...editData.availability];
                      newAvailability.splice(index, 1);
                      handleInputChange('availability', newAvailability);
                    }}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12}>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={() => {
                  handleInputChange('availability', [
                    ...editData.availability,
                    { day: 'Monday', startTime: '09:00', endTime: '17:00' }
                  ]);
                }}
                disabled={!editMode}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Add Time Slot
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );

  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box 
          sx={{ 
            minHeight: '100vh',
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Card sx={{ p: 4, borderRadius: 3, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                Loading your profile...
              </Typography>
            </Box>
          </Card>
        </Box>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
          <Alert 
            severity="error" 
            sx={{ borderRadius: 2 }}
          >
            Failed to load user profile
          </Alert>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4
      }}>
        <Container maxWidth="lg">
          <Fade in timeout={800}>
            <Box>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3, borderRadius: 2, border: '1px solid rgba(245, 87, 108, 0.3)' }} 
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}
              {success && (
                <Alert 
                  severity="success" 
                  sx={{ mb: 3, borderRadius: 2, border: '1px solid rgba(3, 218, 198, 0.3)' }} 
                  onClose={() => setSuccess('')}
                >
                  {success}
                </Alert>
              )}
              
              {/* Profile Header */}
              <Zoom in timeout={600}>
                <Card elevation={0} sx={{ 
                  borderRadius: 3, 
                  mb: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  overflow: 'visible'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                      <Box display="flex" alignItems="center" flexWrap="wrap" gap={3}>
                        <Box position="relative">
                          <Avatar sx={{ 
                            width: 120, 
                            height: 120,
                            border: '4px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                          }}>
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              renderRoleIcon()
                            )}
                          </Avatar>
                          {user.isEmailVerified && (
                            <Avatar sx={{ 
                              position: 'absolute', 
                              bottom: 0, 
                              right: 0, 
                              width: 32, 
                              height: 32,
                              backgroundColor: 'success.main',
                              border: '2px solid #1a1f2e'
                            }}>
                              <VerifiedIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                          )}
                        </Box>
                        <Box>
                          <Typography variant="h3" component="h1" sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            color: 'white',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                          }}>
                            {user.fullName}
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                            <Chip 
                              label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)'
                              }}
                            />
                            {user.isEmailVerified && (
                              <Chip 
                                label="Verified Account" 
                                icon={<VerifiedIcon />}
                                sx={{ 
                                  backgroundColor: 'rgba(3, 218, 198, 0.2)',
                                  color: 'success.main',
                                  fontWeight: 600,
                                  fontSize: '0.9rem',
                                  border: '1px solid rgba(3, 218, 198, 0.3)'
                                }}
                              />
                            )}
                          </Stack>
                          <Typography variant="body1" sx={{ 
                            color: 'rgba(255,255,255,0.9)',
                            maxWidth: 400
                          }}>
                            {user.role === 'doctor' ? 
                              `${user.specialization || 'Medical Professional'} at ${user.workplace || 'Healthcare Facility'}` :
                              user.role === 'admin' ? 'System Administrator' :
                              'Patient Profile'
                            }
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Button
                          variant={editMode ? "contained" : "outlined"}
                          startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                          onClick={handleEditToggle}
                          size="small"
                          sx={{ 
                            borderRadius: 2,
                            fontWeight: 600,
                            px: 2,
                            backgroundColor: editMode ? 'rgba(255,255,255,0.15)' : 'transparent',
                            borderColor: 'rgba(255,255,255,0.3)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              borderColor: 'rgba(255,255,255,0.5)'
                            }
                          }}
                        >
                          {editMode ? 'Cancel' : 'Edit Profile'}
                        </Button>
                        {editMode && (
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            size="small"
                            sx={{ 
                              borderRadius: 2,
                              fontWeight: 600,
                              px: 2,
                              backgroundColor: 'success.main',
                              '&:hover': {
                                backgroundColor: 'success.dark'
                              }
                            }}
                          >
                            Save Changes
                          </Button>
                        )}
                        <Button 
                          variant="outlined"
                          onClick={() => setChangePasswordDialog(true)}
                          size="small"
                          sx={{ 
                            borderRadius: 2,
                            fontWeight: 600,
                            px: 2,
                            backgroundColor: 'transparent',
                            borderColor: 'rgba(255,255,255,0.3)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              borderColor: 'rgba(255,255,255,0.5)'
                            }
                          }}
                        >
                          Change Password
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>

              {/* Content Tabs */}
              <Card elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange} 
                  sx={{ 
                    borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
                    '& .MuiTab-root': {
                      color: 'text.secondary',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      py: 2,
                      '&.Mui-selected': {
                        color: 'primary.main'
                      },
                      '&:hover': {
                        color: 'primary.light',
                        bgcolor: 'rgba(102, 126, 234, 0.05)'
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'primary.main',
                      height: 3
                    }
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Basic Information" />
                  {user.role === 'patient' && <Tab label="Health Information" />}
                  {user.role === 'patient' && <Tab label="Medical History" />}
                  {user.role === 'patient' && <Tab label="Medications" />}
                  {user.role === 'doctor' && <Tab label="Professional Information" />}
                </Tabs>

                <Box sx={{ p: 3, minHeight: 400 }}>
                  <Fade in key={activeTab} timeout={500}>
                    <Box>
                      {activeTab === 0 && renderBasicInfo()}
                      {activeTab === 1 && user.role === 'patient' && renderHealthInfo()}
                      {activeTab === 2 && user.role === 'patient' && renderMedicalHistory()}
                      {activeTab === 3 && user.role === 'patient' && renderMedications()}
                      {activeTab === 1 && user.role === 'doctor' && renderDoctorInfo()}
                    </Box>
                  </Fade>
                </Box>
              </Card>
            </Box>
          </Fade>

          {/* Enhanced Change Password Dialog */}
          <Dialog 
            open={changePasswordDialog} 
            onClose={() => setChangePasswordDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: { 
                borderRadius: 3, 
                border: '1px solid rgba(102, 126, 234, 0.2)',
                p: 1 
              }
            }}
          >
            <DialogTitle sx={{ 
              textAlign: 'center', 
              fontWeight: 600, 
              fontSize: '1.5rem',
              color: 'primary.main',
              pb: 1
            }}>
              Change Password
            </DialogTitle>
            <Divider sx={{ mx: 3, mb: 2, borderColor: 'rgba(102, 126, 234, 0.2)' }} />
            <DialogContent sx={{ px: 4 }}>
              <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 4, pb: 3, gap: 1 }}>
              <Button 
                onClick={() => setChangePasswordDialog(false)}
                variant="outlined"
                size="small"
                sx={{ 
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 3
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePasswordChange} 
                variant="contained"
                size="small"
                sx={{ 
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 3
                }}
              >
                Change Password
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </ThemeProvider>
    );
};

export default UserProfile;