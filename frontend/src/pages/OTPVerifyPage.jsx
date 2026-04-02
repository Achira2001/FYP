import React, { useState, useEffect, useRef } from "react";
import { styled, keyframes } from "@mui/material/styles";
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  Link, Slide, Fade,
} from "@mui/material";
import { Shield, Email, ArrowBack, CheckCircle } from "@mui/icons-material";

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
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;
const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;
const successPop = keyframes`
  0%   { transform: scale(0.5); opacity: 0; }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
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
  padding: "24px",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: `
      radial-gradient(ellipse 70% 60% at 20% 20%, rgba(99,102,241,0.15) 0%, transparent 60%),
      radial-gradient(ellipse 60% 70% at 80% 80%, rgba(168,85,247,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 70% 10%, rgba(16,185,129,0.08) 0%, transparent 50%)
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
  maxWidth: "460px",
  position: "relative",
  backdropFilter: "blur(20px)",
  boxShadow: "0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1)",
  animation: `${slideUp} 0.6s ease-out`,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)",
  },
});

const IconRing = styled(Box)({
  width: 80, height: 80, borderRadius: "50%",
  background: "linear-gradient(135deg, #6366F1, #A855F7)",
  display: "flex", alignItems: "center", justifyContent: "center",
  margin: "0 auto 24px",
  position: "relative",
  animation: `${pulse} 3s ease-in-out infinite`,
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
});

const OtpBox = styled(TextField)({
  width: "52px",
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(99,102,241,0.25)",
    transition: "all 0.2s ease",
    "& fieldset": { border: "none" },
    "&:hover": { border: "1px solid rgba(99,102,241,0.5)" },
    "&.Mui-focused": {
      border: "1px solid #6366F1",
      boxShadow: "0 0 0 3px rgba(99,102,241,0.2)",
      background: "rgba(15,23,42,0.95)",
    },
  },
  "& .MuiOutlinedInput-input": {
    padding: "14px 0",
    fontSize: "22px",
    fontWeight: 700,
    textAlign: "center",
    color: "#F1F5F9",
    letterSpacing: "0.05em",
  },
});

const PrimaryButton = styled(Button)({
  borderRadius: "12px", padding: "14px 24px", fontSize: "15px", fontWeight: 700,
  textTransform: "none",
  background: "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)",
  backgroundSize: "200% 200%",
  animation: `${gradientShift} 6s ease infinite`,
  boxShadow: "0 8px 24px rgba(99,102,241,0.35)", color: "#fff",
  transition: "all 0.25s ease",
  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 12px 32px rgba(99,102,241,0.45)" },
  "&.Mui-disabled": {
    opacity: 0.5, transform: "none", animation: "none",
    background: "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)",
    color: "rgba(255,255,255,0.4)",
  },
});

const EmailInput = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(99,102,241,0.2)",
    transition: "all 0.25s",
    "& fieldset": { border: "none" },
    "&:hover": { border: "1px solid rgba(99,102,241,0.4)" },
    "&.Mui-focused": { border: "1px solid #6366F1", boxShadow: "0 0 0 3px rgba(99,102,241,0.15)" },
    "&.Mui-error": {
      border: "1px solid rgba(239,68,68,0.5)",
      "&.Mui-focused": { border: "1px solid #EF4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.12)" },
    },
  },
  "& .MuiOutlinedInput-input": {
    padding: "12px 14px", fontSize: "14px", color: "#F1F5F9",
    "&::placeholder": { color: "#475569", opacity: 1 },
  },
  "& .MuiFormHelperText-root": { color: "#EF4444", fontSize: "11px", ml: "2px" },
});

//  Helpers 
const validateEmail = (v) => {
  if (!v.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
  return "";
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const OTP_LENGTH = 6;
const TIMER_SECONDS = 300;

//  Component 
export default function OtpVerifyPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("email");
    if (e) setEmail(e);
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    setOtpError("");
    setApiError("");
    if (val && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...Array(OTP_LENGTH).fill("")];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailTouched) setEmailError(validateEmail(e.target.value));
    setApiError("");
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handleSubmit = async () => {
    // Validate email
    setEmailTouched(true);
    const eErr = validateEmail(email);
    setEmailError(eErr);
    if (eErr) return;

    // Validate OTP
    const otpStr = otp.join("");
    if (otpStr.length !== OTP_LENGTH) {
      setOtpError("Please enter all 6 digits");
      return;
    }
    if (!/^\d{6}$/.test(otpStr)) {
      setOtpError("OTP must contain only numbers");
      return;
    }

    setLoading(true);
    setApiError("");
    setOtpError("");
    try {
      const r = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp: otpStr }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "OTP verification failed");

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userEmail", data.user.email);
      }
      setVerified(true);
      setSuccessMsg("Email verified successfully! Redirecting…");
      setTimeout(() => {
        const routes = { admin: "/admin/dashboard", patient: "/patient/dashboard", doctor: "/doctor/dashboard" };
        window.location.href = routes[data.user?.role] || "/dashboard";
      }, 1800);
    } catch (err) {
      setApiError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setEmailTouched(true);
    const eErr = validateEmail(email);
    setEmailError(eErr);
    if (eErr) return;

    setResending(true);
    setApiError("");
    try {
      const r = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Failed to resend OTP");
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimer(TIMER_SECONDS);
      setSuccessMsg("New verification code sent to your email.");
      setTimeout(() => setSuccessMsg(""), 4000);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setApiError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const filled = otp.filter(Boolean).length;

  return (
    <Root>
      <Card>
        {/* Icon */}
        <IconRing>
          {verified
            ? <CheckCircle sx={{ fontSize: 36, color: "#fff", animation: `${successPop} 0.5s ease-out` }} />
            : <Shield sx={{ fontSize: 36, color: "#fff" }} />
          }
        </IconRing>

        {/* Heading */}
        <Typography sx={{ textAlign: "center", fontSize: "26px", fontWeight: 800, color: "#F1F5F9", mb: "8px", letterSpacing: "-0.02em" }}>
          {verified ? "Verified!" : "Verify Your Email"}
        </Typography>
        <Typography sx={{ textAlign: "center", color: "#64748B", fontSize: "14px", mb: "28px", lineHeight: 1.6 }}>
          {verified
            ? "Your account has been verified successfully."
            : "Enter the 6-digit code sent to your email address"
          }
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

        {/* Email field */}
        <Box sx={{ mb: "20px" }}>
          <Typography sx={{ color: "#94A3B8", fontSize: "12px", fontWeight: 600, mb: "8px", letterSpacing: "0.04em" }}>
            Email Address
          </Typography>
          <EmailInput
            fullWidth
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            error={emailTouched && Boolean(emailError)}
            helperText={emailTouched && emailError}
            disabled={loading || verified}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: "8px", display: "flex", alignItems: "center" }}>
                  <Email sx={{ fontSize: "16px", color: emailTouched && emailError ? "#EF4444" : "#475569" }} />
                </Box>
              ),
            }}
          />
        </Box>

        {/* OTP inputs */}
        <Box sx={{ mb: "6px" }}>
          <Typography sx={{ color: "#94A3B8", fontSize: "12px", fontWeight: 600, mb: "12px", letterSpacing: "0.04em" }}>
            Verification Code
          </Typography>
          <Box sx={{ display: "flex", gap: "8px", justifyContent: "center" }} onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <OtpBox
                key={i}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                inputRef={(el) => { inputRefs.current[i] = el; }}
                disabled={loading || verified}
                inputProps={{ maxLength: 1, inputMode: "numeric", pattern: "[0-9]*" }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderColor: digit ? "rgba(99,102,241,0.5)" : undefined,
                    background: digit ? "rgba(99,102,241,0.08)" : undefined,
                  },
                }}
              />
            ))}
          </Box>

          {/* Progress bar */}
          <Box sx={{ mt: "10px", height: "3px", bgcolor: "rgba(99,102,241,0.1)", borderRadius: "2px", overflow: "hidden" }}>
            <Box sx={{
              height: "100%",
              width: `${(filled / OTP_LENGTH) * 100}%`,
              background: "linear-gradient(90deg, #6366F1, #A855F7)",
              borderRadius: "2px",
              transition: "width 0.3s ease",
            }} />
          </Box>

          {otpError && (
            <Typography sx={{ color: "#EF4444", fontSize: "12px", mt: "6px", textAlign: "center" }}>
              {otpError}
            </Typography>
          )}
        </Box>

        {/* Timer / resend */}
        <Box sx={{ textAlign: "center", mb: "24px", mt: "12px" }}>
          {timer > 0 ? (
            <Typography sx={{ color: "#64748B", fontSize: "13px" }}>
              Code expires in{" "}
              <Box component="span" sx={{
                color: timer < 60 ? "#EF4444" : "#6366F1",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}>
                {formatTime(timer)}
              </Box>
            </Typography>
          ) : (
            <Box>
              <Typography sx={{ color: "#EF4444", fontSize: "13px", mb: "8px" }}>
                Verification code expired
              </Typography>
              <Button
                onClick={handleResend}
                disabled={resending}
                sx={{
                  color: "#6366F1", fontSize: "13px", fontWeight: 700, textTransform: "none",
                  textDecoration: "underline", p: 0,
                  "&:hover": { color: "#A855F7", background: "transparent" },
                }}
                startIcon={resending ? <CircularProgress size={14} sx={{ color: "#6366F1" }} /> : null}
              >
                {resending ? "Sending…" : "Resend Code"}
              </Button>
            </Box>
          )}
        </Box>

        {/* Submit */}
        <PrimaryButton
          fullWidth
          onClick={handleSubmit}
          disabled={loading || verified || filled === 0}
        >
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CircularProgress size={16} sx={{ color: "rgba(255,255,255,0.8)" }} />
              <span>Verifying…</span>
            </Box>
          ) : verified ? "✓ Verified" : `Verify Email${filled > 0 ? ` (${filled}/${OTP_LENGTH})` : ""}`}
        </PrimaryButton>

        {/* Hint */}
        <Typography sx={{ textAlign: "center", color: "#475569", fontSize: "12px", mt: "16px", lineHeight: 1.5 }}>
          Didn't receive a code? Check your spam folder or{" "}
          {timer <= 0 && (
            <Box
              component="span"
              onClick={!resending ? handleResend : undefined}
              sx={{ color: "#6366F1", cursor: "pointer", fontWeight: 600,
                "&:hover": { color: "#A855F7" } }}
            >
              request a new one
            </Box>
          )}
        </Typography>

        {/* Back */}
        <Box sx={{ mt: "20px", pt: "16px", borderTop: "1px solid rgba(99,102,241,0.1)", textAlign: "center" }}>
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