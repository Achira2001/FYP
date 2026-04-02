import React, { useState } from "react";
import { styled, keyframes } from "@mui/material/styles";
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  Link, Slide, InputAdornment, IconButton,
} from "@mui/material";
import {
  Email, Lock, Shield, ArrowBack, Visibility, VisibilityOff, CheckCircle,
} from "@mui/icons-material";

//  Keyframes 
const gradientShift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const pulse = keyframes`
  0%,100% { transform:scale(1); box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
  50%     { transform:scale(1.05); box-shadow: 0 0 0 12px rgba(99,102,241,0); }
`;
const slideUp = keyframes`
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0); }
`;
const spinRing = keyframes`
  from { transform:rotate(0deg); }
  to   { transform:rotate(360deg); }
`;
const stepIn = keyframes`
  from { opacity:0; transform:translateX(20px); }
  to   { opacity:1; transform:translateX(0); }
`;

//  Styled 
const Root = styled(Box)({
  minHeight: "100vh",

  width: "100vw",
  background: "#0F172A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'DM Sans','Segoe UI',sans-serif",
  padding: "24px 16px",
  boxSizing: "border-box",
  position: "relative",
  overflow: "hidden",
  "@media (max-width: 600px)": {
    alignItems: "flex-start",
    padding: "24px 16px 40px",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: `
      radial-gradient(ellipse 70% 60% at 20% 20%, rgba(99,102,241,0.15) 0%, transparent 60%),
      radial-gradient(ellipse 60% 70% at 80% 80%, rgba(168,85,247,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 60% 10%, rgba(16,185,129,0.07) 0%, transparent 50%)
    `,
    pointerEvents: "none",
  },
});

const Card = styled(Box)({
  background: "rgba(17,24,39,0.95)",
  border: "1px solid rgba(99,102,241,0.2)",
  borderRadius: "24px",
  padding: "48px 44px",
  width: "100%",
  maxWidth: "440px",
  boxSizing: "border-box",
  position: "relative",
  backdropFilter: "blur(20px)",
  boxShadow: "0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1)",
  animation: `${slideUp} 0.6s ease-out`,
  "@media (max-width: 600px)": {
    padding: "32px 20px 28px",
    borderRadius: "20px",
    maxWidth: "100%",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)",
  },
});

const IconRing = styled(Box)(({ stepColor }) => ({
  width: 72, height: 72, borderRadius: "50%",
  background: stepColor || "linear-gradient(135deg, #6366F1, #A855F7)",
  display: "flex", alignItems: "center", justifyContent: "center",
  margin: "0 auto 20px",
  position: "relative",
  animation: `${pulse} 3s ease-in-out infinite`,
  "@media (max-width: 600px)": {
    width: 60,
    height: 60,
    marginBottom: "16px",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    inset: "-4px",
    borderRadius: "50%",
    border: "2px solid transparent",
    borderTopColor: "#6366F1",
    borderRightColor: "#A855F7",
    animation: `${spinRing} 3s linear infinite`,
  },
}));

const StyledInput = styled(TextField)({
  width: "100%",
  boxSizing: "border-box",
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(99,102,241,0.2)",
    transition: "all 0.25s",
    width: "100%",
    boxSizing: "border-box",
    "& fieldset": { border: "none" },
    "&:hover": { border: "1px solid rgba(99,102,241,0.4)", background: "rgba(15,23,42,0.95)" },
    "&.Mui-focused": {
      border: "1px solid #6366F1", background: "rgba(15,23,42,0.95)",
      boxShadow: "0 0 0 3px rgba(99,102,241,0.15)",
    },
    "&.Mui-error": {
      border: "1px solid rgba(239,68,68,0.5)",
      "&.Mui-focused": { border: "1px solid #EF4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.12)" },
    },
  },
  "& .MuiInputBase-root": {
    width: "100%",
  },
  "& .MuiOutlinedInput-input": {
    padding: "13px 14px", fontSize: "14px", color: "#F1F5F9",
    boxSizing: "border-box",
    "&::placeholder": { color: "#475569", opacity: 1 },
  },
  "& .MuiFormHelperText-root": {
    color: "#EF4444", fontSize: "11px", ml: "2px", mt: "3px",
  },
  "@media (max-width: 600px)": {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      minHeight: "50px",
    },
    "& .MuiOutlinedInput-input": {
      padding: "13px 12px",
      fontSize: "15px",
    },
  },
});

const PrimaryButton = styled(Button)(({ stepgradient }) => ({
  borderRadius: "10px", padding: "13px 24px", fontSize: "15px", fontWeight: 700,
  textTransform: "none",
  background: stepgradient || "linear-gradient(135deg, #6366F1, #A855F7)",
  backgroundSize: "200% 200%",
  animation: `${gradientShift} 6s ease infinite`,
  boxShadow: "0 8px 24px rgba(99,102,241,0.3)", color: "#fff",
  transition: "all 0.25s ease",
  width: "100%",
  boxSizing: "border-box",
  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 12px 32px rgba(99,102,241,0.4)" },
  "&.Mui-disabled": {
    opacity: 0.5, transform: "none", animation: "none",
    background: "linear-gradient(135deg, #6366F1, #A855F7)",
    color: "rgba(255,255,255,0.4)",
  },
  "@media (max-width: 600px)": {
    padding: "14px 24px",
    fontSize: "15px",
  },
}));

const StepDot = styled(Box)(({ active, done }) => ({
  width: done === "true" ? 28 : active === "true" ? 28 : 24,
  height: done === "true" ? 28 : active === "true" ? 28 : 24,
  borderRadius: "50%",
  background: done === "true"
    ? "linear-gradient(135deg,#10B981,#059669)"
    : active === "true"
    ? "linear-gradient(135deg,#6366F1,#A855F7)"
    : "rgba(30,41,59,0.8)",
  border: done === "true" || active === "true" ? "none" : "1px solid rgba(99,102,241,0.2)",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: "12px", fontWeight: 700, color: "#fff",
  transition: "all 0.3s ease",
  boxShadow: active === "true" ? "0 0 0 4px rgba(99,102,241,0.2)" : "none",
  "@media (max-width: 600px)": {
    width: done === "true" ? 26 : active === "true" ? 26 : 22,
    height: done === "true" ? 26 : active === "true" ? 26 : 22,
    fontSize: "11px",
  },
}));

// Validators 
const validators = {
  email(v) {
    if (!v.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
    return "";
  },
  resetCode(v) {
    if (!v.trim()) return "Reset code is required";
    if (!/^\d{6}$/.test(v.trim())) return "Code must be exactly 6 digits";
    return "";
  },
  newPassword(v) {
    if (!v) return "New password is required";
    if (v.length < 6) return "Must be at least 6 characters";
    if (!/(?=.*[a-z])/.test(v)) return "Must include a lowercase letter";
    if (!/(?=.*[A-Z])/.test(v)) return "Must include an uppercase letter";
    if (!/(?=.*\d)/.test(v)) return "Must include a number";
    return "";
  },
  confirmPassword(v, form) {
    if (!v) return "Please confirm your password";
    if (v !== form.newPassword) return "Passwords do not match";
    return "";
  },
};

const STEPS = [
  {
    id: 0, label: "Email", icon: <Email sx={{ fontSize: 28, color: "#fff" }} />,
    gradient: "linear-gradient(135deg,#6366F1,#A855F7)",
    title: "Forgot Password?",
    subtitle: "Enter your email and we'll send a reset code",
    fields: ["email"],
    btnLabel: "Send Reset Code",
  },
  {
    id: 1, label: "Verify", icon: <Shield sx={{ fontSize: 28, color: "#fff" }} />,
    gradient: "linear-gradient(135deg,#10B981,#059669)",
    title: "Enter Reset Code",
    subtitle: "Check your email for the 6-digit code",
    fields: ["resetCode"],
    btnLabel: "Verify Code",
  },
  {
    id: 2, label: "Reset", icon: <Lock sx={{ fontSize: 28, color: "#fff" }} />,
    gradient: "linear-gradient(135deg,#F59E0B,#D97706)",
    title: "Reset Password",
    subtitle: "Choose a strong new password",
    fields: ["newPassword", "confirmPassword"],
    btnLabel: "Reset Password",
  },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ email: "", resetCode: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const currentStep = STEPS[step];

  const validateField = (name, value) => {
    if (name === "confirmPassword") return validators.confirmPassword(value, form);
    return validators[name] ? validators[name](value) : "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (touched[name]) setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
    if (apiError) setApiError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
  };

  const apiCall = async (endpoint, body) => {
    const r = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  const handleSubmit = async () => {
    const stepFields = currentStep.fields;
    const newTouched = { ...touched };
    const newErrors = { ...errors };
    stepFields.forEach((name) => {
      newTouched[name] = true;
      newErrors[name] = validateField(name, form[name] || "");
    });
    setTouched(newTouched);
    setErrors(newErrors);
    if (stepFields.some((name) => newErrors[name])) return;

    setLoading(true);
    setApiError("");
    setSuccessMsg("");
    try {
      if (step === 0) {
        await apiCall("forgot-password", { email: form.email.toLowerCase().trim() });
        setSuccessMsg("Reset code sent! Check your email inbox and spam folder.");
        setTimeout(() => setSuccessMsg(""), 5000);
        setStep(1);
      } else if (step === 1) {
        await apiCall("verify-reset-code", {
          email: form.email.toLowerCase().trim(),
          resetCode: form.resetCode.trim(),
        });
        setStep(2);
      } else {
        await apiCall("reset-password", {
          email: form.email.toLowerCase().trim(),
          resetCode: form.resetCode.trim(),
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        });
        setDone(true);
        setSuccessMsg("Password reset successfully! Redirecting to login…");
        setTimeout(() => { window.location.href = "/login"; }, 2500);
      }
    } catch (err) {
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldConfig = {
    email: {
      label: "Email Address", type: "email", placeholder: "you@example.com",
      icon: <Email sx={{ fontSize: "16px", color: errors.email && touched.email ? "#EF4444" : "#475569" }} />,
    },
    resetCode: {
      label: "Reset Code", type: "text", placeholder: "123456",
      icon: <Shield sx={{ fontSize: "16px", color: errors.resetCode && touched.resetCode ? "#EF4444" : "#475569" }} />,
      inputProps: { maxLength: 6, style: { letterSpacing: "0.3em", textAlign: "center", fontSize: "18px", fontWeight: 700 } },
    },
    newPassword: {
      label: "New Password", type: showNew ? "text" : "password", placeholder: "Min. 6 characters",
      icon: <Lock sx={{ fontSize: "16px", color: errors.newPassword && touched.newPassword ? "#EF4444" : "#475569" }} />,
      endIcon: (
        <IconButton onClick={() => setShowNew(!showNew)} sx={{ color: "#475569", p: "4px" }}>
          {showNew ? <VisibilityOff sx={{ fontSize: "16px" }} /> : <Visibility sx={{ fontSize: "16px" }} />}
        </IconButton>
      ),
    },
    confirmPassword: {
      label: "Confirm Password", type: showConfirm ? "text" : "password", placeholder: "Repeat new password",
      icon: <Lock sx={{ fontSize: "16px", color: errors.confirmPassword && touched.confirmPassword ? "#EF4444" : "#475569" }} />,
      endIcon: (
        <IconButton onClick={() => setShowConfirm(!showConfirm)} sx={{ color: "#475569", p: "4px" }}>
          {showConfirm ? <VisibilityOff sx={{ fontSize: "16px" }} /> : <Visibility sx={{ fontSize: "16px" }} />}
        </IconButton>
      ),
    },
  };

  return (
    <Root>
      <Card>
        {/* Step indicators */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: { xs: "24px", sm: "32px" }, gap: "0" }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <StepDot active={String(i === step)} done={String(i < step)}>
                  {i < step ? <CheckCircle sx={{ fontSize: "14px" }} /> : i + 1}
                </StepDot>
                <Typography sx={{
                  fontSize: { xs: "9px", sm: "10px" }, fontWeight: 600,
                  color: i === step ? "#6366F1" : i < step ? "#10B981" : "#475569",
                  letterSpacing: "0.05em",
                }}>
                  {s.label}
                </Typography>
              </Box>
              {i < STEPS.length - 1 && (
                <Box sx={{
                  flex: 1, height: "2px", mx: { xs: "6px", sm: "8px" }, mb: "18px",
                  background: i < step
                    ? "linear-gradient(90deg,#10B981,#059669)"
                    : "rgba(99,102,241,0.15)",
                  transition: "background 0.4s",
                }} />
              )}
            </React.Fragment>
          ))}
        </Box>

        {/* Icon */}
        <IconRing stepColor={currentStep.gradient} key={step}>
          {done ? <CheckCircle sx={{ fontSize: { xs: 26, sm: 32 }, color: "#fff" }} /> : currentStep.icon}
        </IconRing>

        {/* Title */}
        <Typography sx={{
          textAlign: "center",
          fontSize: { xs: "20px", sm: "24px" },
          fontWeight: 800, color: "#F1F5F9",
          mb: "8px", letterSpacing: "-0.02em",
        }}>
          {done ? "Password Reset!" : currentStep.title}
        </Typography>
        <Typography sx={{
          textAlign: "center", color: "#64748B",
          fontSize: { xs: "12px", sm: "13px" },
          mb: { xs: "20px", sm: "28px" },
          lineHeight: 1.6,
        }}>
          {done ? "Your password has been updated successfully." : currentStep.subtitle}
        </Typography>

        {/* Alerts */}
        {apiError && (
          <Slide direction="down" in mountOnEnter unmountOnExit>
            <Alert severity="error" sx={{
              mb: "16px", borderRadius: "10px",
              bgcolor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#FCA5A5", "& .MuiAlert-icon": { color: "#EF4444" },
            }}>{apiError}</Alert>
          </Slide>
        )}
        {successMsg && (
          <Slide direction="down" in mountOnEnter unmountOnExit>
            <Alert severity="success" sx={{
              mb: "16px", borderRadius: "10px",
              bgcolor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
              color: "#6EE7B7", "& .MuiAlert-icon": { color: "#10B981" },
            }}>{successMsg}</Alert>
          </Slide>
        )}

        {/* Fields */}
        {!done && (
          <Box sx={{ animation: `${stepIn} 0.35s ease-out`, width: "100%", boxSizing: "border-box" }} key={step}>
            {currentStep.fields.map((name) => {
              const cfg = fieldConfig[name];
              return (
                <Box key={name} sx={{ mb: "16px", width: "100%", boxSizing: "border-box" }}>
                  <Typography sx={{
                    color: "#94A3B8", fontSize: "12px", fontWeight: 600,
                    mb: "8px", letterSpacing: "0.04em",
                  }}>
                    {cfg.label}
                  </Typography>
                  <StyledInput
                    fullWidth
                    name={name}
                    type={cfg.type}
                    placeholder={cfg.placeholder}
                    value={form[name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched[name] && Boolean(errors[name])}
                    helperText={touched[name] && errors[name]}
                    disabled={loading}
                    inputProps={cfg.inputProps}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{cfg.icon}</InputAdornment>,
                      ...(cfg.endIcon && {
                        endAdornment: <InputAdornment position="end">{cfg.endIcon}</InputAdornment>,
                      }),
                    }}
                  />
                </Box>
              );
            })}

            {/* Password strength  */}
            {step === 2 && form.newPassword && (
              <Box sx={{ mb: "16px" }}>
                {[
                  { label: "Min. 6 characters", ok: form.newPassword.length >= 6 },
                  { label: "Uppercase letter", ok: /[A-Z]/.test(form.newPassword) },
                  { label: "Lowercase letter", ok: /[a-z]/.test(form.newPassword) },
                  { label: "Number", ok: /\d/.test(form.newPassword) },
                ].map(({ label, ok }) => (
                  <Box key={label} sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "4px" }}>
                    <Box sx={{
                      width: 6, height: 6, borderRadius: "50%",
                      bgcolor: ok ? "#10B981" : "#334155",
                      transition: "background 0.2s",
                    }} />
                    <Typography sx={{ fontSize: "11px", color: ok ? "#10B981" : "#475569", transition: "color 0.2s" }}>
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            <PrimaryButton
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
              stepgradient={currentStep.gradient}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CircularProgress size={16} sx={{ color: "rgba(255,255,255,0.8)" }} />
                  <span>
                    {step === 0 ? "Sending…" : step === 1 ? "Verifying…" : "Resetting…"}
                  </span>
                </Box>
              ) : currentStep.btnLabel}
            </PrimaryButton>

            {step === 1 && (
              <Button
                fullWidth
                onClick={() => { setStep(0); setApiError(""); setSuccessMsg(""); }}
                sx={{
                  mt: "10px", color: "#64748B", fontSize: "13px", textTransform: "none",
                  width: "100%",
                  "&:hover": { color: "#94A3B8", background: "rgba(99,102,241,0.05)" },
                }}
              >
                 Change email address
              </Button>
            )}
          </Box>
        )}

        {/* Back to login */}
        <Box sx={{ mt: "24px", pt: "16px", borderTop: "1px solid rgba(99,102,241,0.1)", textAlign: "center" }}>
          <Link
            component="button"
            type="button"
            onClick={() => window.location.href = "/login"}
            sx={{
              color: "#64748B", fontSize: "13px", textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: "4px",
              "&:hover": { color: "#94A3B8", textDecoration: "none" },
            }}
          >
            <ArrowBack sx={{ fontSize: "14px" }} />
            Back to login
          </Link>
        </Box>
      </Card>
    </Root>
  );
}