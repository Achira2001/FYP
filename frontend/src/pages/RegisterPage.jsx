import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Avatar,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Fade,
  Zoom,
  Slide,
  Link
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Person,
  Email,
  Lock,
  Phone,
  LocationOn,
  MedicalServices,
  Favorite,
  Security,
  Visibility,
  VisibilityOff,
  CalendarToday,
  FavoriteRounded,
  Healing,
  LocalHospital,
  AdminPanelSettings
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Enhanced Keyframe animations (same as login page)
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

// Full-screen background (same as login page)
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

// Left side - Branding and info (same as login page)
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

// Right side - Register form
const RightRegisterPanel = styled(Box)({
  flex: '1',
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 250, 0.95) 100%)',
  backdropFilter: 'blur(30px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  padding: '40px 60px',
  position: 'relative',
  boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.1)',
  overflowY: 'auto',
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

// Enhanced register form container
const RegisterFormContainer = styled(Box)({
  width: '100%',
  maxWidth: '600px',
  position: 'relative',
  zIndex: 2,
  marginTop: '20px',
});

// Large branding elements for left panel (same as login page)
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

// Enhanced form elements - similar to login page
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 250, 0.95) 100%)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '2px solid transparent',
    backgroundClip: 'padding-box',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: '16px',
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
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
      '&::before': {
        opacity: 0.3,
      },
      '& fieldset': {
        borderColor: 'transparent',
      },
    },
    '&.Mui-focused': {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.25)',
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
    padding: '18px 16px',
    fontSize: '16px',
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

const GradientButton = styled(Button)(({ theme, rolecolor }) => ({
  background: rolecolor || 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  borderRadius: '16px',
  padding: '18px 32px',
  fontSize: '17px',
  fontWeight: 700,
  textTransform: 'none',
  boxShadow: `
    0 16px 32px rgba(0, 0, 0, 0.2), 
    0 8px 16px rgba(0, 0, 0, 0.12),
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
      0 24px 48px rgba(0, 0, 0, 0.25), 
      0 12px 24px rgba(0, 0, 0, 0.15),
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

// Floating particles (same as login page)
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

// Role selection styled components
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  borderRadius: '18px',
  overflow: 'hidden',
  border: '2px solid rgba(102, 126, 234, 0.2)',
  backdropFilter: 'blur(15px)',
  background: 'rgba(255, 255, 255, 0.8)',
  width: '100%',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  '& .MuiToggleButton-root': {
    border: 'none',
    borderRadius: '16px !important',
    margin: '4px',
    padding: theme.spacing(2, 2.5),
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    fontWeight: 700,
    fontSize: '14px',
    textTransform: 'none',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    '&:hover': {
      transform: 'translateY(-2px) scale(1.05)',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
    },
    '&.Mui-selected': {
      color: 'white',
      fontWeight: 800,
      transform: 'translateY(-2px) scale(1.05)',
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.25)',
      '&:hover': {
        transform: 'translateY(-3px) scale(1.08)',
      },
    },
  },
}));

// Role configuration
const roleConfig = {
  patient: {
    icon: Favorite,
    color: 'linear-gradient(135deg, #e91e63 0%, #ad1457 50%, #880e4f 100%)',
    solidColor: '#e91e63',
    fields: [
      { name: 'fullName', label: 'Full Name', type: 'text', icon: Person, placeholder: 'Enter your full name' },
      { name: 'email', label: 'Email', type: 'email', icon: Email, placeholder: 'Enter your email address' },
      { name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'Create a secure password' },
      { name: 'phone', label: 'Phone', type: 'tel', icon: Phone, placeholder: 'Enter your phone number' },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', icon: CalendarToday },
      { name: 'address', label: 'Address', type: 'text', icon: LocationOn, placeholder: 'Enter your address' },
      { name: 'emergencyContact', label: 'Emergency Contact', type: 'tel', icon: Phone, placeholder: 'Emergency contact number' }
    ]
  },
  doctor: {
    icon: MedicalServices,
    color: 'linear-gradient(135deg, #2196f3 0%, #1565c0 50%, #0d47a1 100%)',
    solidColor: '#2196f3',
    fields: [
      { name: 'fullName', label: 'Full Name', type: 'text', icon: Person, placeholder: 'Enter your full name' },
      { name: 'email', label: 'Email', type: 'email', icon: Email, placeholder: 'Enter your email address' },
      { name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'Create a secure password' },
      { name: 'phone', label: 'Phone', type: 'tel', icon: Phone, placeholder: 'Enter your phone number' },
      { name: 'medicalLicense', label: 'Medical License', type: 'text', icon: MedicalServices, placeholder: 'Enter your medical license number' },
      { name: 'specialization', label: 'Specialization', type: 'text', icon: MedicalServices, placeholder: 'Enter your specialization' },
      { name: 'workplace', label: 'Hospital/Clinic', type: 'text', icon: LocationOn, placeholder: 'Enter your workplace' }
    ]
  },
  admin: {
    icon: Security,
    color: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 50%, #4a148c 100%)',
    solidColor: '#9c27b0',
    fields: [
      { name: 'fullName', label: 'Full Name', type: 'text', icon: Person, placeholder: 'Enter your full name' },
      { name: 'email', label: 'Email', type: 'email', icon: Email, placeholder: 'Enter your email address' },
      { name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'Create a secure password' },
      { name: 'phone', label: 'Phone', type: 'tel', icon: Phone, placeholder: 'Enter your phone number' },
      { name: 'adminCode', label: 'Admin Code', type: 'text', icon: Security, placeholder: 'Enter admin verification code' }
    ]
  }
};

export default function HealthRegisterPage() {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleRoleChange = (_, newRole) => {
    if (newRole) {
      setRole(newRole);
      setFormData({});
      setError('');
      setSuccess('');
    }
  };

  const validateForm = () => {
    const fields = roleConfig[role].fields;
    
    // Check required fields
    for (let field of fields) {
      if (!formData[field.name]?.trim()) {
        setError(`${field.label} is required`);
        return false;
      }
    }

    // Validate email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate password
    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Validate phone
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s+/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const registrationData = {
        ...formData,
        role,
        email: formData.email?.toLowerCase().trim(),
        fullName: formData.fullName?.trim(),
        phone: formData.phone?.trim()
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `Registration failed: ${response.status}`);

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
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const RoleIcon = roleConfig[role].icon;
  const currentConfig = roleConfig[role];

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
                Join our comprehensive healthcare management platform.
                Create your account and connect with our secure medical ecosystem.
              </BrandingSubtitle>

              {/* Enhanced Role Display */}
              <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
                <Grid item xs={4}>
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
                <Grid item xs={4}>
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
                <Grid item xs={4}>
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

        {/* Right Panel - Register Form */}
        <RightRegisterPanel>
          <Fade in={true} timeout={1500}>
            <RegisterFormContainer sx={{ animation: `${slideInRight} 1.2s ease-out` }}>
              {/* Form Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #667eea 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 2,
                  fontSize: '2.8rem',
                  mt: 20
                }}>
                  Join Us Today
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: '#7f8c8d',
                  fontWeight: 500,
                  fontSize: '1.1rem'
                }}>
                  Create your account and access healthcare services
                </Typography>
              </Box>

              {/* Error & Success Alerts */}
              {error && (
                <Slide direction="down" in={true} mountOnEnter unmountOnExit>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)',
                      border: '2px solid #f8bbd9',
                      boxShadow: '0 8px 20px rgba(211, 47, 47, 0.2)',
                      fontSize: '15px',
                      '& .MuiAlert-icon': {
                        color: '#d32f2f',
                        fontSize: '22px'
                      },
                      '& .MuiAlert-message': {
                        fontWeight: 600,
                        fontSize: '15px'
                      }
                    }}
                  >
                    {error}
                  </Alert>
                </Slide>
              )}

              {success && (
                <Slide direction="down" in={true} mountOnEnter unmountOnExit>
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                      border: '2px solid #c8e6c9',
                      boxShadow: '0 8px 20px rgba(76, 175, 80, 0.2)',
                      fontSize: '15px',
                      '& .MuiAlert-icon': {
                        color: '#4caf50',
                        fontSize: '22px'
                      },
                      '& .MuiAlert-message': {
                        fontWeight: 600,
                        fontSize: '15px'
                      }
                    }}
                  >
                    {success}
                  </Alert>
                </Slide>
              )}

              {/* Role Selection */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    textAlign: 'center', 
                    mb: 3, 
                    color: '#2c3e50',
                    fontWeight: 700,
                    fontSize: '18px',
                    letterSpacing: '0.5px'
                  }}
                >
                  I am registering as a:
                </Typography>
                <StyledToggleButtonGroup
                  value={role}
                  exclusive
                  onChange={handleRoleChange}
                  size="large"
                >
                  {Object.entries(roleConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <ToggleButton 
                        key={key} 
                        value={key}
                        sx={{ 
                          py: 2.5,
                          '&.Mui-selected': { 
                            background: config.color,
                            color: 'white',
                            '& .MuiSvgIcon-root': {
                              color: 'white'
                            }
                          }
                        }}
                      >
                        <Icon sx={{ 
                          mb: 0.5, 
                          fontSize: 28,
                          color: role === key ? 'white' : config.solidColor 
                        }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            textTransform: 'capitalize', 
                            fontWeight: 700,
                            fontSize: '14px'
                          }}
                        >
                          {key}
                        </Typography>
                      </ToggleButton>
                    );
                  })}
                </StyledToggleButtonGroup>
              </Box>

              {/* Registration Form - Full Width */}
              <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1 }}>
                  <Grid container spacing={4}>
                    {/* Form fields using full width with better spacing */}
                    {currentConfig.fields.map(({ name, label, type, icon: FieldIcon, placeholder }, index) => (
                      <Grid item xs={12} sm={currentConfig.fields.length <= 5 ? 12 : 6} key={name}>
                        <Box>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              mb: 2, 
                              fontWeight: 700, 
                              color: '#2c3e50',
                              fontSize: '16px',
                              letterSpacing: '0.3px'
                            }}
                          >
                            {label}
                          </Typography>
                          <StyledTextField
                            fullWidth
                            name={name}
                            type={type === 'password' && showPassword ? 'text' : type}
                            placeholder={placeholder}
                            value={formData[name] || ''}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FieldIcon sx={{ 
                                    color: currentConfig.solidColor, 
                                    fontSize: 22,
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                  }} />
                                </InputAdornment>
                              ),
                              ...(type === 'password' && {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={() => setShowPassword(!showPassword)}
                                      edge="end"
                                      sx={{ 
                                        color: '#666',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          backgroundColor: `rgba(${currentConfig.solidColor === '#e91e63' ? '233, 30, 99' : currentConfig.solidColor === '#2196f3' ? '33, 150, 243' : '156, 39, 176'}, 0.1)`,
                                          color: currentConfig.solidColor,
                                          transform: 'scale(1.1)'
                                        }
                                      }}
                                    >
                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }),
                              ...(type === 'date' && {
                                inputProps: { max: new Date().toISOString().split('T')[0] }
                              })
                            }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Bottom section with submit button and login link */}
                <Box sx={{ mt: 5 }}>
                  {/* Submit Button */}
                  <GradientButton
                    fullWidth
                    size="large"
                    type="submit"
                    disabled={loading}
                    rolecolor={currentConfig.color}
                    sx={{ mb: 4, py: 2.5 }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress size={26} sx={{ color: 'white', mr: 2 }} />
                        <Typography sx={{ 
                          color: 'white', 
                          fontWeight: 700,
                          fontSize: '17px'
                        }}>
                          Creating Account...
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ 
                        color: 'white', 
                        fontWeight: 700,
                        fontSize: '17px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        Create {role.charAt(0).toUpperCase() + role.slice(1)} Account
                      </Typography>
                    )}
                  </GradientButton>

                  {/* Divider */}
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
                      transform: 'translate(-50%, -200%)',
                      background: 'white',
                      padding: '0 24px',
                      color: '#95a5a6',
                      fontSize: '15px',
                      fontWeight: 500
                    }
                  }} />

                  {/* Login Link */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ 
                      color: '#7f8c8d', 
                      mb: 3,
                      fontSize: '16px'
                    }}>
                      Already have an account?
                    </Typography>
                    <Link
                      component="button"
                      type="button"
                      onClick={() => window.location.href = '/login'}
                      sx={{ 
                        color: '#667eea',
                        fontWeight: 700,
                        textDecoration: 'none',
                        fontSize: '18px',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        padding: '10px 20px',
                        borderRadius: '14px',
                        border: '2px solid transparent',
                        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #667eea, #4facfe)',
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'content-box, border-box',
                        '&:hover': { 
                          color: 'white',
                          textDecoration: 'none',
                          background: 'linear-gradient(135deg, #667eea, #4facfe)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 10px 25px rgba(102, 126, 234, 0.35)'
                        }
                      }}
                    >
                      Sign In Here →
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