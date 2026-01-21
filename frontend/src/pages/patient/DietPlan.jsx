import React, { useState } from 'react';
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
  ListItemText,
  MenuItem,
  OutlinedInput,
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
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const medivaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1', // Indigo-500
      light: '#A5B4FC',
      dark: '#4338CA',
    },
    secondary: {
      main: '#A855F7', // Purple-500
      light: '#D946EF',
      dark: '#7E22CE',
    },
    background: {
      default: '#0F172A', // Slate-900
      paper: '#1E293B', // Slate-800
    },
    text: {
      primary: '#F1F5F9', // Slate-100
      secondary: '#CBD5E1', // Slate-300
      disabled: '#475569', // Slate-600
    },
    divider: '#334155', // Slate-700
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999, // Pill-shaped buttons
          textTransform: 'none',
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

export default function DietPlanForm() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '', age: '', gender: '', height: '', weight: '', bmi: '',
    diseases: [], dietPreference: '', activityLevel: '', goal: '',
    allergies: '', mealsPerDay: '3',
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const steps = ['Basic Info', 'Health Details', 'Diet Preferences'];

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
        : [...prev.diseases, disease]
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      console.log('Form Data:', formData);
      console.log('Uploaded File:', uploadedFile);
    }, 2000);
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
    if (val < 18.5) return '#6366F1'; // Indigo-500
    if (val < 25) return '#A855F7'; // Purple-500
    if (val < 30) return '#FBBF24'; // Yellow-400
    return '#F87171'; // Red-400
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  if (success) {
    return (
      <ThemeProvider theme={medivaTheme}>
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom right, #0F172A, #312E81, #0F172A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: '#6366F1', mb: 2 }} />
            <Typography variant="h5" sx={{ color: 'text.primary', mb: 2 }}>
              Success!
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 1 }}>
              Your diet plan request has been submitted successfully.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled', mb: 4 }}>
              Our nutritionists will analyze your data and create a personalized diet plan.
              You'll receive your plan within 24-48 hours.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setSuccess(false);
                setActiveStep(0);
                setFormData({
                  name: '', age: '', gender: '', height: '', weight: '', bmi: '',
                  diseases: [], dietPreference: '', activityLevel: '', goal: '',
                  allergies: '', mealsPerDay: '3',
                });
                setUploadedFile(null);
              }}
            >
              Create Another Plan
            </Button>
          </Paper>
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
          py: 4,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4 }}>
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Stack direction="row" justifyContent="center" spacing={2} mb={2}>
                <UtensilsIcon sx={{ fontSize: 40, color: '#6366F1' }} />
                <ActivityIcon sx={{ fontSize: 40, color: '#A855F7' }} />
                <HeartIcon sx={{ fontSize: 40, color: '#A855F7' }} />
              </Stack>
              <Typography variant="h4" sx={{ color: 'text.primary', mb: 1 }}>
                Personalized Diet Plan Generator
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Get a customized meal plan based on your health profile and goals
              </Typography>
            </Box>
            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {/* Form */}
            <Box mb={4}>
              {/* Step 0: Basic Info */}
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
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl component="fieldset">
                        <FormLabel component="legend">Gender *</FormLabel>
                        <RadioGroup
                          row
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
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="BMI"
                        value={formData.bmi}
                        disabled
                        fullWidth
                      />
                      {formData.bmi && (
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, color: getBMIColor(formData.bmi) }}
                        >
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
                        <MenuItem key={level.value} value={level.value}>
                          {level.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              )}
              {/* Step 1: Health Details */}
              {activeStep === 1 && (
                <Stack spacing={2}>
                  <Box>
                    <Button
                      variant="outlined"
                      onClick={handleClick}
                      fullWidth
                      sx={{ justifyContent: 'space-between', textTransform: 'none' }}
                    >
                      {formData.diseases.length === 0 ? 'Select diseases...' : `${formData.diseases.length} selected`}
                    </Button>
                    <Popover
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                    >
                      <Box sx={{ maxHeight: 240, overflowY: 'auto', p: 1 }}>
                        {diseases.map(disease => (
                          <MenuItem key={disease} onClick={() => toggleDisease(disease)}>
                            <Checkbox checked={formData.diseases.includes(disease)} />
                            <ListItemText primary={disease} />
                          </MenuItem>
                        ))}
                      </Box>
                    </Popover>
                    {formData.diseases.length > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" mt={2}>
                        {formData.diseases.map(disease => (
                          <Chip
                            key={disease}
                            label={disease}
                            onDelete={() => toggleDisease(disease)}
                            color="primary"
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
                  />
                  <Box>
                    <FormLabel sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CloudUploadIcon />
                      Upload Medical Reports (Optional)
                    </FormLabel>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{
                        py: 4,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        justifyContent: 'center',
                        flexDirection: 'column',
                        height: 'auto',
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, mb: 1 }} />
                      <Typography>Click to upload or drag and drop</Typography>
                      <Typography variant="caption" sx={{ mt: 0.5 }}>
                        PDF, JPG, PNG (Max 10MB)
                      </Typography>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        hidden
                      />
                    </Button>
                    {uploadedFile && (
                      <Box
                        sx={{
                          mt: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          bgcolor: 'background.default',
                          borderRadius: 1,
                        }}
                      >
                        <Typography>{uploadedFile.name}</Typography>
                        <IconButton color="error" onClick={() => setUploadedFile(null)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Stack>
              )}
              {/* Step 2: Diet Preferences */}
              {activeStep === 2 && (
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Diet Preference *</InputLabel>
                        <Select
                          name="dietPreference"
                          value={formData.dietPreference}
                          onChange={handleInputChange}
                          label="Diet Preference *"
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
                      <FormControl fullWidth required>
                        <InputLabel>Goal *</InputLabel>
                        <Select
                          name="goal"
                          value={formData.goal}
                          onChange={handleInputChange}
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
                  <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Summary
                    </Typography>
                    <Stack spacing={1}>
                      <Typography><strong>Name:</strong> {formData.name || 'N/A'}</Typography>
                      <Typography><strong>Age/Gender:</strong> {formData.age || 'N/A'} years, {formData.gender || 'N/A'}</Typography>
                      <Typography><strong>BMI:</strong> {formData.bmi || 'N/A'} ({getBMIStatus(formData.bmi) || 'N/A'})</Typography>
                      <Typography><strong>Diseases:</strong> {formData.diseases.length > 0 ? formData.diseases.join(', ') : 'None'}</Typography>
                      <Typography><strong>Diet Preference:</strong> {formData.dietPreference || 'N/A'}</Typography>
                      <Typography><strong>Goal:</strong> {formData.goal || 'N/A'}</Typography>
                    </Stack>
                  </Paper>
                </Stack>
              )}
            </Box>
            {/* Navigation */}
            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                variant="contained"
                color="secondary"
                disabled={activeStep === 0}
                onClick={() => setActiveStep(prev => prev - 1)}
                startIcon={<ChevronLeftIcon />}
              >
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                >
                  {loading ? 'Submitting...' : 'Generate Diet Plan'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveStep(prev => prev + 1)}
                  endIcon={<ChevronRightIcon />}
                >
                  Next
                </Button>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}