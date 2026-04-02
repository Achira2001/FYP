import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, InputAdornment, IconButton,
  Checkbox, FormControlLabel, Alert, CircularProgress,
  Avatar, Grid, Link, Fade, Slide
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import {
  Visibility, VisibilityOff, Email, Lock,
  LocalHospital, Security, FavoriteRounded, Healing, AdminPanelSettings
} from "@mui/icons-material";


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


// STYLED COMPONENTS 

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
  '@media (max-width:900px)': {
    flexDirection: 'column',
    minHeight: '100dvh',
  },
});

// Left panel 
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
  '@media (max-width:900px)': {
    padding: '40px 20px 28px',
    minHeight: 'auto',
  },
  '@media (max-width:600px)': {
    padding: '32px 16px 24px',
  }
});

// Right panel — DARK 
const RightLoginPanel = styled(Box)({
  flex: '1',
  background: '#111827',
  borderLeft: '1px solid rgba(99,102,241,0.15)',
  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
  padding: '60px 80px', position: 'relative', overflowY: 'auto',
  '&::before': {
    content: '""', position: 'absolute', inset: 0,
    background: `
      radial-gradient(ellipse 70% 50% at 80% 10%, rgba(99,102,241,0.1) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 20% 90%, rgba(16,185,129,0.07) 0%, transparent 60%)
    `,
    pointerEvents: 'none',
  },
  '@media (max-width:900px)': {
    borderLeft: 'none',
    borderTop: '1px solid rgba(99,102,241,0.15)',
    padding: '32px 20px 40px',
    justifyContent: 'flex-start',
  },
  '@media (max-width:600px)': {
    padding: '24px 16px 32px',
  }
});

const LoginFormContainer = styled(Box)({
  width: '100%', maxWidth: '500px', position: 'relative', zIndex: 2,
  '@media (max-width:900px)': {
    maxWidth: '100%',
  }
});

// Left panel branding
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
  '@media (max-width:900px)': {
    width: 110,
    height: 110,
    marginBottom: theme.spacing(2.5),
  },
  '@media (max-width:600px)': {
    width: 92,
    height: 92,
  }
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
  '@media (max-width:900px)': {
    padding: '14px 10px',
    borderRadius: '16px',
  }
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
  '@media (max-width:900px)': {
    display: 'none',
  }
}));

// Dark form inputs
const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(99,102,241,0.2)',
    transition: 'all 0.3s ease',
    '& fieldset': { border: 'none' },
    '&:hover': { border: '1px solid rgba(99,102,241,0.45)', background: 'rgba(15,23,42,0.95)' },
    '&.Mui-focused': {
      border: '1px solid #6366F1', background: 'rgba(15,23,42,0.95)',
      boxShadow: '0 0 0 3px rgba(99,102,241,0.15)',
    },
    '&.Mui-error': {
      border: '1px solid rgba(239,68,68,0.6)',
      '&.Mui-focused': { border: '1px solid #EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.12)' },
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '16px 18px', fontSize: '16px', fontWeight: 500, color: '#F1F5F9',
    '&::placeholder': { color: '#475569', opacity: 1, fontWeight: 400 },
  },
  '& .MuiFormHelperText-root': {
    color: '#EF4444', fontSize: '12px', marginLeft: '4px', marginTop: '4px',
  },
  '@media (max-width:600px)': {
    '& .MuiOutlinedInput-input': {
      padding: '14px 16px',
      fontSize: '15px',
    },
  }
});

const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  borderRadius: '14px', padding: '16px 32px', fontSize: '17px', fontWeight: 700,
  textTransform: 'none', backgroundSize: '300% 300%',
  animation: `${gradientShift} 8s ease-in-out infinite`,
  boxShadow: '0 8px 24px rgba(99,102,241,0.4)', color: '#fff',
  transition: 'all 0.3s ease', width: '100%',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 14px 32px rgba(99,102,241,0.5)' },
  '&.Mui-disabled': {
    opacity: 0.6, transform: 'none', animation: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #4facfe 100%)',
    color: 'rgba(255,255,255,0.5)',
  },
  '@media (max-width:600px)': {
    padding: '14px 24px',
    fontSize: '16px',
  }
});


// VALIDATORS

const validateEmail = (v) => {
  if (!v.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
  return '';
};
const validatePassword = (v) => {
  if (!v) return 'Password is required';
  if (v.length < 6) return 'Password must be at least 6 characters';
  return '';
};


// COMPONENT

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true; script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google) return;
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      callback: handleGoogleSignIn,
    });
    window.google.accounts.id.renderButton(
      document.getElementById('googleSignInButton'),
      { theme: 'filled_black', size: 'large', text: 'continue_with', shape: 'pill', width: window.innerWidth <= 600 ? 280 : 360 }
    );
  };

  const handleGoogleSignIn = async (response) => {
    setGoogleLoading(true); setApiError('');
    try {
      const r = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: response.credential }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || 'Google authentication failed');
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('username', data.user.fullName);
        window.location.href = '/patient';
      }
    } catch (err) {
      setApiError(err.message || 'Google login failed. Please try again.');
    } finally { setGoogleLoading(false); }
  };

  const validate = (name, value) => {
    if (name === 'email') return validateEmail(value);
    if (name === 'password') return validatePassword(value);
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
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
    setTouched({ email: true, password: true });
    const newErrors = { email: validateEmail(form.email), password: validatePassword(form.password) };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true); setApiError('');
    try {
      const r = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.toLowerCase().trim(), password: form.password }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || `Server error: ${r.status}`);
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('username', data.user.fullName);
        const routes = { admin: '/admin', patient: '/patient', doctor: '/doctor' };
        window.location.href = routes[data.user.role] || '/dashboard';
      } else if (data.emailVerificationRequired) {
        localStorage.setItem('pendingEmail', data.email);
        window.location.href = `/verify-otp?email=${encodeURIComponent(data.email)}`;
      }
    } catch (err) {
      setApiError(err.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <FullScreenBackground />

      {/* Original floating particles */}
      <Box sx={{ '@media (max-width:900px)': { display: 'none' } }}>
        <FloatingParticle size="80px"  delay={0} duration={10} opacity={0.08} left="5%"  top="15%" />
        <FloatingParticle size="60px"  delay={2} duration={8}  opacity={0.12} left="90%" top="25%" />
        <FloatingParticle size="100px" delay={4} duration={12} opacity={0.06} left="85%" top="70%" />
        <FloatingParticle size="70px"  delay={1} duration={9}  opacity={0.1}  left="10%" top="75%" />
        <FloatingParticle size="90px"  delay={3} duration={11} opacity={0.08} left="15%" top="45%" />
        <FloatingParticle size="55px"  delay={5} duration={7}  opacity={0.15} left="75%" top="50%" />
      </Box>

      <SplitScreenContainer>

        {/*  LEFT PANEL */}
        <LeftBrandingPanel>
          <FloatingMedicalIcon delay={0} size="120px" left="10%" top="20%" color="rgba(255,255,255,0.08)">
            <Healing />
          </FloatingMedicalIcon>
          <FloatingMedicalIcon delay={2} size="100px" left="80%" top="15%" color="rgba(255,255,255,0.06)">
            <LocalHospital />
          </FloatingMedicalIcon>
          <FloatingMedicalIcon delay={4} size="90px"  left="85%" top="75%" color="rgba(255,255,255,0.10)">
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

              <BrandingSubtitle variant="h5" sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.4rem' }, mb: { xs: 4, md: 6 }, lineHeight: 1.5, textAlign: { xs: 'left', md: 'center' }, maxWidth: '400px', mx: { xs: 0, md: 'auto' }}}>
                Your comprehensive healthcare management platform.
                Connecting patients, doctors, and administrators in one secure ecosystem.
              </BrandingSubtitle>

              <Grid container spacing={{ xs: 1.5, md: 3 }} justifyContent="center" sx={{ mt: { xs: 0, md: 4 } }}>
                {[
                  { color: '#e91e63', Icon: FavoriteRounded,    label: 'Patient Portal' },
                  { color: '#2196f3', Icon: LocalHospital,      label: 'Doctor Dashboard' },
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

        {/* RIGHT PANEL — dark theme */}
        <RightLoginPanel>
          <Fade in timeout={1500}>
            <LoginFormContainer sx={{ animation: `${slideInRight} 1.2s ease-out` }}>

              <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
                <Typography sx={{
                  fontWeight: 800, mb: 1.5, fontSize: { xs: '2rem', sm: '2.5rem', md: '3.2rem' }, letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #F1F5F9 0%, #A5B4FC 50%, #C084FC 100%)',
                  backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent',
                }}>
                  Welcome Back
                </Typography>
                <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
                  Sign in to access your healthcare dashboard
                </Typography>
              </Box>

              {/* API error */}
              {apiError && (
                <Slide direction="down" in mountOnEnter unmountOnExit>
                  <Alert severity="error" sx={{
                    mb: 3, borderRadius: '12px',
                    bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#FCA5A5', '& .MuiAlert-icon': { color: '#EF4444' },
                  }}>{apiError}</Alert>
                </Slide>
              )}

              {/* Google login */}
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Box id="googleSignInButton" sx={{
                  display: 'flex', justifyContent: 'center', mb: 1.5,
                  '& iframe': { width: '100% !important', maxWidth: { xs: '280px', sm: '360px', md: '400px' } }
                }} />
                {googleLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 1 }}>
                    <CircularProgress size={18} sx={{ color: '#6366F1' }} />
                    <Typography sx={{ color: '#64748B', fontSize: '13px' }}>Signing in with Google…</Typography>
                  </Box>
                )}
                <Typography sx={{ mt: 1, color: '#475569', fontSize: '14px' }}>
                  Only available for patients
                </Typography>
              </Box>

              {/* Divider */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(99,102,241,0.2)' }} />
                <Typography sx={{ color: '#475569', fontSize: { xs: '12px', md: '13px' }, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  or sign in with email
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(99,102,241,0.2)' }} />
              </Box>

              <Box component="form" onSubmit={handleSubmit} noValidate>

                {/* Email */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ mb: 1.5, fontWeight: 700, color: '#94A3B8', fontSize: { xs: '15px', md: '16px' }, letterSpacing: '0.3px' }}>
                    Email Address
                  </Typography>
                  <StyledTextField
                    fullWidth name="email" type="email"
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={handleChange} onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: errors.email && touched.email ? '#EF4444' : '#667eea', fontSize: { xs: 22, md: 24 } }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Password */}
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ mb: 1.5, fontWeight: 700, color: '#94A3B8', fontSize: { xs: '15px', md: '16px' }, letterSpacing: '0.3px' }}>
                    Password
                  </Typography>
                  <StyledTextField
                    fullWidth name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange} onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: errors.password && touched.password ? '#EF4444' : '#4facfe', fontSize: { xs: 22, md: 24 } }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}
                            sx={{ color: '#475569', transition: 'all 0.3s ease',
                              '&:hover': { color: '#667eea', bgcolor: 'rgba(102,126,234,0.1)' } }}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Remember me + Forgot */}
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 0 },
                  mb: 4
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                        sx={{ color: '#475569', '&.Mui-checked': { color: '#4facfe' },
                          '& .MuiSvgIcon-root': { fontSize: 22 } }} />
                    }
                    label={<Typography sx={{ color: '#94A3B8', fontWeight: 500, fontSize: '15px' }}>Remember me</Typography>}
                    sx={{ m: 0 }}
                  />
                  <Link component="button" type="button" variant="body1"
                    onClick={() => window.location.href = '/forgot-password'}
                    sx={{
                      textDecoration: 'none', fontWeight: 600, color: '#667eea', fontSize: '15px',
                      transition: 'all 0.3s ease',
                      '&:hover': { color: '#A855F7', textDecoration: 'none' },
                    }}>
                    Forgot password?
                  </Link>
                </Box>

                {/* Submit */}
                <GradientButton fullWidth type="submit" disabled={loading || googleLoading} sx={{ mb: 5 }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '15px', md: '17px' } }}>Signing you in…</Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '15px', md: '17px' }, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      Sign In Securely
                    </Typography>
                  )}
                </GradientButton>

                {/* Register link */}
                <Box sx={{ pt: 3, borderTop: '1px solid rgba(99,102,241,0.12)', textAlign: 'center' }}>
                  <Typography sx={{ color: '#64748B', mb: 2.5, fontSize: { xs: '15px', md: '16px' } }}>
                    New to Smart Health Assistant?
                  </Typography>
                  <Link component="button" type="button"
                    onClick={() => window.location.href = '/register'}
                    sx={{
                      color: '#667eea', fontWeight: 700, textDecoration: 'none', fontSize: { xs: '15px', md: '17px' },
                      padding: { xs: '10px 16px', md: '10px 22px' }, borderRadius: '14px', border: '1px solid rgba(99,102,241,0.35)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.7)',
                        color: '#A855F7', textDecoration: 'none', transform: 'translateY(-1px)',
                      },
                    }}>
                    Create your account here 
                  </Link>
                </Box>
              </Box>
            </LoginFormContainer>
          </Fade>
        </RightLoginPanel>
      </SplitScreenContainer>
    </>
  );
}