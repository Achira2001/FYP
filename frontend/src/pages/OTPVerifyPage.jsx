import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
  Container,
  Grid,
  CircularProgress,
  IconButton
} from "@mui/material";
import {
  Shield,
  Email,
  ArrowBack,
  Favorite
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%)',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
}));

const OtpInput = styled(TextField)({
  '& .MuiOutlinedInput-input': {
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    padding: '12px',
  },
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#4caf50',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4caf50',
      borderWidth: 2,
    },
  },
});

export default function HealthOTPVerifyPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(300);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setMessage("Verification code sent to your email address.");
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtp(newOtp);
      document.getElementById(`otp-${Math.min(pastedData.length, 5)}`)?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    if (!email) {
      setError("Email address is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), otp: otpString }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('userEmail', data.user.email);
      }
      
      const roleRoutes = {
        admin: "/admin/dashboard",
        patient: "/patient/dashboard",
        doctor: "/doctor/dashboard",
        default: "/dashboard"
      };
      
      window.location.href = roleRoutes[data.user.role] || roleRoutes.default;
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setResending(true);
    setError("");
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setTimer(300);
      setMessage("New verification code sent to your email");
      setOtp(Array(6).fill(""));
      document.getElementById('otp-0')?.focus();
      
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 50%, #e0f2f1 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 3
      }}
    >
      <Container maxWidth="sm">
        <GradientPaper elevation={3}>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
                boxShadow: '0 8px 16px rgba(76,175,80,0.3)'
              }}
            >
              <Shield />
            </Avatar>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Verify Your Email
            </Typography>
            <Typography color="textSecondary">
              We've sent a 6-digit code to your email
            </Typography>
          </Box>

          {/* Messages */}
          {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" noValidate>
            {/* Email Input */}
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ mb: 3 }}
              focused
            />

            {/* OTP Inputs */}
            <Typography variant="subtitle2" fontWeight="bold" mb={2}>
              Enter 6-Digit Verification Code
            </Typography>
            <Grid container spacing={1} justifyContent="center" mb={3} onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <Grid item key={index}>
                  <OtpInput
                    id={`otp-${index}`}
                    size="small"
                    inputProps={{ maxLength: 1, style: { width: 40 } }}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Timer/Resend */}
            <Box textAlign="center" mb={3}>
              {timer > 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Code expires in: <strong style={{ color: '#4caf50' }}>{formatTime(timer)}</strong>
                </Typography>
              ) : (
                <Box>
                  <Typography variant="body2" color="error" mb={1}>
                    Verification code expired
                  </Typography>
                  <Button
                    color="primary"
                    onClick={handleResendOtp}
                    disabled={resending}
                    startIcon={resending ? <CircularProgress size={16} /> : null}
                  >
                    {resending ? 'Resending...' : 'Resend Code'}
                  </Button>
                </Box>
              )}
            </Box>

            {/* Submit Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || otp.join('').length !== 6}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                py: 1.5,
                background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2e7d32, #1b5e20)',
                },
                fontSize: '1.1rem',
                fontWeight: 'bold',
                mb: 3
              }}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>

            {/* Back Button */}
            <Box textAlign="center">
              <IconButton
                onClick={() => window.location.href = '/login'}
                sx={{ color: 'text.secondary' }}
              >
                <ArrowBack sx={{ mr: 1 }} />
                <Typography component="span">Back to Login</Typography>
              </IconButton>
            </Box>
          </Box>
        </GradientPaper>

        {/* Footer */}
        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Favorite sx={{ color: '#f44336', fontSize: 16 }} />
            Didn't receive the code? Check your spam folder
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}