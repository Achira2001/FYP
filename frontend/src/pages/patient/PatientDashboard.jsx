import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  useMediaQuery,
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
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import axios from 'axios';


// THEME CONFIGURATION

const unifiedTheme = createTheme({
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
            '&.Mui-disabled': {
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#CBD5E1',
            '&.Mui-disabled': {
              color: '#94A3B8',
            },
          },
          '& .MuiOutlinedInput-input': {
            color: '#F1F5F9',
            '-webkit-text-fill-color': '#F1F5F9 !important',
            '&.Mui-disabled': {
              color: '#F1F5F9',
              '-webkit-text-fill-color': '#F1F5F9 !important',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(99, 102, 241, 0.3)',
          },
          '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(99, 102, 241, 0.15)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          color: '#F1F5F9',
          '&.Mui-disabled': {
            color: '#F1F5F9',
            '-webkit-text-fill-color': '#F1F5F9 !important',
          },
        },
        icon: {
          color: '#CBD5E1',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&.Mui-disabled': {
            '-webkit-text-fill-color': '#F1F5F9 !important',
            color: '#F1F5F9 !important',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(99, 102, 241, 0.1)',
          padding: '10px 14px',
        },
      },
    },
  },
});


// API CONFIGURATION

const API_BASE_URL = 'http://localhost:5000/api';


// MOBILE MEDICATION CARD

const MedicationCard = ({ medication }) => (
  <Card
    sx={{
      mb: 2,
      background: 'rgba(168, 85, 247, 0.05)',
      border: '1px solid rgba(168, 85, 247, 0.2)',
      borderRadius: 3,
    }}
  >
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#F1F5F9', flex: 1, mr: 1 }}>
          {medication.name}
        </Typography>
        <Chip
          label={medication.isActive ? 'Active' : 'Inactive'}
          color={medication.isActive ? 'success' : 'default'}
          size="small"
        />
      </Box>
      <Grid container spacing={1.5}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">Type</Typography>
          <Chip label={medication.drugType?.toUpperCase() || 'N/A'} size="small" sx={{ mt: 0.5 }} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">Dosage</Typography>
          <Typography variant="body2" sx={{ color: '#F1F5F9', mt: 0.5 }}>
            {medication.quantity}x {medication.dosage}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary" display="block">Times</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {medication.timePeriods?.map((period, idx) => (
              <Chip key={idx} label={period} size="small" />
            ))}
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">Meal Relation</Typography>
          <Typography variant="body2" sx={{ color: '#F1F5F9', mt: 0.5 }}>
            {medication.mealRelation?.replace('_', ' ') || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">Duration</Typography>
          <Typography variant="body2" sx={{ color: '#F1F5F9', mt: 0.5 }}>
            {medication.reminderDays || 30} days
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);


// MOBILE QUERY CARD
const QueryCard = ({ query, onView, getStatusColor, getStatusIcon }) => (
  <Card
    sx={{
      mb: 2,
      background: query.status === 'responded' && !query.isReadByPatient
        ? 'rgba(16, 185, 129, 0.05)'
        : 'rgba(99, 102, 241, 0.05)',
      border: query.status === 'responded' && !query.isReadByPatient
        ? '1px solid rgba(16, 185, 129, 0.2)'
        : '1px solid rgba(99, 102, 241, 0.15)',
      borderRadius: 3,
    }}
  >
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 0, flex: 1, mr: 1 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', flexShrink: 0, fontSize: '0.9rem' }}>
            {query.doctorEmail?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#F1F5F9' }}>
              {query.doctorId?.fullName || 'Dr. ' + query.doctorEmail?.split('@')[0]}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {query.doctorEmail}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
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
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          fontSize: '0.82rem',
        }}
      >
        {query.question}
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          {format(new Date(query.createdAt), 'MMM dd, yyyy')}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<VisibilityIcon sx={{ fontSize: '0.9rem !important' }} />}
          onClick={() => onView(query._id)}
          sx={{ fontSize: '0.75rem', py: 0.4, px: 1.2, minWidth: 0 }}
        >
          View
        </Button>
      </Box>
    </CardContent>
  </Card>
);


// MAIN COMPONENT
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));


  // FETCH DATA
  useEffect(() => {
    fetchDashboardData();
    fetchPatientQueries();
    fetchUnreadCount();

    const handleFocus = () => {
      fetchDashboardData();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login to continue');

      const userResponse = await axios.get(`${API_BASE_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUserData(userResponse.data.user);
      setEditData(userResponse.data.user);

      try {
        const medsResponse = await axios.get(`${API_BASE_URL}/medications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const medsData = medsResponse.data;
        if (Array.isArray(medsData)) setMedications(medsData);
        else if (medsData.data && Array.isArray(medsData.data)) setMedications(medsData.data);
        else if (medsData.medications && Array.isArray(medsData.medications)) setMedications(medsData.medications);
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
      fetchUnreadCount();
      fetchPatientQueries();
    } catch (error) {
      console.error('Failed to load query details:', error);
      setError('Failed to load query details');
    }
  };


  // HELPER FUNCTIONS
  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
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

 
  // LOADING STATE
  if (loading) {
    return (
      <ThemeProvider theme={unifiedTheme}>
        <Box sx={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} />
        </Box>
      </ThemeProvider>
    );
  }


  // DOCTOR MESSAGES TAB

  const renderDoctorMessages = () => (
    <Box sx={{ width: '100%' }}>
      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, color: '#F1F5F9' }}>
              <MessageIcon /> Doctor Messages
            </Typography>
            <Chip label={`${unreadCount} Unread`} color={unreadCount > 0 ? 'error' : 'default'} size="small" />
          </Box>

          {queries.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: { xs: 5, sm: 7 } }}>
              <MessageIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                No messages yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send a message to your doctor from the Medicine Reminders page
              </Typography>
            </Box>
          ) : isMobile ? (
            // MOBILE: Card list
            <Box>
              {queries.map((query) => (
                <QueryCard
                  key={query._id}
                  query={query}
                  onView={handleViewQuery}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </Box>
          ) : (
            // TABLET + DESKTOP: Table
            <TableContainer component={Paper} sx={{ borderRadius: 2, width: '100%', overflowX: 'auto' }}>
              <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '23%' }} />
                  <col style={{ width: '37%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '17%' }} />
                  <col style={{ width: '9%' }} />
                </colgroup>
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
                      sx={{ bgcolor: query.status === 'responded' && !query.isReadByPatient ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', flexShrink: 0, fontSize: '0.85rem' }}>
                            {query.doctorEmail?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={500} noWrap>
                              {query.doctorId?.fullName || 'Dr. ' + query.doctorEmail?.split('@')[0]}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {query.doctorEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {query.question.substring(0, 80)}{query.question.length > 80 ? '...' : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {format(new Date(query.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
                          <Chip label={query.status} color={getStatusColor(query.status)} size="small" icon={getStatusIcon(query.status)} />
                          {query.status === 'responded' && !query.isReadByPatient && <Badge color="error" variant="dot" />}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleViewQuery(query._id)} color="primary">
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
    </Box>
  );


  // HEALTH INFO TAB
  const renderHealthInfo = () => (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" sx={{ color: '#FFFFFF', fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
          {'\u{1F4AA}'} Health Information
        </Typography>
        <Button
          variant={editMode ? 'contained' : 'outlined'}
          startIcon={editMode ? <CheckCircle /> : <EditIcon />}
          onClick={() => { if (editMode) handleSave(); else setEditMode(true); }}
          size={isMobile ? 'small' : 'medium'}
        >
          {editMode ? 'Save Changes' : 'Edit'}
        </Button>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Health Metrics */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#F1F5F9', fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' } }}>
                <FitnessIcon fontSize="small" /> Health Metrics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth select label="Blood Type"
                    value={editData.bloodType || ''}
                    disabled={!editMode}
                    onChange={(e) => handleInputChange('bloodType', e.target.value)}
                    InputLabelProps={{ style: { color: '#94A3B8' } }}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{ '& .MuiSelect-select': { color: '#F1F5F9 !important' } }}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth label="Height (cm)" type="number"
                    value={editData.height || ''} disabled={!editMode}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    InputLabelProps={{ style: { color: '#94A3B8' } }}
                    size={isMobile ? 'small' : 'medium'}
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth label="Weight (kg)" type="number"
                    value={editData.weight || ''} disabled={!editMode}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    InputLabelProps={{ style: { color: '#94A3B8' } }}
                    size={isMobile ? 'small' : 'medium'}
                  />
                </Grid>
                {editData.height && editData.weight && (
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="center" mt={1}>
                      <Chip
                        color="success"
                        size={isMobile ? 'small' : 'medium'}
                        label={`BMI: ${(editData.weight / ((editData.height / 100) ** 2)).toFixed(1)}`}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Meal Times */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#F1F5F9', fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' } }}>
                <RestaurantIcon fontSize="small" /> Meal Times
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {[
                  { label: 'Breakfast', key: 'breakfast', default: '08:00' },
                  { label: 'Lunch', key: 'lunch', default: '13:00' },
                  { label: 'Dinner', key: 'dinner', default: '19:00' },
                  { label: 'Night', key: 'night', default: '22:00' },
                ].map(({ label, key, default: def }) => (
                  <Grid item xs={6} key={key}>
                    <TextField
                      fullWidth label={label} type="time"
                      InputLabelProps={{ shrink: true, style: { color: '#94A3B8' } }}
                      value={editData?.mealTimes?.[key] || def}
                      onChange={(e) =>
                        handleInputChange('mealTimes', {
                          ...(editData?.mealTimes || {}),
                          [key]: e.target.value
                        })
                      }
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );


  // MEDICATIONS TAB

  const renderMedications = () => (
    <Box sx={{ width: '100%' }}>
      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, color: '#F1F5F9' }}>
              <MedicationIcon /> Current Medications
            </Typography>
          </Box>

          {isMobile ? (
            // MOBILE: Card list
            <Box>
              {medications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <MedicationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No medications recorded. Add medications from the Medicine Reminders page.
                  </Typography>
                </Box>
              ) : (
                medications.map((medication, index) => (
                  <MedicationCard key={medication._id || index} medication={medication} />
                ))
              )}
            </Box>
          ) : (
            // TABLET + DESKTOP: Table
            <TableContainer component={Paper} sx={{ borderRadius: 2, width: '100%', overflowX: 'auto' }}>
              <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>
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
                      <TableCell><Typography variant="body2" fontWeight={500} noWrap>{medication.name}</Typography></TableCell>
                      <TableCell><Chip label={medication.drugType?.toUpperCase() || 'N/A'} size="small" /></TableCell>
                      <TableCell><Typography variant="body2" noWrap>{medication.quantity}x {medication.dosage}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {medication.timePeriods?.map((period, idx) => (
                            <Chip key={idx} label={period} size="small" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2" noWrap>{medication.mealRelation?.replace('_', ' ') || 'N/A'}</Typography></TableCell>
                      <TableCell><Typography variant="body2" noWrap>{medication.reminderDays || 30} days</Typography></TableCell>
                      <TableCell>
                        <Chip label={medication.isActive ? 'Active' : 'Inactive'} color={medication.isActive ? 'success' : 'default'} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {medications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No medications recorded. Add medications from the Medicine Reminders page.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {medications.length > 0 && (
            <Box sx={{ mt: 2, p: { xs: 1.5, sm: 2 }, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                <CheckCircle sx={{ fontSize: 18 }} />
                <strong>{medications.length}</strong> active medication{medications.length !== 1 ? 's' : ''} with scheduled reminders
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );


  // MAIN RENDER
  return (
    <ThemeProvider theme={unifiedTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          background: '#0F172A',
          py: { xs: 2, sm: 3, md: 4 },
          boxSizing: 'border-box',
        }}
      >
        {/* Page Wrapper */}
        <Box sx={{ width: '100%', px: { xs: 1.5, sm: 2.5, md: 4, lg: 5 }, boxSizing: 'border-box' }}>

          {/* Alerts */}
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

          {/* Welcome Header */}
          <Card elevation={3} sx={{ mb: { xs: 2, sm: 3 }, width: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5, md: 3 } }}>
              <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2.5, md: 3 }} flexWrap="wrap">
                <Avatar
                  sx={{
                    width: { xs: 44, sm: 58, md: 70 },
                    height: { xs: 44, sm: 58, md: 70 },
                    bgcolor: 'primary.main',
                    fontSize: { xs: '1.1rem', sm: '1.5rem', md: '1.8rem' },
                    flexShrink: 0,
                  }}
                >
                  {userData?.fullName?.charAt(0).toUpperCase()}
                </Avatar>
                <Box flex={1} minWidth={0}>
                  <Typography
                    variant="h4"
                    sx={{ fontSize: { xs: '1rem', sm: '1.4rem', md: '1.9rem' }, fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}
                  >
                    Welcome, {userData?.fullName}! {'\u{1F44B}'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                    Manage your health information and medical records
                  </Typography>
                </Box>
                {unreadCount > 0 && (
                  <Chip
                    icon={<MessageIcon />}
                    label={isMobile ? `${unreadCount} New` : `${unreadCount} New Response${unreadCount > 1 ? 's' : ''}`}
                    color="error"
                    onClick={() => setSelectedTab(2)}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{ cursor: 'pointer', flexShrink: 0 }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Paper sx={{ mb: { xs: 2, sm: 3 }, width: '100%' }}>
            <Tabs
              value={selectedTab}
              onChange={(e, newValue) => setSelectedTab(newValue)}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              sx={{
                '& .MuiTab-root': {
                  fontSize: { xs: '0.62rem', sm: '0.78rem', md: '0.875rem' },
                  minHeight: { xs: 42, sm: 50, md: 56 },
                  py: { xs: 0.5, sm: 1 },
                  px: { xs: 0.25, sm: 1, md: 2 },
                },
                '& .MuiTab-iconWrapper': {
                  fontSize: { xs: '1rem', sm: '1.15rem', md: '1.3rem' },
                },
              }}
            >
              <Tab icon={<FitnessIcon />} label={isMobile ? 'Health' : 'Health Info'} iconPosition="start" />
              <Tab icon={<MedicationIcon />} label={isMobile ? 'Meds' : 'Medications'} iconPosition="start" />
              <Tab
                icon={<Badge badgeContent={unreadCount} color="error"><MessageIcon /></Badge>}
                label={isMobile ? 'Messages' : 'Doctor Messages'}
                iconPosition="start"
              />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <Box sx={{ width: '100%' }}>
            {selectedTab === 0 && renderHealthInfo()}
            {selectedTab === 1 && renderMedications()}
            {selectedTab === 2 && renderDoctorMessages()}
          </Box>

        </Box>

        {/* Query Details Dialog */}
        <Dialog
          open={queryDialog}
          onClose={() => setQueryDialog(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              mx: { xs: 0, sm: 2 },
              my: { xs: 0, sm: 2 },
              borderRadius: { xs: 0, sm: 3 },
              maxHeight: { xs: '100dvh', sm: '90vh' },
            },
          }}
        >
          <DialogTitle sx={{ pb: 1, pt: { xs: 2, sm: 2 } }}>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
              Message Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Conversation with {selectedQuery?.doctorId?.fullName || selectedQuery?.doctorEmail}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2, sm: 3 }, overflowY: 'auto' }}>
            {selectedQuery && (
              <Box>
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Your Question:</Typography>
                  <Paper sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: { xs: '0.82rem', sm: '0.875rem' } }}>
                      {selectedQuery.question}
                    </Typography>
                  </Paper>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Sent: {format(new Date(selectedQuery.createdAt), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>

                {selectedQuery.response ? (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Doctor's Response:</Typography>
                    <Paper sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: { xs: '0.82rem', sm: '0.875rem' } }}>
                        {selectedQuery.response}
                      </Typography>
                    </Paper>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Responded: {selectedQuery.respondedAt ? format(new Date(selectedQuery.respondedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </Typography>
                  </Box>
                ) : (
                  <Alert severity="info" icon={<ClockIcon />}>Waiting for doctor's response...</Alert>
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                  <Chip
                    label={selectedQuery.status.charAt(0).toUpperCase() + selectedQuery.status.slice(1)}
                    color={getStatusColor(selectedQuery.status)}
                    icon={getStatusIcon(selectedQuery.status)}
                    size={isMobile ? 'small' : 'medium'}
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Button onClick={() => setQueryDialog(false)} variant="contained" fullWidth={isMobile}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}