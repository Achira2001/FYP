import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Container,
  Avatar,
  Divider,
  Grid,
  Link,
  Fade,
  Zoom,
  Slide
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Favorite,
  LocalHospital,
  Security,
  FavoriteRounded,
  Healing,
  AdminPanelSettings
} from "@mui/icons-material";
import { Google } from "@mui/icons-material";


// Enhanced Keyframe animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(120deg); }
  66% { transform: translateY(10px) rotate(240deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-100px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(100px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const rotateGlow = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const breathe = keyframes`
  0%, 100% { transform: scale(1) translateY(0px); }
  50% { transform: scale(1.02) translateY(-3px); }
`;

const backgroundMove = keyframes`
  0%, 100% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(-20px) translateY(-10px); }
  50% { transform: translateX(10px) translateY(-20px); }
  75% { transform: translateX(-5px) translateY(10px); }
`;

const particleFloat = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.3; }
  25% { transform: translateY(-30px) translateX(20px) rotate(90deg); opacity: 0.7; }
  50% { transform: translateY(-10px) translateX(-15px) rotate(180deg); opacity: 0.4; }
  75% { transform: translateY(20px) translateX(10px) rotate(270deg); opacity: 0.8; }
`;

// Full-screen background
const FullScreenBackground = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: -3,
  background: `
    linear-gradient(135deg, 
      #667eea 0%, 
      #764ba2 15%, 
      #f093fb 30%, 
      #f5576c 45%, 
      #4facfe 60%, 
      #00f2fe 75%, 
      #667eea 100%
    ),
    url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20zm0-40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
  `,
  backgroundSize: '500% 500%, 80px 80px',
  animation: `${gradientShift} 20s ease infinite, ${backgroundMove} 25s ease infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `
      radial-gradient(ellipse at 10% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 60%),
      radial-gradient(ellipse at 90% 80%, rgba(255, 119, 198, 0.4) 0%, transparent 60%),
      radial-gradient(ellipse at 30% 70%, rgba(120, 219, 226, 0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 30%, rgba(255, 181, 197, 0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(102, 126, 234, 0.2) 0%, transparent 70%)
    `,
    animation: `${float} 15s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.03)',
    backgroundImage: `
      url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M60 40c11.046 0 20-8.954 20-20S71.046 0 60 0 40 8.954 40 20s8.954 20 20 20zm0 80c11.046 0 20-8.954 20-20s-8.954-20-20-20-20 8.954-20 20 8.954 20 20 20z'/%3E%3C/g%3E%3C/svg%3E")
    `,
  }
});

// Split screen container
const SplitScreenContainer = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
  width: '100vw',
  position: 'relative',
});

// Left side - Branding and info
const LeftBrandingPanel = styled(Box)({
  flex: '1',
  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%)',
  backdropFilter: 'blur(20px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '80px 60px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)
    `,
    animation: `${float} 12s ease-in-out infinite`,
  }
});

// Right side - Login form
const RightLoginPanel = styled(Box)({
  flex: '1',
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 250, 0.95) 100%)',
  backdropFilter: 'blur(30px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '60px 80px', // Increased horizontal padding
  position: 'relative',
  boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `
      radial-gradient(circle at 80% 20%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 20% 80%, rgba(79, 172, 254, 0.05) 0%, transparent 50%)
    `,
    animation: `${backgroundMove} 20s ease-in-out infinite`,
  }
});

// Enhanced login form container - INCREASED SIZE
const LoginFormContainer = styled(Box)({
  width: '100%',
  maxWidth: '650px', // Increased from 480px to 650px
  position: 'relative',
  zIndex: 2,
});

// Large branding elements for left panel
const BrandingAvatar = styled(Avatar)(({ theme }) => ({
  width: 180,
  height: 180,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  margin: '0 auto',
  marginBottom: theme.spacing(4),
  boxShadow: `
    0 30px 60px rgba(0, 0, 0, 0.4), 
    0 0 0 12px rgba(255, 255, 255, 0.15),
    0 0 0 24px rgba(255, 255, 255, 0.08)
  `,
  animation: `${pulse} 4s ease-in-out infinite`,
  position: 'relative',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    background: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe)',
    borderRadius: '50%',
    zIndex: -1,
    animation: `${rotateGlow} 8s linear infinite`,
    backgroundSize: '300% 300%',
  },
}));

const BrandingTitle = styled(Typography)({
  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  fontWeight: 900,
  letterSpacing: '-0.02em',
  textAlign: 'center',
  textShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  zIndex: 2,
  marginBottom: '24px',
});

const BrandingSubtitle = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.9)',
  textAlign: 'center',
  fontWeight: 400,
  letterSpacing: '0.5px',
  lineHeight: 1.6,
  position: 'relative',
  zIndex: 2,
  maxWidth: '400px',
});

// Enhanced form elements - INCREASED SIZES
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '18px', // Increased from 16px
    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 250, 0.95) 100%)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '2px solid transparent',
    backgroundClip: 'padding-box',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)', // Increased shadow
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: '18px',
      padding: '2px',
      background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #4facfe)',
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'subtract',
      maskComposite: 'subtract',
      zIndex: -1,
      opacity: 0,
      transition: 'opacity 0.4s ease',
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 35px rgba(0, 0, 0, 0.18)', // Increased shadow
      '&::before': {
        opacity: 0.3,
      },
      '& fieldset': {
        borderColor: 'transparent',
      },
    },
    '&.Mui-focused': {
      transform: 'translateY(-2px)',
      boxShadow: '0 15px 45px rgba(102, 126, 234, 0.3)', // Increased shadow
      '&::before': {
        opacity: 1,
        animation: `${gradientShift} 3s ease infinite`,
      },
      '& fieldset': {
        borderWidth: 0,
        borderColor: 'transparent',
      },
    },
    '& fieldset': {
      borderWidth: 0,
      borderColor: 'transparent',
    },
  },
  '& .MuiInputBase-input': {
    padding: '24px 22px', // Increased from 20px 18px
    fontSize: '18px', // Increased from 16px
    fontWeight: 500,
    color: '#2c3e50',
    zIndex: 2,
    position: 'relative',
    '&::placeholder': {
      color: '#95a5a6',
      opacity: 1,
      fontWeight: 400,
    },
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  borderRadius: '18px', // Increased from 16px
  padding: '22px 40px', // Increased from 18px 32px
  fontSize: '19px', // Increased from 17px
  fontWeight: 700,
  textTransform: 'none',
  boxShadow: `
    0 18px 36px rgba(0, 0, 0, 0.22), 
    0 8px 18px rgba(0, 0, 0, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.3)
  `,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  backgroundSize: '300% 300%',
  animation: `${gradientShift} 8s ease-in-out infinite`,
  width: '100%',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
    opacity: 0,
    transition: 'opacity 0.4s ease',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
    transition: 'all 0.4s ease',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `
      0 28px 56px rgba(0, 0, 0, 0.28), 
      0 14px 28px rgba(0, 0, 0, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.4)
    `,
    '&::before': {
      opacity: 1,
    },
    '&::after': {
      width: '300px',
      height: '300px',
    },
  },
  '&:active': {
    transform: 'translateY(-1px)',
  },
  '&:disabled': {
    opacity: 0.7,
    transform: 'none',
    animation: 'none',
  },
}));

// Floating particles
const FloatingParticle = styled(Box)(({ size = 60, delay = 0, duration = 8, opacity = 0.1, left = '10%', top = '20%' }) => ({
  position: 'absolute',
  width: size,
  height: size,
  background: `radial-gradient(circle, rgba(255, 255, 255, ${opacity}) 0%, transparent 70%)`,
  borderRadius: '50%',
  left: left,
  top: top,
  animation: `${particleFloat} ${duration}s ease-in-out ${delay}s infinite`,
  zIndex: -1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: '60%',
    height: '60%',
    background: `rgba(255, 255, 255, ${opacity * 2})`,
    borderRadius: '50%',
    animation: `${pulse} 3s ease-in-out infinite`,
  }
}));

// Medical themed icons for decoration
const FloatingMedicalIcon = styled(Box)(({ delay = 0, size = 100, left = '10%', top = '20%', color = 'rgba(255, 255, 255, 0.1)' }) => ({
  position: 'absolute',
  fontSize: size,
  color: color,
  left: left,
  top: top,
  animation: `${particleFloat} ${8 + delay}s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  zIndex: 1,
}));

// Role card for desktop
const DesktopRoleCard = styled(Paper)(({ theme, rolecolor }) => ({
  padding: theme.spacing(2.5, 2),
  borderRadius: '20px',
  textAlign: 'center',
  background: `linear-gradient(145deg, ${rolecolor}12 0%, ${rolecolor}06 50%, ${rolecolor}12 100%)`,
  border: `2px solid ${rolecolor}25`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  backdropFilter: 'blur(15px)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    background: `radial-gradient(circle, ${rolecolor}20 0%, transparent 70%)`,
    transition: 'all 0.5s ease',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.05)',
    boxShadow: `0 20px 40px ${rolecolor}30`,
    '&::before': {
      width: '300px',
      height: '300px',
    },
  },
}));

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '207703168281-pmgpo1jqjp0bb6g44dl14bies185shum.apps.googleusercontent.com',
        callback: handleGoogleSignIn,
      });
      
      // Render Google Sign-In button
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { 
          theme: "outline", 
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 400 // Use number instead of percentage
        }
      );
    }
  };

  // Handle Google Sign-In response
  const handleGoogleSignIn = async (response) => {
    setGoogleLoading(true);
    setError("");

    try {
      const loginResponse = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenId: response.credential }),
      });

      const data = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(data.message || 'Google authentication failed');
      }

      if (data.success) {
        // Store user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('username', data.user.fullName);

        // Redirect to patient dashboard
        window.location.href = "/patient";
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || "Google login failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      if (data.success) {
        // Store user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('username', data.user.fullName);

        // Redirect based on role
        switch (data.user.role) {
          case "admin":
            window.location.href = "/admin";
            break;
          case "patient":
            window.location.href = "/patient";
            break;
          case "doctor":
            window.location.href = "/doctor";
            break;
          default:
            window.location.href = "/dashboard";
        }
      } else if (data.emailVerificationRequired) {
        localStorage.setItem('pendingEmail', data.email);
        window.location.href = `/verify-otp?email=${encodeURIComponent(data.email)}`;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FullScreenBackground />
      
      {/* Floating decorative particles */}
      <FloatingParticle size={80} delay={0} duration={10} opacity={0.08} left="5%" top="15%" />
      <FloatingParticle size={60} delay={2} duration={8} opacity={0.12} left="90%" top="25%" />
      <FloatingParticle size={100} delay={4} duration={12} opacity={0.06} left="85%" top="70%" />
      <FloatingParticle size={70} delay={1} duration={9} opacity={0.1} left="10%" top="75%" />
      <FloatingParticle size={90} delay={3} duration={11} opacity={0.08} left="15%" top="45%" />
      <FloatingParticle size={55} delay={5} duration={7} opacity={0.15} left="75%" top="50%" />

      <SplitScreenContainer>
        {/* Left Panel - Branding */}
        <LeftBrandingPanel>
          <FloatingMedicalIcon delay={0} size={120} left="10%" top="20%" color="rgba(255, 255, 255, 0.08)">
            <Healing />
          </FloatingMedicalIcon>
          <FloatingMedicalIcon delay={2} size={100} left="80%" top="15%" color="rgba(255, 255, 255, 0.06)">
            <LocalHospital />
          </FloatingMedicalIcon>
          <FloatingMedicalIcon delay={4} size={90} left="85%" top="75%" color="rgba(255, 255, 255, 0.1)">
            <Security />
          </FloatingMedicalIcon>
          <FloatingMedicalIcon delay={1} size={110} left="15%" top="70%" color="rgba(255, 255, 255, 0.07)">
            <AdminPanelSettings />
          </FloatingMedicalIcon>

          <Fade in={true} timeout={1200}>
            <Box sx={{ animation: `${slideInLeft} 1.2s ease-out` }}>
              <BrandingAvatar>
                <FavoriteRounded sx={{ fontSize: 80, color: 'white' }} />
              </BrandingAvatar>
              
              <BrandingTitle variant="h1" sx={{ fontSize: '4.5rem', mb: 2 }}>
                Smart Health
              </BrandingTitle>
              
              <BrandingTitle variant="h2" sx={{ fontSize: '3rem', mb: 4 }}>
                Assistant
              </BrandingTitle>
              
              <BrandingSubtitle variant="h5" sx={{ fontSize: '1.4rem', mb: 6, lineHeight: 1.5 }}>
                Your comprehensive healthcare management platform.
                Connecting patients, doctors, and administrators in one secure ecosystem.
              </BrandingSubtitle>

              {/* Enhanced Role Display */}
              <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
  <Grid size={{ xs: 12, sm: 4 }}>
    <DesktopRoleCard elevation={8} rolecolor="#e91e63">
      <FavoriteRounded sx={{ 
        fontSize: 36, 
        color: 'rgba(255, 255, 255, 0.9)', 
        mb: 1,
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
      }} />
      <Typography variant="body1" sx={{ 
        fontWeight: 700, 
        color: 'rgba(255, 255, 255, 0.95)',
        fontSize: '15px'
      }}>
        Patient Portal
      </Typography>
    </DesktopRoleCard>
  </Grid>
  <Grid size={{ xs: 12, sm: 4 }}>
    <DesktopRoleCard elevation={8} rolecolor="#2196f3">
      <LocalHospital sx={{ 
        fontSize: 36, 
        color: 'rgba(255, 255, 255, 0.9)', 
        mb: 1,
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
      }} />
      <Typography variant="body1" sx={{ 
        fontWeight: 700, 
        color: 'rgba(255, 255, 255, 0.95)',
        fontSize: '15px'
      }}>
        Doctor Dashboard
      </Typography>
    </DesktopRoleCard>
  </Grid>
  <Grid size={{ xs: 12, sm: 4 }}>
    <DesktopRoleCard elevation={8} rolecolor="#9c27b0">
      <AdminPanelSettings sx={{ 
        fontSize: 36, 
        color: 'rgba(255, 255, 255, 0.9)', 
        mb: 1,
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
      }} />
      <Typography variant="body1" sx={{ 
        fontWeight: 700, 
        color: 'rgba(255, 255, 255, 0.95)',
        fontSize: '15px'
      }}>
        Admin Control
      </Typography>
    </DesktopRoleCard>
  </Grid>
</Grid>
            </Box>
          </Fade>
        </LeftBrandingPanel>

        {/* Right Panel - Login Form */}
        <RightLoginPanel>
          <Fade in={true} timeout={1500}>
            <LoginFormContainer sx={{ animation: `${slideInRight} 1.2s ease-out` }}>
              {/* Form Header */}
              <Box sx={{ textAlign: 'center', mb: 7 }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #667eea 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 3,
                  fontSize: '3.2rem' // Increased from 2.8rem
                }}>
                  Welcome Back
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: '#7f8c8d',
                  fontWeight: 500,
                  fontSize: '1.3rem' // Increased from 1.1rem
                }}>
                  Sign in to access your healthcare dashboard
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Slide direction="down" in={true} mountOnEnter unmountOnExit>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 5, 
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)',
                      border: '2px solid #f8bbd9',
                      boxShadow: '0 10px 24px rgba(211, 47, 47, 0.25)', // Increased shadow
                      fontSize: '16px', // Increased font size
                      '& .MuiAlert-icon': {
                        color: '#d32f2f',
                        fontSize: '26px' // Increased icon size
                      },
                      '& .MuiAlert-message': {
                        fontWeight: 600,
                        fontSize: '16px'
                      }
                    }}
                  >
                    {error}
                  </Alert>
                </Slide>
              )}


               {/* Google Login Button - Simplified */}
            <Box sx={{ mb: 5, textAlign: 'center' }}>
              <Box 
                id="googleSignInButton" 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  mb: 2,
                  '& iframe': {
                    width: '100% !important',
                    maxWidth: '400px'
                  }
                }} 
              />
              
              {googleLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress size={24} />
                  <Typography sx={{ ml: 2 }}>Signing in with Google...</Typography>
                </Box>
              )}
              
              <Typography variant="body2" sx={{ 
                mt: 2, 
                color: '#7f8c8d',
                fontSize: '14px'
              }}>
                Only available for patients
              </Typography>
            </Box>

            {/* Divider between Google and regular login */}
            <Box sx={{ 
              position: 'relative',
              margin: '30px 0',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, #e0e0e0, transparent)',
              },
              '&::after': {
                content: '"or"',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'white',
                padding: '0 15px',
                color: '#95a5a6',
                fontSize: '14px',
                fontWeight: 500
              }
            }} />


              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <Box sx={{ mb: 5 }}> {/* Increased margin */}
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: 3, // Increased margin
                      fontWeight: 700, 
                      color: '#2c3e50',
                      fontSize: '18px', // Increased from 16px
                      letterSpacing: '0.3px'
                    }}
                  >
                    Email Address
                  </Typography>
                  <StyledTextField
                    fullWidth
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ 
                            color: '#667eea', 
                            fontSize: 26, // Increased from 22
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                          }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ mb: 5 }}> {/* Increased margin */}
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: 3, // Increased margin
                      fontWeight: 700, 
                      color: '#2c3e50',
                      fontSize: '18px', // Increased from 16px
                      letterSpacing: '0.3px'
                    }}
                  >
                    Password
                  </Typography>
                  <StyledTextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ 
                            color: '#4facfe', 
                            fontSize: 26, // Increased from 22
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                          }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ 
                              color: '#666',
                              fontSize: '24px', // Increased size
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                color: '#667eea',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Remember Me & Forgot Password */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 6 // Increased margin
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{ 
                          '& .MuiSvgIcon-root': { 
                            fontSize: 26, // Increased from 22
                            borderRadius: '6px'
                          },
                          '&.Mui-checked': {
                            color: '#4facfe'
                          },
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    }
                    label={
                      <Typography variant="body1" sx={{ 
                        color: '#2c3e50', 
                        fontWeight: 500,
                        fontSize: '17px' // Increased from 15px
                      }}>
                        Remember me
                      </Typography>
                    }
                  />
                  <Link
                    component="button"
                    type="button"
                    variant="body1"
                    onClick={() => window.location.href = '/forgot-password'}
                    sx={{ 
                      textDecoration: 'none',
                      fontWeight: 600,
                      color: '#667eea',
                      fontSize: '17px', // Increased from 15px
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      padding: '8px 15px', // Increased padding
                      borderRadius: '10px',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: 0,
                        height: '2px',
                        bottom: '4px',
                        left: '50%',
                        backgroundColor: '#667eea',
                        transition: 'all 0.3s ease',
                        transform: 'translateX(-50%)',
                      },
                      '&:hover': { 
                        color: '#4facfe',
                        textDecoration: 'none',
                        transform: 'translateY(-1px)',
                        '&::after': {
                          width: '100%'
                        }
                      }
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                {/* Login Button */}
                <GradientButton
                  fullWidth
                  size="large"
                  type="submit"
                  disabled={loading || !email.trim() || !password.trim()}
                  sx={{ mb: 6 }} // Increased margin
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress size={28} sx={{ color: 'white', mr: 2 }} /> {/* Increased size */}
                      <Typography sx={{ 
                        color: 'white', 
                        fontWeight: 700,
                        fontSize: '18px' // Increased from 16px
                      }}>
                        Signing you in...
                      </Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ 
                      color: 'white', 
                      fontWeight: 700,
                      fontSize: '18px', // Increased from 16px
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      Sign In Securely
                    </Typography>
                  )}
                </GradientButton>

                {/* Divider */}
                <Box sx={{ 
                  position: 'relative',
                  margin: '50px 0', // Increased margin
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, #e0e0e0, transparent)',
                  },
                  '&::after': {
                    content: '"or"',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -200%)',
                    background: 'white',
                    padding: '0 25px', // Increased padding
                    color: '#95a5a6',
                    fontSize: '16px', // Increased from 14px
                    fontWeight: 500
                  }
                }} />

                {/* Register Link */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ 
                    color: '#7f8c8d', 
                    mb: 3, // Increased margin
                    fontSize: '17px' // Increased from 15px
                  }}>
                    New to Smart Health Assistant?
                  </Typography>
                  <Link
                    component="button"
                    type="button"
                    onClick={() => window.location.href = '/register'}
                    sx={{ 
                      color: '#667eea',
                      fontWeight: 700,
                      textDecoration: 'none',
                      fontSize: '19px', // Increased from 17px
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      padding: '10px 20px', // Increased padding
                      borderRadius: '14px', // Increased radius
                      border: '2px solid transparent',
                      backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #667eea, #4facfe)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'content-box, border-box',
                      '&:hover': { 
                        color: 'white',
                        textDecoration: 'none',
                        background: 'linear-gradient(135deg, #667eea, #4facfe)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.35)' // Increased shadow
                      }
                    }}
                  >
                    Create your account here →
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