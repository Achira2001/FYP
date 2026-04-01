import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  ListItemText,
  MenuItem,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  Alert,
  Card,
  CardContent,
  Tab,
  Tabs,
  Badge,
  Collapse,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Favorite as HeartIcon,
  FitnessCenter as ActivityIcon,
  Restaurant as UtensilsIcon,
  Send as SendIcon,
  LocalFireDepartment as CaloriesIcon,
  Egg as ProteinIcon,
  Grain as CarbsIcon,
  Opacity as FatsIcon,
  Description as FormIcon,
  Assignment as ReportIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import api from '../../services/api';

import MealSummaryCard from './MealSummaryCard';
import DietPlanPage from './DietPlanPage';


// THEME CONFIGURATION

const medivaTheme = createTheme({
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
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
      disabled: '#475569',
    },
    divider: '#334155',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1E293B',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E293B',
        },
      },
    },
  },
});


// API CONFIGURATION

const ML_API_BASE_URL = 'http://localhost:5001/api';
const MERN_API_BASE_URL = 'http://localhost:5000/api';
const PROFILE_API_URL = 'http://localhost:5000/api/profile';


// CONSTANTS

const diseases = [
  'None', 'Diabetes', 'Hypertension', 'Heart Disease', 'Obesity',
  'Gluten Intolerance', 'Lactose Intolerance', 'Nut Allergy',
  'Kidney Disease', 'Liver Disease', 'Thyroid Disorder',
  'PCOS', 'Anemia', 'High Cholesterol', 'Osteoporosis',
];

const dietPreferences = [
  'Regular', 'Vegetarian', 'Vegan', 'Keto', 'Paleo',
  'Mediterranean', 'Low-Carb', 'High-Protein',
];

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'light', label: 'Lightly active (1-3 days/week)' },
  { value: 'moderate', label: 'Moderately active (3-5 days/week)' },
  { value: 'very', label: 'Very active (6-7 days/week)' },
  { value: 'extra', label: 'Extra active (physical job + exercise)' },
];

const goals = [
  'Weight Loss', 'Weight Gain', 'Muscle Building',
  'Maintenance', 'Health Improvement',
];


// MAIN COMPONENT

export default function DietPlanForm() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedTab, setSelectedTab] = useState(0);

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    bmi: '',
    diseases: [],
    dietPreference: '',
    activityLevel: '',
    goal: '',
    allergies: '',
    mealsPerDay: '3',
  });
  const [anchorEl, setAnchorEl] = useState(null);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [reportFormData, setReportFormData] = useState({
    height: '',
    weight: '',
    bmi: '',
    dietPreference: 'Regular',
    activityLevel: 'moderate',
    goal: 'Maintenance',
    mealsPerDay: '3',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState(null);

  const [savedPlans, setSavedPlans] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [showDietPlanPage, setShowDietPlanPage] = useState(false);

  const steps = ['Basic Info', 'Health Details', 'Diet Preferences'];

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) return '';

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }

    return age > 0 ? String(age) : '';
  };

  const calculateBMI = (height, weight) => {
    const h = Number(height);
    const w = Number(weight);

    if (!h || !w) return '';
    const bmi = w / ((h / 100) * (h / 100));
    return bmi.toFixed(2);
  };

  const mapMedicalHistoryToDiseases = (medicalHistory = []) => {
    if (!Array.isArray(medicalHistory) || medicalHistory.length === 0) {
      return [];
    }

    const supportedDiseases = [
      'Diabetes',
      'Hypertension',
      'Heart Disease',
      'Obesity',
      'Gluten Intolerance',
      'Lactose Intolerance',
      'Nut Allergy',
      'Kidney Disease',
      'Liver Disease',
      'Thyroid Disorder',
      'PCOS',
      'Anemia',
      'High Cholesterol',
      'Osteoporosis',
    ];

    const found = medicalHistory
      .filter((item) => item?.isActive !== false)
      .map((item) => item?.condition?.trim())
      .filter(Boolean)
      .filter((condition) => supportedDiseases.includes(condition));

    return found.length ? found : [];
  };

  const fetchAndPrefillUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(PROFILE_API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = response.data?.user;
      if (!user) return;

      const age = calculateAge(user.dateOfBirth);
      const bmi = calculateBMI(user.height, user.weight);
      const mappedDiseases = mapMedicalHistoryToDiseases(user.medicalHistory);

      setFormData((prev) => ({
        ...prev,
        name: user.fullName || '',
        age,
        gender: user.gender || prev.gender || '',
        height: user.height ? String(user.height) : '',
        weight: user.weight ? String(user.weight) : '',
        bmi,
        diseases: mappedDiseases.length ? mappedDiseases : prev.diseases,
        allergies: user.allergies || prev.allergies || '',
      }));

      setReportFormData((prev) => ({
        ...prev,
        height: user.height ? String(user.height) : '',
        weight: user.weight ? String(user.weight) : '',
        bmi,
      }));
    } catch (error) {
      console.error('Failed to auto-fill diet plan profile:', error);
    }
  };

  useEffect(() => {
    fetchSavedPlans();
    fetchAndPrefillUserProfile();
  }, []);

  useEffect(() => {
    if (ocrData) {
      fetchAndPrefillUserProfile();
    }
  }, [ocrData]);

  const fetchSavedPlans = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get('/diet-plans/recent');
      if (response.data.success) {
        setSavedPlans(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching saved plans:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveDietPlanToMongoDB = async (mlResponse, sourceData, dataSource) => {
    try {
      console.log('Saving diet plan to MongoDB...');
      const dietPlanData = {
        userInfo: {
          name: mlResponse.user_info.name,
          age: parseInt(mlResponse.user_info.age),
          gender: mlResponse.user_info.gender,
          bmi: parseFloat(mlResponse.user_info.bmi),
          goal: mlResponse.user_info.goal,
        },
        inputData: {
          height: parseFloat(sourceData.height),
          weight: parseFloat(sourceData.weight),
          diseases: sourceData.diseases || [],
          allergies: sourceData.allergies || '',
          dietPreference: sourceData.dietPreference || 'Regular',
          activityLevel: sourceData.activityLevel || 'moderate',
          mealsPerDay: parseInt(sourceData.mealsPerDay || 3),
        },
        recommendations: mlResponse.recommendations,
        macro_percentages: mlResponse.macro_percentages,
        meal_breakdown: mlResponse.meal_breakdown,
        health_insights: mlResponse.health_insights,
        generatedFrom: dataSource,
        reportInfo: dataSource === 'medical_report' ? {
          uploaded: true,
          extractedData: ocrData || {},
        } : {
          uploaded: false,
        },
      };

      const response = await api.post('/diet-plans', dietPlanData);
      if (response.data.success) {
        console.log('✓ Diet plan saved to MongoDB:', response.data.data._id);
        fetchSavedPlans();
        return response.data.data._id;
      }
    } catch (error) {
      console.error('Error saving to MongoDB:', error);
      return null;
    }
  };

  const loadSavedPlan = async (planId) => {
    try {
      const response = await api.get(`/diet-plans/${planId}`);
      if (response.data.success) {
        const plan = response.data.data;
        const recommendationsData = {
          success: true,
          user_info: plan.userInfo,
          recommendations: plan.recommendations,
          macro_percentages: plan.macro_percentages,
          meal_breakdown: plan.meal_breakdown,
          health_insights: plan.health_insights,
          userDiseases: plan.inputData?.diseases || [],
          userAllergies: plan.inputData?.allergies || '',
        };
        setRecommendations(recommendationsData);
        setSuccess(true);
        setShowHistory(false);
      }
    } catch (error) {
      console.error('Error loading saved plan:', error);
      setError('Failed to load saved diet plan');
    }
  };

  const deleteSavedPlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this diet plan?')) return;
    try {
      const response = await api.delete(`/diet-plans/${planId}`);
      if (response.data.success) {
        fetchSavedPlans();
        alert('Diet plan deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete diet plan');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'height' || name === 'weight') {
      const height = name === 'height' ? value : formData.height;
      const weight = name === 'weight' ? value : formData.weight;
      if (height && weight) {
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
        setFormData(prev => ({ ...prev, bmi }));
      }
    }
  };

  const toggleDisease = (disease) => {
    setFormData(prev => ({
      ...prev,
      diseases: prev.diseases.includes(disease)
        ? prev.diseases.filter(d => d !== disease)
        : [...prev.diseases, disease],
    }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const mlResponse = await axios.post(`${ML_API_BASE_URL}/predict`, formData);
      if (mlResponse.data.success) {
        await saveDietPlanToMongoDB(mlResponse.data, formData, 'manual_form');

        setRecommendations({
          ...mlResponse.data,
          userDiseases: formData.diseases,
          userAllergies: formData.allergies,
        });

        setSuccess(true);
      } else {
        setError(mlResponse.data.error || 'Failed to get recommendations');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(
        err.response?.data?.error ||
        'Failed to connect to the AI server. Please ensure the Python backend is running on port 5001.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setOcrData(null);
      setError('');
    }
  };

  const handleProcessReport = async () => {
    if (!uploadedFile) {
      setError('Please select a file first');
      return;
    }
    setOcrProcessing(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', uploadedFile);
      const response = await axios.post(`${ML_API_BASE_URL}/process-report`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setOcrData(response.data);
        console.log('OCR Result:', response.data);
      } else {
        setError(response.data.error || 'Failed to process report');
      }
    } catch (err) {
      console.error('Error processing report:', err);
      setError(
        err.response?.data?.error ||
        'Failed to process report. Please ensure the Python backend is running.'
      );
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleReportInputChange = (e) => {
    const { name, value } = e.target;
    setReportFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'height' || name === 'weight') {
      const height = name === 'height' ? value : reportFormData.height;
      const weight = name === 'weight' ? value : reportFormData.weight;
      if (height && weight) {
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
        setReportFormData(prev => ({ ...prev, bmi }));
      }
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const submitData = {
        name: ocrData?.patient_details?.name || formData.name || 'Patient',
        age: ocrData?.patient_details?.age?.toString() || formData.age || '30',
        gender: ocrData?.patient_details?.gender || formData.gender || 'Other',
        height: reportFormData.height,
        weight: reportFormData.weight,
        bmi: reportFormData.bmi,
        diseases: ocrData.diseases || ['None'],
        dietPreference: reportFormData.dietPreference,
        activityLevel: reportFormData.activityLevel,
        goal: reportFormData.goal,
        allergies: ocrData.allergies || '',
        mealsPerDay: reportFormData.mealsPerDay,
      };

      const mlResponse = await axios.post(`${ML_API_BASE_URL}/predict`, submitData);
      if (mlResponse.data.success) {
        await saveDietPlanToMongoDB(mlResponse.data, submitData, 'medical_report');

        setRecommendations({
          ...mlResponse.data,
          userDiseases: ocrData?.diseases || [],
          userAllergies: ocrData?.allergies || '',
        });

        setSuccess(true);
      } else {
        setError(mlResponse.data.error || 'Failed to get recommendations');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Failed to connect to the AI server.');
    } finally {
      setLoading(false);
    }
  };

  const getBMIStatus = (bmi) => {
    if (!bmi) return '';
    const val = parseFloat(bmi);
    if (val < 18.5) return 'Underweight';
    if (val < 25) return 'Normal';
    if (val < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMIColor = (bmi) => {
    if (!bmi) return theme.palette.text.disabled;
    const val = parseFloat(bmi);
    if (val < 18.5) return '#6366F1';
    if (val < 25) return '#A855F7';
    if (val < 30) return '#FBBF24';
    return '#F87171';
  };

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  const resetForm = async () => {
    setSuccess(false);
    setShowDietPlanPage(false);
    setSelectedTab(0);
    setActiveStep(0);

    setFormData({
      name: '',
      age: '',
      gender: '',
      height: '',
      weight: '',
      bmi: '',
      diseases: [],
      dietPreference: '',
      activityLevel: '',
      goal: '',
      allergies: '',
      mealsPerDay: '3',
    });

    setUploadedFile(null);
    setOcrData(null);

    setReportFormData({
      height: '',
      weight: '',
      bmi: '',
      dietPreference: 'Regular',
      activityLevel: 'moderate',
      goal: 'Maintenance',
      mealsPerDay: '3',
    });

    setRecommendations(null);
    setError('');

    await fetchAndPrefillUserProfile();
  };

  const renderHistorySection = () => (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 3,
        borderRadius: { xs: 3, sm: 4 },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        mb={2}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
        >
          <HistoryIcon sx={{ color: 'primary.main' }} />
          <Typography variant={isMobile ? 'subtitle1' : 'h6'}>
            Your Diet Plan History
          </Typography>
          {savedPlans.length > 0 && (
            <Badge badgeContent={savedPlans.length} color="primary" />
          )}
        </Stack>

        <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-end', sm: 'flex-start' }}>
          <IconButton
            onClick={fetchSavedPlans}
            disabled={loadingHistory}
            size="small"
            sx={{ color: 'primary.main' }}
          >
            <RefreshIcon />
          </IconButton>
          <Button variant="outlined" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Hide History' : 'Show History'}
          </Button>
        </Stack>
      </Stack>

      <Collapse in={showHistory}>
        {loadingHistory ? (
          <Box textAlign="center" py={3}>
            <CircularProgress />
          </Box>
        ) : savedPlans.length === 0 ? (
          <Alert severity="info">No saved diet plans yet. Create your first one!</Alert>
        ) : (
          <Grid container spacing={2} mt={1}>
            {savedPlans.map((plan) => (
              <Grid item xs={12} md={6} key={plan._id}>
                <Card sx={{ bgcolor: 'background.default', height: '100%' }}>
                  <CardContent>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'start' }}
                      spacing={1}
                      mb={1}
                    >
                      <Typography
                        variant="h6"
                        sx={{ wordBreak: 'break-word' }}
                      >
                        {plan.userInfo.name}
                      </Typography>
                      <Chip
                        label={plan.generatedFrom === 'medical_report' ? 'Report' : 'Manual'}
                        size="small"
                        color={plan.generatedFrom === 'medical_report' ? 'secondary' : 'primary'}
                      />
                    </Stack>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Created: {new Date(plan.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        <strong>Age:</strong> {plan.userInfo.age} years | <strong>Gender:</strong> {plan.userInfo.gender}
                      </Typography>
                      <Typography variant="body2">
                        <strong>BMI:</strong> {plan.userInfo.bmi} ({getBMIStatus(plan.userInfo.bmi)})
                      </Typography>
                      <Typography variant="body2">
                        <strong>Goal:</strong> {plan.userInfo.goal}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'primary.main', fontWeight: 600, wordBreak: 'break-word' }}
                      >
                        {plan.recommendations.meal_plan_type}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Calories:</strong> {plan.recommendations.daily_calories} kcal/day
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} mt={2}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => loadSavedPlan(plan._id)}
                        fullWidth
                      >
                        View Details
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => deleteSavedPlan(plan._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Collapse>
    </Paper>
  );

  if (success && recommendations) {
    const {
      user_info,
      recommendations: recs,
      macro_percentages,
      meal_breakdown,
      health_insights,
      userDiseases,
      userAllergies,
    } = recommendations;

    if (showDietPlanPage) {
      return (
        <ThemeProvider theme={medivaTheme}>
          <DietPlanPage
            mealPlanType={recs.meal_plan_type}
            diseases={userDiseases || []}
            allergies={userAllergies || ''}
            dailyCalories={recs.daily_calories}
            proteinGrams={recs.protein_grams}
            carbsGrams={recs.carbs_grams}
            fatsGrams={recs.fats_grams}
            patientName={user_info.name}
            onBack={() => setShowDietPlanPage(false)}
          />
        </ThemeProvider>
      );
    }

    return (
      <ThemeProvider theme={medivaTheme}>
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom right, #0F172A, #312E81, #0F172A)',
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <Container maxWidth="lg" disableGutters={isMobile}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: { xs: 3, sm: 4 },
                overflow: 'hidden',
              }}
            >
              <Box textAlign="center" mb={4}>
                <CheckCircleIcon sx={{ fontSize: { xs: 64, sm: 80 }, color: '#6366F1', mb: 2 }} />
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  sx={{ color: 'text.primary', mb: 1, px: 1, wordBreak: 'break-word' }}
                >
                  {"Your Personalized Diet Plan is Ready! \u{1F389}"}
                </Typography>
                <Typography sx={{ color: 'text.secondary', px: 1 }}>
                  Based on your health profile and goals
                </Typography>
              </Box>

              <Paper
                variant="outlined"
                sx={{ p: { xs: 2, sm: 3 }, mb: 3, bgcolor: 'background.default' }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {"\u{1F4CB} Your Profile"}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{user_info.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Age</Typography>
                    <Typography variant="body1">{user_info.age} years</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Gender</Typography>
                    <Typography variant="body1">{user_info.gender}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">BMI</Typography>
                    <Typography variant="body1" sx={{ color: getBMIColor(user_info.bmi) }}>
                      {user_info.bmi} - {getBMIStatus(user_info.bmi)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                sx={{ mb: 3, color: 'primary.main', wordBreak: 'break-word' }}
              >
                {`\u{1F3AF} Recommended: ${recs.meal_plan_type}`}
              </Typography>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#312E81', height: '100%' }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <CaloriesIcon sx={{ color: '#F87171' }} />
                        <Typography variant="body2">Daily Calories</Typography>
                      </Stack>
                      <Typography variant="h5">{recs.daily_calories}</Typography>
                      <Typography variant="caption" color="text.secondary">kcal/day</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#312E81', height: '100%' }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <ProteinIcon sx={{ color: '#F87171' }} />
                        <Typography variant="body2">Protein</Typography>
                      </Stack>
                      <Typography variant="h5">{recs.protein_grams}g</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {macro_percentages.protein}% of total
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#312E81', height: '100%' }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <CarbsIcon sx={{ color: '#FBBF24' }} />
                        <Typography variant="body2">Carbs</Typography>
                      </Stack>
                      <Typography variant="h5">{recs.carbs_grams}g</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {macro_percentages.carbs}% of total
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#312E81', height: '100%' }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <FatsIcon sx={{ color: '#A855F7' }} />
                        <Typography variant="body2">Fats</Typography>
                      </Stack>
                      <Typography variant="h5">{recs.fats_grams}g</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {macro_percentages.fats}% of total
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {"\u{1F4CA} Macronutrient Distribution"}
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">Protein</Typography>
                      <Typography variant="body2">{macro_percentages.protein}%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={macro_percentages.protein}
                      sx={{ height: 10, borderRadius: 5, bgcolor: 'background.default' }}
                    />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">Carbohydrates</Typography>
                      <Typography variant="body2">{macro_percentages.carbs}%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={macro_percentages.carbs}
                      sx={{ height: 10, borderRadius: 5, bgcolor: 'background.default' }}
                    />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">Fats</Typography>
                      <Typography variant="body2">{macro_percentages.fats}%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={macro_percentages.fats}
                      sx={{ height: 10, borderRadius: 5, bgcolor: 'background.default' }}
                    />
                  </Box>
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {"\u{1F37D}\u{FE0F} Meal Breakdown"}
                </Typography>
                <Grid container spacing={2}>
                  {meal_breakdown.map((meal, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card sx={{ bgcolor: 'background.default', height: '100%' }}>
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            sx={{ mb: 1, color: 'primary.main', wordBreak: 'break-word' }}
                          >
                            {meal.name}
                          </Typography>
                          <Stack spacing={0.5}>
                            <Typography variant="body2">Calories: {meal.calories} kcal</Typography>
                            <Typography variant="body2">
                              Protein: {meal.protein}g | Carbs: {meal.carbs}g | Fats: {meal.fats}g
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {health_insights && health_insights.length > 0 && (
                <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {"\u{1F4A1} Personalized Health Insights"}
                  </Typography>
                  <Stack spacing={1.5}>
                    {health_insights.map((insight, index) => (
                      <Alert
                        key={index}
                        severity="info"
                        sx={{
                          bgcolor: 'background.default',
                          '& .MuiAlert-message': {
                            wordBreak: 'break-word',
                          },
                        }}
                      >
                        {insight}
                      </Alert>
                    ))}
                  </Stack>
                </Paper>
              )}

              <MealSummaryCard
                mealPlanType={recs.meal_plan_type}
                diseases={userDiseases || []}
                allergies={userAllergies || ''}
                dailyCalories={recs.daily_calories}
                onViewFullPlan={() => setShowDietPlanPage(true)}
              />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                mt={4}
              >
                <Button variant="contained" color="primary" onClick={resetForm} size="large" fullWidth={isMobile}>
                  Create Another Plan
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => window.print()} size="large" fullWidth={isMobile}>
                  Print Plan
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => setShowDietPlanPage(true)}
                  fullWidth={isMobile}
                  sx={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)' }}
                >
                  View Full Food Plan
                </Button>
              </Stack>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={medivaTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #0F172A, #312E81, #0F172A)',
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Container maxWidth="xl" disableGutters={isMobile}>
          {renderHistorySection()}

          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: { xs: 3, sm: 4 },
              overflow: 'hidden',
            }}
          >
            <Box textAlign="center" mb={4}>
              <Stack
                direction="row"
                justifyContent="center"
                spacing={{ xs: 1, sm: 2 }}
                mb={2}
                flexWrap="wrap"
              >
                <UtensilsIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#6366F1' }} />
                <ActivityIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#A855F7' }} />
                <HeartIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#A855F7' }} />
              </Stack>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                sx={{
                  color: 'text.primary',
                  mb: 1,
                  px: 1,
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}
              >
                AI-Powered Diet Plan Generator
              </Typography>
              <Typography sx={{ color: 'text.secondary', px: 1 }}>
                Get personalized meal recommendations using advanced machine learning
              </Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
              <Tabs
                value={selectedTab}
                onChange={(e, newValue) => {
                  setSelectedTab(newValue);
                  setError('');
                }}
                variant={isMobile ? 'scrollable' : 'fullWidth'}
                scrollButtons="auto"
                allowScrollButtonsMobile
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  '& .MuiTab-root': {
                    minHeight: { xs: 56, sm: 64 },
                    fontSize: { xs: '0.8rem', sm: '0.95rem' },
                    px: { xs: 1, sm: 2 },
                    whiteSpace: 'normal',
                    textAlign: 'center',
                  },
                }}
              >
                <Tab
                  icon={<FormIcon />}
                  label="Fill Form Manually"
                  iconPosition={isMobile ? 'top' : 'start'}
                />
                <Tab
                  icon={<ReportIcon />}
                  label="Upload Medical Report"
                  iconPosition={isMobile ? 'top' : 'start'}
                />
              </Tabs>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {selectedTab === 0 && (
              <>
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel={!isMobile}
                  orientation={isMobile ? 'vertical' : 'horizontal'}
                  sx={{ mb: 4 }}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Box component="form" onSubmit={handleManualSubmit} mb={4}>
                  {activeStep === 0 && (
                    <Stack spacing={2}>
                      <TextField
                        label="Full Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        fullWidth
                        required
                      />

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Age *"
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            inputProps={{ min: 1, max: 120 }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormControl component="fieldset" fullWidth>
                            <FormLabel component="legend">Gender *</FormLabel>
                            <RadioGroup
                              row={!isMobile}
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                            >
                              <FormControlLabel value="Male" control={<Radio />} label="Male" />
                              <FormControlLabel value="Female" control={<Radio />} label="Female" />
                              <FormControlLabel value="Other" control={<Radio />} label="Other" />
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                      </Grid>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Height (cm) *"
                            name="height"
                            type="number"
                            value={formData.height}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            inputProps={{ min: 50, max: 250 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Weight (kg) *"
                            name="weight"
                            type="number"
                            value={formData.weight}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            inputProps={{ min: 20, max: 300 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField label="BMI" value={formData.bmi} disabled fullWidth />
                          {formData.bmi && (
                            <Typography variant="body2" sx={{ mt: 1, color: getBMIColor(formData.bmi) }}>
                              {getBMIStatus(formData.bmi)}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>

                      <FormControl fullWidth required>
                        <InputLabel>Activity Level *</InputLabel>
                        <Select
                          name="activityLevel"
                          value={formData.activityLevel}
                          onChange={handleInputChange}
                          label="Activity Level *"
                        >
                          {activityLevels.map(level => (
                            <MenuItem
                              key={level.value}
                              value={level.value}
                              sx={{
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                alignItems: 'flex-start',
                              }}
                            >
                              {level.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  )}

                  {activeStep === 1 && (
                    <Stack spacing={2}>
                      <Box>
                        <FormLabel sx={{ mb: 1, display: 'block' }}>
                          Medical Conditions
                        </FormLabel>
                        <Button
                          variant="outlined"
                          onClick={handleClick}
                          fullWidth
                          sx={{
                            justifyContent: 'space-between',
                            textTransform: 'none',
                            textAlign: 'left',
                            py: 1.25,
                          }}
                        >
                          {formData.diseases.length === 0
                            ? 'Select conditions...'
                            : `${formData.diseases.length} selected`}
                        </Button>

                        <Popover
                          open={open}
                          anchorEl={anchorEl}
                          onClose={handleClose}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                          PaperProps={{
                            sx: {
                              maxWidth: isMobile ? '95vw' : 420,
                              width: isMobile ? '95vw' : 360,
                            },
                          }}
                        >
                          <Box sx={{ maxHeight: 260, overflowY: 'auto', p: 1 }}>
                            {diseases.map(disease => (
                              <MenuItem
                                key={disease}
                                onClick={() => toggleDisease(disease)}
                                sx={{ alignItems: 'flex-start' }}
                              >
                                <Checkbox checked={formData.diseases.includes(disease)} />
                                <ListItemText
                                  primary={disease}
                                  primaryTypographyProps={{
                                    sx: {
                                      whiteSpace: 'normal',
                                      wordBreak: 'break-word',
                                    },
                                  }}
                                />
                              </MenuItem>
                            ))}
                          </Box>
                        </Popover>

                        {formData.diseases.length > 0 && (
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                            mt={2}
                          >
                            {formData.diseases.map(disease => (
                              <Chip
                                key={disease}
                                label={disease}
                                onDelete={() => toggleDisease(disease)}
                                color="primary"
                                sx={{
                                  mb: 1,
                                  maxWidth: '100%',
                                  height: 'auto',
                                  '& .MuiChip-label': {
                                    display: 'block',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word',
                                    py: 0.75,
                                  },
                                }}
                              />
                            ))}
                          </Stack>
                        )}
                      </Box>

                      <TextField
                        label="Allergies"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleInputChange}
                        placeholder="e.g., Peanuts, Shellfish, Dairy"
                        multiline
                        rows={3}
                        fullWidth
                        helperText="Separate multiple allergies with commas"
                      />
                    </Stack>
                  )}

                  {activeStep === 2 && (
                    <Stack spacing={2}>
  <Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    <TextField
      select
      fullWidth
      required
      label="Diet Preference *"
      name="dietPreference"
      value={formData.dietPreference}
      onChange={handleInputChange}
      InputLabelProps={{ shrink: true }}
      SelectProps={{
        displayEmpty: true,
      }}
      sx={{
        minWidth: 320,
        '& .MuiOutlinedInput-root': {
          minHeight: 56,
        },
        '& .MuiSelect-select': {
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      }}
    >
      {dietPreferences.map((pref) => (
        <MenuItem key={pref} value={pref}>
          {pref}
        </MenuItem>
      ))}
    </TextField>
  </Grid>

  <Grid item xs={12} md={6}>
    <TextField
      select
      fullWidth
      required
      label="Goal *"
      name="goal"
      value={formData.goal}
      onChange={handleInputChange}
      InputLabelProps={{ shrink: true }}
      SelectProps={{
        displayEmpty: true,
      }}
      sx={{
        minWidth: 320,
        '& .MuiOutlinedInput-root': {
          minHeight: 56,
        },
        '& .MuiSelect-select': {
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      }}
    >
      {goals.map((goal) => (
        <MenuItem key={goal} value={goal}>
          {goal}
        </MenuItem>
      ))}
    </TextField>
  </Grid>
</Grid>

                      <FormControl fullWidth>
                        <InputLabel>Meals Per Day</InputLabel>
                        <Select
                          name="mealsPerDay"
                          value={formData.mealsPerDay}
                          onChange={handleInputChange}
                          label="Meals Per Day"
                        >
                          {[3, 4, 5, 6].map(num => (
                            <MenuItem key={num} value={num}>
                              {num} Meals
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mt: 3, bgcolor: 'background.default' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          {"\u{1F4C4} Summary"}
                        </Typography>
                        <Stack spacing={1}>
                          <Typography><strong>Name:</strong> {formData.name || 'N/A'}</Typography>
                          <Typography>
                            <strong>Age/Gender:</strong> {formData.age || 'N/A'} years, {formData.gender || 'N/A'}
                          </Typography>
                          <Typography>
                            <strong>BMI:</strong> {formData.bmi || 'N/A'} ({getBMIStatus(formData.bmi) || 'N/A'})
                          </Typography>
                          <Typography>
                            <strong>Activity:</strong>{' '}
                            {formData.activityLevel
                              ? activityLevels.find(l => l.value === formData.activityLevel)?.label
                              : 'N/A'}
                          </Typography>
                          <Typography sx={{ wordBreak: 'break-word' }}>
                            <strong>Conditions:</strong>{' '}
                            {formData.diseases.length > 0 ? formData.diseases.join(', ') : 'None'}
                          </Typography>
                          <Typography><strong>Diet:</strong> {formData.dietPreference || 'N/A'}</Typography>
                          <Typography><strong>Goal:</strong> {formData.goal || 'N/A'}</Typography>
                        </Stack>
                      </Paper>
                    </Stack>
                  )}
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  gap={2}
                  mt={4}
                  flexDirection={isMobile ? 'column' : 'row'}
                >
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep(prev => prev - 1)}
                    startIcon={<ChevronLeftIcon />}
                    fullWidth={isMobile}
                  >
                    Back
                  </Button>

                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleManualSubmit}
                      disabled={
                        loading || !formData.name || !formData.age || !formData.gender ||
                        !formData.height || !formData.weight || !formData.activityLevel ||
                        !formData.dietPreference || !formData.goal
                      }
                      endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                      fullWidth={isMobile}
                    >
                      {loading ? 'Generating...' : 'Generate AI Diet Plan'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setActiveStep(prev => prev + 1)}
                      endIcon={<ChevronRightIcon />}
                      fullWidth={isMobile}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </>
            )}

            {selectedTab === 1 && (
              <Box>
                <Typography
                  variant={isMobile ? 'subtitle1' : 'h6'}
                  sx={{ mb: 3, textAlign: 'center' }}
                >
                  Upload Your Medical Report
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mb: 4, textAlign: 'center', color: 'text.secondary', px: 1 }}
                >
                  Our AI will automatically extract your health information from the report
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2, sm: 4 },
                    mb: 4,
                    textAlign: 'center',
                    borderStyle: 'dashed',
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: { xs: 52, sm: 64 }, color: 'primary.main', mb: 2 }} />
                  <Typography
                    variant={isMobile ? 'subtitle1' : 'h6'}
                    sx={{ mb: 2, wordBreak: 'break-word' }}
                  >
                    {uploadedFile ? uploadedFile.name : 'Select Medical Report'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Supported: PDF, JPG, PNG (Max 10MB)
                  </Typography>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Button variant="outlined" component="label" fullWidth={isMobile}>
                      Choose File
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} hidden />
                    </Button>

                    {uploadedFile && (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleProcessReport}
                          disabled={ocrProcessing}
                          startIcon={ocrProcessing ? <CircularProgress size={20} /> : <SendIcon />}
                          fullWidth={isMobile}
                        >
                          {ocrProcessing ? 'Processing...' : 'Process Report'}
                        </Button>
                        <IconButton
                          color="error"
                          onClick={() => {
                            setUploadedFile(null);
                            setOcrData(null);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </Stack>
                </Paper>

                {ocrData && (
                  <>
                    <Alert severity="success" sx={{ mb: 3 }}>
                      ✓ Report processed successfully! Review the extracted information below.
                    </Alert>

                    <Paper
                      variant="outlined"
                      sx={{ p: { xs: 2, sm: 3 }, mb: 3, bgcolor: 'background.default' }}
                    >
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {"\u{1F4C4} Extracted from Report"}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Name</Typography>
                          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                            {ocrData.patient_details?.name || 'Not found'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Age</Typography>
                          <Typography variant="body1">{ocrData.patient_details?.age || 'Not found'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Gender</Typography>
                          <Typography variant="body1">{ocrData.patient_details?.gender || 'Not found'}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Medical Conditions</Typography>
                          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
                            {ocrData.diseases && ocrData.diseases.length > 0 ? (
                              ocrData.diseases.map((disease, idx) => (
                                <Chip
                                  key={idx}
                                  label={disease}
                                  color="primary"
                                  size="small"
                                  sx={{
                                    mb: 1,
                                    maxWidth: '100%',
                                    height: 'auto',
                                    '& .MuiChip-label': {
                                      whiteSpace: 'normal',
                                      wordBreak: 'break-word',
                                      py: 0.5,
                                    },
                                  }}
                                />
                              ))
                            ) : (
                              <Typography variant="body1">None detected</Typography>
                            )}
                          </Stack>
                        </Grid>
                        {ocrData.allergies && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">Allergies</Typography>
                            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                              {ocrData.allergies}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 3 }}>
                        {"\u{1F4DD} Complete Your Profile"}
                      </Typography>
                      <Stack spacing={3}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Height (cm) *"
                              name="height"
                              type="number"
                              value={reportFormData.height}
                              onChange={handleReportInputChange}
                              fullWidth
                              required
                              inputProps={{ min: 50, max: 250 }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              label="Weight (kg) *"
                              name="weight"
                              type="number"
                              value={reportFormData.weight}
                              onChange={handleReportInputChange}
                              fullWidth
                              required
                              inputProps={{ min: 20, max: 300 }}
                            />
                          </Grid>
                        </Grid>

                        {reportFormData.bmi && (
                          <Alert severity="info">
                            <Typography variant="body2">
                              <strong>BMI:</strong> {reportFormData.bmi} - {getBMIStatus(reportFormData.bmi)}
                            </Typography>
                          </Alert>
                        )}

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                              <InputLabel>Activity Level *</InputLabel>
                              <Select
                                name="activityLevel"
                                value={reportFormData.activityLevel}
                                onChange={handleReportInputChange}
                                label="Activity Level *"
                              >
                                {activityLevels.map(level => (
                                  <MenuItem
                                    key={level.value}
                                    value={level.value}
                                    sx={{
                                      whiteSpace: 'normal',
                                      wordBreak: 'break-word',
                                      alignItems: 'flex-start',
                                    }}
                                  >
                                    {level.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                              <InputLabel>Goal *</InputLabel>
                              <Select
                                name="goal"
                                value={reportFormData.goal}
                                onChange={handleReportInputChange}
                                label="Goal *"
                              >
                                {goals.map(goal => (
                                  <MenuItem key={goal} value={goal}>
                                    {goal}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Diet Preference</InputLabel>
                              <Select
                                name="dietPreference"
                                value={reportFormData.dietPreference}
                                onChange={handleReportInputChange}
                                label="Diet Preference"
                              >
                                {dietPreferences.map(pref => (
                                  <MenuItem key={pref} value={pref}>
                                    {pref}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Meals Per Day</InputLabel>
                              <Select
                                name="mealsPerDay"
                                value={reportFormData.mealsPerDay}
                                onChange={handleReportInputChange}
                                label="Meals Per Day"
                              >
                                {[3, 4, 5, 6].map(num => (
                                  <MenuItem key={num} value={num}>
                                    {num} Meals
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Stack>
                    </Paper>

                    <Box display="flex" justifyContent="center">
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleReportSubmit}
                        disabled={loading || !reportFormData.height || !reportFormData.weight}
                        endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                        fullWidth={isMobile}
                        sx={{ maxWidth: isMobile ? '100%' : 360 }}
                      >
                        {loading ? 'Generating...' : 'Generate Diet Plan from Report'}
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}