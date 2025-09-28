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
  Zoom
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

  // Fetch user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        console.log('Token from storage:', token);
        
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
        
        console.log('Response status:', response.status);
        
        // FIRST, check what content type is being returned
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        // Get the response as text first to see what it is
        const responseText = await response.text();
        console.log('Raw response:', responseText.substring(0, 200)); // First 200 chars
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        // If it's JSON, then parse it
        if (contentType && contentType.includes('application/json')) {
          const data = JSON.parse(responseText);
          console.log('User data received:', data);
          setUser(data.user);
          setEditData(data.user);
        } else {
          // If it's HTML, we have a routing issue
          console.error('Received HTML instead of JSON. Routing issue detected.');
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
      // If canceling edit, reset the form
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
    <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
          Personal Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={editData.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              disabled={!editMode}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={editData.email || ''}
              disabled
              variant="outlined"
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  borderRadius: 2
                }
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
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2
                }
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
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CakeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 2
                    }
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
                  InputProps={{
                    startAdornment: <EmergencyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 2
                    }
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
                  InputProps={{
                    startAdornment: <HomeIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 2
                    }
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 2
                    }
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 2
                    }
                  }}
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
                  InputProps={{
                    startAdornment: <HospitalIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 2
                    }
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
    <Stack spacing={3}>
      <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'white', mb: 3 }}>
            <FitnessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Health Metrics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2
                  }
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
                InputProps={{
                  startAdornment: <HeightIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2
                  }
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
                InputProps={{
                  startAdornment: <WeightIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            {user?.height && user?.weight && (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" mt={2}>
                  <Chip 
                    label={`BMI: ${(user.weight / ((user.height / 100) ** 2)).toFixed(1)}`} 
                    sx={{ 
                      background: 'rgba(255,255,255,0.9)', 
                      color: 'primary.main', 
                      fontWeight: 600,
                      fontSize: '1rem',
                      px: 2,
                      py: 1
                    }}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
            <RestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Meal Times
          </Typography>
          <Grid container spacing={3}>
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
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2
                  }
                }}
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
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2
                  }
                }}
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
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );

  const renderMedicalHistory = () => (
    <Card elevation={0} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Medical History
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            disabled={!editMode}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Add Condition
          </Button>
        </Box>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Condition</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Diagnosed Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Notes</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user?.medicalHistory?.map((condition, index) => (
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
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" disabled={!editMode} color="primary">
                      <EditIcon />
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
    <Card elevation={0} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Current Medications
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            disabled={!editMode}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Add Medication
          </Button>
        </Box>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'secondary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Medication</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Dosage</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Frequency</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Before Food</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user?.medications?.map((medication, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{medication.name}</TableCell>
                  <TableCell>{medication.dosage}</TableCell>
                  <TableCell>{medication.frequency}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={medication.beforeFood || false} 
                      disabled 
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={medication.isActive ? 'Active' : 'Inactive'} 
                      color={medication.isActive ? 'success' : 'default'} 
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" disabled={!editMode} color="primary">
                      <EditIcon />
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
    <Stack spacing={3}>
      <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'white', mb: 3 }}>
            <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Professional Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Consultation Fee"
                type="number"
                value={editData.consultationFee || ''}
                onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                disabled={!editMode}
                variant="outlined"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
            <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Availability Schedule
          </Typography>
          <Grid container spacing={3}>
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: editMode ? 'white' : 'grey.50',
                        borderRadius: 2
                      }
                    }}
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
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: editMode ? 'white' : 'grey.50',
                        borderRadius: 2
                      }
                    }}
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
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: editMode ? 'white' : 'grey.50',
                        borderRadius: 2
                      }
                    }}
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
                sx={{ borderRadius: 2, textTransform: 'none' }}
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
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Card sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              Loading your profile...
            </Typography>
          </Box>
        </Card>
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ borderRadius: 2, boxShadow: 2 }}
        >
          Failed to load user profile
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box>
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }} 
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert 
                severity="success" 
                sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }} 
                onClose={() => setSuccess('')}
              >
                {success}
              </Alert>
            )}
            
            {/* Profile Header */}
            <Zoom in timeout={600}>
              <Card elevation={4} sx={{ 
                borderRadius: 4, 
                mb: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
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
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
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
                            border: '2px solid white'
                          }}>
                            <VerifiedIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="h3" component="h1" sx={{ 
                          fontWeight: 700, 
                          mb: 1,
                          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          {user.fullName}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                          <Chip 
                            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                            color={getRoleColor(user.role)}
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              backgroundColor: 'rgba(255,255,255,0.15)',
                              color: 'white',
                              border: '1px solid rgba(255,255,255,0.3)'
                            }}
                          />
                          {user.isEmailVerified && (
                            <Chip 
                              label="Verified Account" 
                              icon={<VerifiedIcon />}
                              sx={{ 
                                backgroundColor: 'success.main',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                              }}
                            />
                          )}
                        </Stack>
                        <Typography variant="body1" sx={{ 
                          opacity: 0.9,
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
                        color={editMode ? "secondary" : "inherit"}
                        startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                        onClick={handleEditToggle}
                        sx={{ 
                          borderRadius: 3,
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 3,
                          backgroundColor: editMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
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
                          sx={{ 
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
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
                        sx={{ 
                          borderRadius: 3,
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 3,
                          backgroundColor: 'rgba(255,255,255,0.1)',
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
            <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                sx={{ 
                  backgroundColor: 'primary.main',
                  '& .MuiTab-root': {
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&.Mui-selected': {
                      color: 'white'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'white',
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

              <Box sx={{ p: 4, minHeight: 400 }}>
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
            sx: { borderRadius: 3, p: 1 }
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
          <Divider sx={{ mx: 3, mb: 2 }} />
          <DialogContent sx={{ px: 4 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 3, gap: 1 }}>
            <Button 
              onClick={() => setChangePasswordDialog(false)}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordChange} 
              variant="contained"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
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
  );
};

export default UserProfile;