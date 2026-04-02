import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, InputAdornment, IconButton,
  Alert, CircularProgress, Avatar, Grid, ToggleButtonGroup, ToggleButton,
  Fade, Slide, Link
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Person, Email, Lock, Phone, LocationOn, MedicalServices,
  Favorite, Security, Visibility, VisibilityOff, CalendarToday,
  FavoriteRounded, Healing, LocalHospital, AdminPanelSettings
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


// KEYFRAMES 
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(120deg); }
  66% { transform: translateY(10px) rotate(240deg); }
`;
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
`;
const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-100px) scale(0.9); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
`;
const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(100px) scale(0.9); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
`;
const gradientShift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const rotateGlow = keyframes`
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
const backgroundMove = keyframes`
  0%, 100% { transform: translateX(0) translateY(0); }
  25%  { transform: translateX(-20px) translateY(-10px); }
  50%  { transform: translateX(10px) translateY(-20px); }
  75%  { transform: translateX(-5px) translateY(10px); }
`;
const particleFloat = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.3; }
  25%  { transform: translateY(-30px) translateX(20px) rotate(90deg); opacity: 0.7; }
  50%  { transform: translateY(-10px) translateX(-15px) rotate(180deg); opacity: 0.4; }
  75%  { transform: translateY(20px) translateX(10px) rotate(270deg); opacity: 0.8; }
`;


const FullScreenBackground = styled(Box)({
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -3,
  background: `
    linear-gradient(135deg,
      #667eea 0%, #764ba2 15%, #f093fb 30%, #f5576c 45%,
      #4facfe 60%, #00f2fe 75%, #667eea 100%
    ),
    url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20zm0-40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
  `,
  backgroundSize: '500% 500%, 80px 80px',
  animation: `${gradientShift} 20s ease infinite, ${backgroundMove} 25s ease infinite`,
  '&::before': {
    content: '""', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: `
      radial-gradient(ellipse at 10% 20%, rgba(120,119,198,0.3) 0%, transparent 60%),
      radial-gradient(ellipse at 90% 80%, rgba(255,119,198,0.4) 0%, transparent 60%),
      radial-gradient(ellipse at 30% 70%, rgba(120,219,226,0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 30%, rgba(255,181,197,0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(102,126,234,0.2) 0%, transparent 70%)
    `,
    animation: `${float} 15s ease-in-out infinite`,
  },
  '&::after': {
    content: '""', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.03)',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M60 40c11.046 0 20-8.954 20-20S71.046 0 60 0 40 8.954 40 20s8.954 20 20 20zm0 80c11.046 0 20-8.954 20-20s-8.954-20-20-20-20 8.954-20 20 8.954 20 20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
  }
});

const SplitScreenContainer = styled(Box)({
  display: 'flex', minHeight: '100vh', width: '100vw', position: 'relative',
  overflow: 'hidden',
  '@media (max-width: 900px)': {
    flexDirection: 'column',
    minHeight: '100dvh',
    overflow: 'visible',
  },
});

const LeftBrandingPanel = styled(Box)({
  flex: '1',
  background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
  backdropFilter: 'blur(20px)',
  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
  padding: '80px 60px', position: 'relative', overflow: 'hidden',
  '&::before': {
    content: '""', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: `
      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(255,255,255,0.08) 0%, transparent 50%)
    `,
    animation: `${float} 12s ease-in-out infinite`,
  },
  '@media (max-width: 900px)': {
    padding: '34px 20px 24px',
    minHeight: 'auto',
  },
  '@media (max-width: 600px)': {
    padding: '28px 16px 20px',
  },
});

// RIGHT PANEL 
const RightRegisterPanel = styled(Box)({
  flex: '1',
  background: '#111827',
  borderLeft: '1px solid rgba(99,102,241,0.15)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '16px 24px',
  position: 'relative',
  overflowY: 'auto',
  minHeight: '100vh',
  boxSizing: 'border-box',
  '@media (max-width: 900px)': {
    borderLeft: 'none',
    borderTop: '1px solid rgba(99,102,241,0.15)',
    padding: '20px 16px 40px',
    minHeight: '100dvh',
    width: '100%',
  },
});

// FORM CONTAINER 
const RegisterFormContainer = styled(Box)({
  width: '100%',
  maxWidth: '600px',
  boxSizing: 'border-box',
  '@media (max-width: 900px)': {
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box',
  },
});

const BrandingAvatar = styled(Avatar)(({ theme }) => ({
  width: 180, height: 180,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  margin: '0 auto', marginBottom: theme.spacing(4),
  boxShadow: `0 30px 60px rgba(0,0,0,0.4), 0 0 0 12px rgba(255,255,255,0.15), 0 0 0 24px rgba(255,255,255,0.08)`,
  animation: `${pulse} 4s ease-in-out infinite`,
  position: 'relative', zIndex: 2,
  '&::before': {
    content: '""', position: 'absolute', top: -12, left: -12, right: -12, bottom: -12,
    background: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe)',
    borderRadius: '50%', zIndex: -1,
    animation: `${rotateGlow} 8s linear infinite`, backgroundSize: '300% 300%',
  },
  '@media (max-width: 900px)': { width: 110, height: 110, marginBottom: theme.spacing(2.5) },
  '@media (max-width: 600px)': { width: 92, height: 92 },
}));

const BrandingTitle = styled(Typography)({
  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%)',
  backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent',
  fontWeight: 900, letterSpacing: '-0.02em', textAlign: 'center',
  textShadow: '0 8px 16px rgba(0,0,0,0.3)', position: 'relative', zIndex: 2, marginBottom: '24px',
});

const BrandingSubtitle = styled(Typography)({
  color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontWeight: 400,
  letterSpacing: '0.5px', lineHeight: 1.6, position: 'relative', zIndex: 2, maxWidth: '400px',
});

const DesktopRoleCard = styled(Box)(({ rolecolor }) => ({
  padding: '20px 16px', borderRadius: '20px', textAlign: 'center',
  background: `linear-gradient(145deg, ${rolecolor}12 0%, ${rolecolor}06 50%, ${rolecolor}12 100%)`,
  border: `2px solid ${rolecolor}25`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(15px)',
  '&:hover': { transform: 'translateY(-8px) scale(1.05)', boxShadow: `0 20px 40px ${rolecolor}30` },
  '@media (max-width: 900px)': { padding: '14px 10px', borderRadius: '16px' },
}));

const FloatingParticle = styled(Box)(({ size, delay, duration, opacity, left, top }) => ({
  position: 'absolute', width: size, height: size, borderRadius: '50%',
  background: `radial-gradient(circle, rgba(255,255,255,${opacity}) 0%, transparent 70%)`,
  left, top, zIndex: -1,
  animation: `${particleFloat} ${duration}s ease-in-out ${delay}s infinite`,
  '&::before': {
    content: '""', position: 'absolute', top: '20%', left: '20%', width: '60%', height: '60%',
    background: `rgba(255,255,255,${opacity * 2})`, borderRadius: '50%',
    animation: `${pulse} 3s ease-in-out infinite`,
  }
}));

const FloatingMedicalIcon = styled(Box)(({ delay, size, left, top, color }) => ({
  position: 'absolute', fontSize: size, color, left, top, zIndex: 1,
  animation: `${particleFloat} ${8 + delay}s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  '@media (max-width: 900px)': { display: 'none' },
}));

// StyledTextField 
const StyledTextField = styled(TextField)({
  width: '100% !important',
  display: 'block',
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(99,102,241,0.2)',
    transition: 'all 0.3s ease',
    minHeight: '56px',
    width: '100%',
    boxSizing: 'border-box',
    '& fieldset': { border: 'none' },
    '&:hover': {
      border: '1px solid rgba(99,102,241,0.45)',
      background: 'rgba(15,23,42,0.95)'
    },
    '&.Mui-focused': {
      border: '1px solid #6366F1',
      background: 'rgba(15,23,42,0.95)',
      boxShadow: '0 0 0 3px rgba(99,102,241,0.15)',
    },
  },
  '& .MuiInputBase-root': {
    width: '100%',
  },
  '& .MuiOutlinedInput-input': {
    padding: '16px 14px',
    fontSize: '15px',
    fontWeight: 500,
    color: '#F1F5F9',
    boxSizing: 'border-box',
    '&::placeholder': { color: '#475569', opacity: 1, fontWeight: 400 },
  },
  '& .MuiFormHelperText-root': {
    color: '#EF4444',
    fontSize: '12px',
    marginLeft: '4px',
    marginTop: '4px',
  },
  '@media (max-width: 900px)': {
    width: '100% !important',
    '& .MuiOutlinedInput-root': {
      minHeight: '54px',
      width: '100%',
      borderRadius: '12px',
    },
    '& .MuiOutlinedInput-input': {
      padding: '15px 14px',
      fontSize: '15px',
    },
  },
});

const GradientButton = styled(Button)(({ rolecolor }) => ({
  background: rolecolor || 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  borderRadius: '14px', padding: '16px 32px', fontSize: '16px', fontWeight: 700,
  textTransform: 'none', backgroundSize: '300% 300%',
  animation: `${gradientShift} 8s ease-in-out infinite`,
  boxShadow: '0 8px 24px rgba(99,102,241,0.35)', color: '#fff',
  transition: 'all 0.3s ease', width: '100%',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 14px 32px rgba(99,102,241,0.5)' },
  '&.Mui-disabled': {
    opacity: 0.6, transform: 'none', animation: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #4facfe 100%)',
    color: 'rgba(255,255,255,0.5)',
  },
  '@media (max-width: 600px)': { padding: '14px 20px', fontSize: '15px' },
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)({
  borderRadius: '14px', overflow: 'hidden',
  border: '1px solid rgba(99,102,241,0.25)',
  background: 'rgba(15,23,42,0.6)', width: '100%',
  '& .MuiToggleButtonGroup-grouped': { border: 'none', borderRadius: 0 },
});


// ROLE CONFIGS

const roleConfig = {
  patient: {
    icon: Favorite, solidColor: '#e91e63',
    gradient: 'linear-gradient(135deg, #e91e63 0%, #ad1457 50%, #880e4f 100%)',
    fields: [
      { name: 'fullName', label: 'Full Name', type: 'text', icon: Person, placeholder: 'Enter your full name' },
      { name: 'email', label: 'Email', type: 'email', icon: Email, placeholder: 'Enter your email address' },
      { name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'Create a secure password' },
      { name: 'phone', label: 'Phone', type: 'tel', icon: Phone, placeholder: 'Enter your phone number' },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', icon: CalendarToday, placeholder: '' },
      { name: 'address', label: 'Address', type: 'text', icon: LocationOn, placeholder: 'Enter your address' },
      { name: 'emergencyContact', label: 'Emergency Contact', type: 'tel', icon: Phone, placeholder: 'Emergency contact number' },
    ]
  },
  doctor: {
    icon: MedicalServices, solidColor: '#2196f3',
    gradient: 'linear-gradient(135deg, #2196f3 0%, #1565c0 50%, #0d47a1 100%)',
    fields: [
      { name: 'fullName', label: 'Full Name', type: 'text', icon: Person, placeholder: 'Enter your full name' },
      { name: 'email', label: 'Email', type: 'email', icon: Email, placeholder: 'Enter your email address' },
      { name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'Create a secure password' },
      { name: 'phone', label: 'Phone', type: 'tel', icon: Phone, placeholder: 'Enter your phone number' },
      { name: 'medicalLicense', label: 'Medical License', type: 'text', icon: MedicalServices, placeholder: 'Enter your medical license number' },
      { name: 'specialization', label: 'Specialization', type: 'text', icon: MedicalServices, placeholder: 'Enter your specialization' },
      { name: 'workplace', label: 'Hospital/Clinic', type: 'text', icon: LocationOn, placeholder: 'Enter your workplace' },
    ]
  },
  admin: {
    icon: Security, solidColor: '#9c27b0',
    gradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 50%, #4a148c 100%)',
    fields: [
      { name: 'fullName', label: 'Full Name', type: 'text', icon: Person, placeholder: 'Enter your full name' },
      { name: 'email', label: 'Email', type: 'email', icon: Email, placeholder: 'Enter your email address' },
      { name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'Create a secure password' },
      { name: 'phone', label: 'Phone', type: 'tel', icon: Phone, placeholder: 'Enter your phone number' },
      { name: 'adminCode', label: 'Admin Code', type: 'text', icon: Security, placeholder: 'Enter admin verification code' },
    ]
  }
};


// VALIDATORS

const VALIDATORS = {
  fullName(v) {
    if (!v.trim()) return 'Full name is required';
    if (v.trim().length < 2) return 'Must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(v)) return 'Only letters and spaces allowed';
    return '';
  },
  email(v) {
    if (!v.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
    return '';
  },
  password(v) {
    if (!v) return 'Password is required';
    if (v.length < 6) return 'Must be at least 6 characters';
    if (!/(?=.*[a-z])/.test(v)) return 'Must include a lowercase letter';
    if (!/(?=.*[A-Z])/.test(v)) return 'Must include an uppercase letter';
    if (!/(?=.*\d)/.test(v)) return 'Must include a number';
    return '';
  },
  phone(v) {
    const value = v.replace(/\s/g, '');
    if (!value) return 'Phone number is required';
    if (!/^(?:\+94|94|0)?7\d{8}$/.test(value)) return 'Enter a valid phone number (eg: +94712345678)';
    return '';
  },
  dateOfBirth(v) {
    if (!v) return 'Date of birth is required';
    const age = (Date.now() - new Date(v)) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 0 || age > 150) return 'Enter a valid date of birth';
    return '';
  },
  address(v) {
    if (!v.trim()) return 'Address is required';
    if (v.trim().length < 10) return 'Must be at least 10 characters';
    return '';
  },
  emergencyContact(v) {
    const value = v.replace(/\s/g, '');
    if (!value) return 'Emergency Contact number is required';
    if (!/^(?:\+94|94|0)?7\d{8}$/.test(value)) return 'Enter a valid phone number (eg: +94712345678)';
    return '';
  },
  medicalLicense(v) {
    if (!v.trim()) return 'Medical license is required';
    if (v.trim().length < 5) return 'Must be at least 5 characters';
    return '';
  },
  specialization(v) { return !v.trim() ? 'Specialization is required' : ''; },
  workplace(v) { return !v.trim() ? 'Workplace is required' : ''; },
  adminCode(v) { return !v.trim() ? 'Admin code is required' : ''; },
};

const validate = (name, value) => VALIDATORS[name] ? VALIDATORS[name](value) : '';


// COMPONENT

export default function HealthRegisterPage() {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const currentConfig = roleConfig[role];

  const handleRoleChange = (_, newRole) => {
    if (!newRole) return;
    setRole(newRole);
    setFormData({}); setErrors({}); setTouched({}); setApiError(''); setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (touched[name]) setErrors(p => ({ ...p, [name]: validate(name, value) }));
    if (apiError) setApiError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setErrors(p => ({ ...p, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = {}, allErrors = {};
    currentConfig.fields.forEach(({ name }) => {
      allTouched[name] = true;
      allErrors[name] = validate(name, formData[name] || '');
    });
    setTouched(allTouched); setErrors(allErrors);
    if (Object.values(allErrors).some(Boolean)) return;

    setLoading(true); setApiError(''); setSuccess('');
    try {
      const body = { ...formData, role, email: formData.email?.toLowerCase().trim() };
      const r = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || `Registration failed: ${r.status}`);
      if (data.success && data.data?.emailVerificationRequired) {
        setSuccess('Registration successful! Please check your email for verification.');
        setTimeout(() => {
          window.location.href = `/verify-otp?email=${encodeURIComponent(formData.email)}`;
        }, 1500);
      } else if (data.success) {
        setSuccess('Registration successful! You can now log in.');
        setTimeout(() => { window.location.href = '/login'; }, 2000);
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <FullScreenBackground />

      <Box sx={{ '@media (max-width: 900px)': { display: 'none' } }}>
        <FloatingParticle size="80px" delay={0} duration={10} opacity={0.08} left="5%" top="15%" />
        <FloatingParticle size="60px" delay={2} duration={8} opacity={0.12} left="90%" top="25%" />
        <FloatingParticle size="100px" delay={4} duration={12} opacity={0.06} left="85%" top="70%" />
        <FloatingParticle size="70px" delay={1} duration={9} opacity={0.1} left="10%" top="75%" />
        <FloatingParticle size="90px" delay={3} duration={11} opacity={0.08} left="15%" top="45%" />
        <FloatingParticle size="55px" delay={5} duration={7} opacity={0.15} left="75%" top="50%" />
      </Box>

      <SplitScreenContainer>

        {/* LEFT PANEL */}
        <LeftBrandingPanel>
          <FloatingMedicalIcon delay={0} size="120px" left="10%" top="20%" color="rgba(255,255,255,0.08)">
            <Healing />
          </FloatingMedicalIcon>
          <FloatingMedicalIcon delay={2} size="100px" left="80%" top="15%" color="rgba(255,255,255,0.06)">
            <LocalHospital />
          </FloatingMedicalIcon>
          <FloatingMedicalIcon delay={4} size="90px" left="85%" top="75%" color="rgba(255,255,255,0.10)">
            <Security />
          </FloatingMedicalIcon>
          <FloatingMedicalIcon delay={1} size="110px" left="15%" top="70%" color="rgba(255,255,255,0.07)">
            <AdminPanelSettings />
          </FloatingMedicalIcon>

          <Fade in timeout={1200}>
            <Box sx={{ animation: `${slideInLeft} 1.2s ease-out`, position: 'relative', zIndex: 2, width: '100%' }}>
              <BrandingAvatar>
                <FavoriteRounded sx={{ fontSize: { xs: 42, sm: 56, md: 80 }, color: 'white' }} />
              </BrandingAvatar>

              <BrandingTitle variant="h1" sx={{ fontSize: { xs: '2rem', sm: '2.8rem', md: '4.5rem' }, mb: { xs: 1, md: 2 } }}>
                Smart Health
              </BrandingTitle>
              <BrandingTitle variant="h2" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }, mb: { xs: 3, md: 4 } }}>
                Assistant
              </BrandingTitle>

              <BrandingSubtitle variant="h5" sx={{
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.4rem' }, mb: { xs: 4, md: 6 },
                lineHeight: 1.5, textAlign: { xs: 'left', md: 'center' }, maxWidth: '400px', mx: { xs: 0, md: 'auto' }
              }}>
                Join our comprehensive healthcare management platform.
                Create your account and connect with our secure medical ecosystem.
              </BrandingSubtitle>

              <Grid container spacing={{ xs: 1.5, md: 3 }} justifyContent="center" sx={{ mt: { xs: 0, md: 4 } }}>
                {[
                  { color: '#e91e63', Icon: FavoriteRounded, label: 'Patient Portal' },
                  { color: '#2196f3', Icon: LocalHospital, label: 'Doctor Dashboard' },
                  { color: '#9c27b0', Icon: AdminPanelSettings, label: 'Admin Control' },
                ].map(({ color, Icon, label }) => (
                  <Grid item xs={4} key={label}>
                    <DesktopRoleCard rolecolor={color}>
                      <Icon sx={{ fontSize: { xs: 24, sm: 28, md: 36 }, color: 'rgba(255,255,255,0.9)', mb: 1, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
                      <Typography sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.95)', fontSize: { xs: '11px', sm: '12px', md: '15px' } }}>
                        {label}
                      </Typography>
                    </DesktopRoleCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade>
        </LeftBrandingPanel>

        {/* RIGHT PANEL — dark */}
        <RightRegisterPanel>
          <Fade in timeout={1500}>
            <RegisterFormContainer sx={{ animation: `${slideInRight} 1.2s ease-out` }}>

              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
                <Typography sx={{
                  fontWeight: 800, mb: 1.5,
                  fontSize: { xs: '2rem', sm: '2.3rem', md: '2.8rem' },
                  letterSpacing: '-0.02em', mt: { xs: 0, md: 2 },
                  background: 'linear-gradient(135deg, #F1F5F9 0%, #A5B4FC 50%, #C084FC 100%)',
                  backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent',
                }}>
                  Join Us Today
                </Typography>
                <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
                  Create your account and access healthcare services
                </Typography>
              </Box>

              {/* Alerts */}
              {apiError && (
                <Slide direction="down" in mountOnEnter unmountOnExit>
                  <Alert severity="error" sx={{
                    mb: 3, borderRadius: '12px',
                    bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#FCA5A5', '& .MuiAlert-icon': { color: '#EF4444' },
                  }}>{apiError}</Alert>
                </Slide>
              )}
              {success && (
                <Slide direction="down" in mountOnEnter unmountOnExit>
                  <Alert severity="success" sx={{
                    mb: 3, borderRadius: '12px',
                    bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                    color: '#6EE7B7', '& .MuiAlert-icon': { color: '#10B981' },
                  }}>{success}</Alert>
                </Slide>
              )}

              {/* Role Selection */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{
                  textAlign: 'center', mb: 2, color: '#94A3B8', fontWeight: 700,
                  fontSize: { xs: '14px', md: '16px' }, letterSpacing: '0.4px'
                }}>
                  I am registering as a:
                </Typography>
                <StyledToggleButtonGroup value={role} exclusive onChange={handleRoleChange} size="large">
                  {Object.entries(roleConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <ToggleButton key={key} value={key} sx={{
                        flex: 1,
                        py: { xs: 1.4, md: 2 },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        color: role === key ? '#fff' : '#64748B',
                        fontSize: { xs: '11px', md: '13px' },
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        transition: 'all 0.25s',
                        background: role === key ? config.gradient : 'transparent',
                        '&.Mui-selected, &.Mui-selected:hover': {
                          background: config.gradient, color: '#fff',
                        },
                        '&:hover': { bgcolor: `${config.solidColor}18`, color: '#F1F5F9' },
                      }}>
                        <Icon sx={{ mb: 0.3, fontSize: { xs: 22, md: 26 }, color: role === key ? 'white' : config.solidColor }} />
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </ToggleButton>
                    );
                  })}
                </StyledToggleButtonGroup>
              </Box>

              {/* Form */}
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  flex: 1,
                  // On desktop: 2-column grid when many fields
                  display: { xs: 'flex', sm: currentConfig.fields.length > 5 ? 'grid' : 'flex' },
                  flexDirection: 'column',
                  gridTemplateColumns: { sm: '1fr 1fr' },
                  gap: { xs: '18px', sm: '20px' },
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {currentConfig.fields.map(({ name, label, type, icon: FieldIcon, placeholder }) => (
                  <Box
                    key={name}
                    sx={{
                      width: '100%',
                      boxSizing: 'border-box',
                      minWidth: 0, // prevents grid blowout
                    }}
                  >
                    <Typography sx={{
                      mb: 1, fontWeight: 700, color: '#94A3B8',
                      fontSize: { xs: '13px', sm: '13.5px' }, letterSpacing: '0.4px'
                    }}>
                      {label}
                    </Typography>

                    <StyledTextField
                      fullWidth
                      name={name}
                      type={type === 'password' && showPassword ? 'text' : type}
                      placeholder={placeholder}
                      value={formData[name] || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched[name] && Boolean(errors[name])}
                      helperText={touched[name] && errors[name]}
                      disabled={loading}
                      InputLabelProps={type === 'date' ? { shrink: true } : undefined}
                      inputProps={type === 'date' ? { max: new Date().toISOString().split('T')[0] } : undefined}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FieldIcon sx={{
                              color: errors[name] && touched[name] ? '#EF4444' : currentConfig.solidColor,
                              fontSize: 20,
                            }} />
                          </InputAdornment>
                        ),
                        ...(type === 'password' && {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                sx={{ color: '#64748B' }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }),
                      }}
                    />
                  </Box>
                ))}

                {/* Submit + Sign In */}
                <Box sx={{
                  gridColumn: { sm: currentConfig.fields.length > 5 ? '1 / -1' : undefined },
                  mt: { xs: 2, sm: 2 },
                  width: '100%',
                }}>
                  <GradientButton
                    fullWidth type="submit" disabled={loading}
                    rolecolor={currentConfig.gradient} sx={{ mb: 3, py: { xs: 1.7, md: 2 } }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                        <CircularProgress size={22} sx={{ color: 'white' }} />
                        <Typography sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '14px', md: '16px' } }}>
                          Creating Account…
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '14px', md: '16px' }, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        Create {role.charAt(0).toUpperCase() + role.slice(1)} Account
                      </Typography>
                    )}
                  </GradientButton>

                  <Box sx={{ pt: 3, borderTop: '1px solid rgba(99,102,241,0.12)', textAlign: 'center' }}>
                    <Typography sx={{ color: '#64748B', mb: 2, fontSize: { xs: '14px', md: '15px' } }}>
                      Already have an account?
                    </Typography>
                    <Link
                      component="button" type="button"
                      onClick={() => window.location.href = '/login'}
                      sx={{
                        color: '#667eea', fontWeight: 700, textDecoration: 'none',
                        fontSize: { xs: '14px', md: '16px' },
                        padding: { xs: '10px 16px', md: '10px 22px' },
                        borderRadius: '14px', border: '1px solid rgba(99,102,241,0.35)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.7)',
                          color: '#A855F7', textDecoration: 'none',
                        },
                      }}>
                      Sign In Here 
                    </Link>
                  </Box>
                </Box>
              </Box>

            </RegisterFormContainer>
          </Fade>
        </RightRegisterPanel>
      </SplitScreenContainer>
    </>
  );
}