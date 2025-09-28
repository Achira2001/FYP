import React, { useState } from "react";
import {
  Box, Card, TextField, Button, Typography, Alert, CircularProgress,
  Container, Avatar, Stepper, Step, StepLabel, IconButton
} from "@mui/material";
import {
  Mail, Lock, ArrowBack, Shield, Favorite
} from "@mui/icons-material";

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function HealthForgotPasswordPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    email: "", resetCode: "", newPassword: "", confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const steps = ["Enter Email", "Verify Code", "Reset Password"];
  const stepIcons = [<Mail key="mail" />, <Shield key="shield" />, <Lock key="lock" />];

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  const apiCall = async (endpoint, body) => {
    const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    
    try {
      const { email, resetCode, newPassword, confirmPassword } = formData;
      
      if (step === 0) {
        if (!email.trim()) throw new Error("Please enter your email address");
        await apiCall('forgot-password', { email: email.toLowerCase() });
        alert("Reset code sent to your email!");
        setStep(1);
      } 
      else if (step === 1) {
        if (!resetCode.trim()) throw new Error("Please enter the reset code");
        await apiCall('verify-reset-code', { 
          email: email.toLowerCase(), 
          resetCode: resetCode.trim() 
        });
        setStep(2);
      } 
      else {
        if (!newPassword || !confirmPassword) throw new Error("Please fill in all fields");
        if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
        if (newPassword.length < 6) throw new Error("Password must be at least 6 characters long");
        
        await apiCall('reset-password', {
          email: email.toLowerCase(),
          resetCode: resetCode.trim(),
          newPassword,
          confirmPassword
        });
        alert("Password reset successful! Please login with your new password.");
        window.location.href = '/login';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const { email, resetCode, newPassword, confirmPassword } = formData;
    
    switch (step) {
      case 0:
        return (
          <TextField
            fullWidth
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChange={handleInputChange('email')}
            InputProps={{
              startAdornment: <Mail sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        );
      case 1:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" align="center" mb={2}>
              We've sent a 6-digit code to {email}
            </Typography>
            <TextField
              fullWidth
              label="Reset Code"
              placeholder="Enter 6-digit code"
              value={resetCode}
              onChange={handleInputChange('resetCode')}
              inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.2rem', fontFamily: 'monospace' } }}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={handleInputChange('newPassword')}
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e8 50%, #f3e5f5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            p: 4,
            borderRadius: 4,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={3}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: step === 0 ? 'linear-gradient(135deg, #2196f3, #4caf50)' :
                           step === 1 ? 'linear-gradient(135deg, #4caf50, #00e676)' :
                           'linear-gradient(135deg, #9c27b0, #e91e63)',
                mx: 'auto',
                mb: 2
              }}
            >
              {stepIcons[step]}
            </Avatar>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              sx={{
                background: step === 0 ? 'linear-gradient(135deg, #1976d2, #388e3c)' :
                           step === 1 ? 'linear-gradient(135deg, #388e3c, #00c853)' :
                           'linear-gradient(135deg, #7b1fa2, #c2185b)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              {steps[step]}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {step === 0 ? "Enter your email address and we'll send you a reset code" :
               step === 1 ? "Enter the verification code" :
               "Enter your new password"}
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form Content */}
          <Box mb={3}>
            {renderStepContent()}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                py: 1.5,
                background: step === 0 ? 'linear-gradient(135deg, #1976d2, #388e3c)' :
                           step === 1 ? 'linear-gradient(135deg, #388e3c, #00c853)' :
                           'linear-gradient(135deg, #7b1fa2, #c2185b)',
                '&:hover': {
                  background: step === 0 ? 'linear-gradient(135deg, #1565c0, #2e7d32)' :
                             step === 1 ? 'linear-gradient(135deg, #2e7d32, #00b248)' :
                             'linear-gradient(135deg, #6a1b9a, #ad1457)',
                }
              }}
            >
              {loading ? (
                <Box display="flex" alignItems="center">
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  {step === 0 ? 'Sending...' : step === 1 ? 'Verifying...' : 'Resetting...'}
                </Box>
              ) : (
                step === 0 ? 'Send Reset Code' : step === 1 ? 'Verify Code' : 'Reset Password'
              )}
            </Button>

            {step === 1 && (
              <Button
                fullWidth
                variant="text"
                onClick={() => setStep(0)}
              >
                Back to Email
              </Button>
            )}

            <Button
              fullWidth
              variant="text"
              startIcon={<ArrowBack />}
              onClick={() => window.location.href = '/login'}
            >
              Back to Login
            </Button>
          </Box>
        </Card>

        {/* Footer */}
        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" justifyContent="center">
            <Favorite sx={{ color: 'red', mr: 1 }} />
            Your health, our priority
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}