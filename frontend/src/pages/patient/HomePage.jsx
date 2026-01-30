import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Stack,
  Card,
  Chip,
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MedicationIcon from "@mui/icons-material/Medication";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupIcon from "@mui/icons-material/Group";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate } from "react-router-dom";

const MedivaHomepage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MedicationIcon fontSize="large" />,
      title: "Medicine Reminders",
      description: "Never miss a dose with smart reminders",
    },
    {
      icon: <RestaurantIcon fontSize="large" />,
      title: "Personalized Diet Plans",
      description: "Customized meal plans for your goals",
    },
  ];

  const stats = [
    { label: "Active Users", value: "10K+", icon: <GroupIcon /> },
    { label: "Reminders Sent", value: "1M+", icon: <NotificationsIcon /> },
    { label: "Success Rate", value: "98%", icon: <CheckCircleIcon /> },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #020617, #0f172a, #020617)",
      }}
    >
      {/* ================= HERO ================= */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container maxWidth="lg">
          <Grid
            container
            spacing={6}
            alignItems="center"
            justifyContent="center"
          >
            {/* LEFT */}
            <Grid item xs={12} md={6} textAlign={{ xs: "center" }}>
              <Chip
                icon={<AutoAwesomeIcon />}
                label="AI-Powered Health Management"
                sx={{
                  mb: 3,
                  bgcolor: "rgba(124,58,237,0.2)",
                  color: "#c4b5fd",
                }}
              />

              <Typography variant="h2" fontWeight="bold" color="white">
                Your Personal
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    background:
                      "linear-gradient(90deg,#a78bfa,#22d3ee,#34d399)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Health Companion
                </Box>
              </Typography>

              <Typography color="grey.400" fontSize={18} mt={3}>
                Never miss a medication dose and maintain a healthy lifestyle
                with intelligent reminders and diet plans.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                mt={4}
                justifyContent="center"
              >
                <Button
                  size="large"
                  variant="contained"
                  startIcon={<CalendarMonthIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    background:
                      "linear-gradient(90deg,#7c3aed,#06b6d4)",
                  }}
                  onClick={() =>
                    navigate("/patient/medicine-reminders")
                  }
                >
                  Start Free Trial
                </Button>

                <Button
                  size="large"
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ color: "#22d3ee", borderColor: "#22d3ee" }}
                  onClick={() =>
                    navigate("/patient/medicine-reminders")
                  }
                >
                  Watch Demo
                </Button>
              </Stack>

              <Grid container spacing={3} mt={4} justifyContent="center">
                {stats.map((stat, i) => (
                  <Grid item xs={4} key={i} textAlign="center">
                    <Box sx={{ color: "#a78bfa" }}>{stat.icon}</Box>
                    <Typography variant="h6" color="white">
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="grey.400">
                      {stat.label}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* RIGHT CARD */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 4,
                  borderRadius: 4,
                  bgcolor: "rgba(15,23,42,0.7)",
                  border: "1px solid rgba(124,58,237,0.4)",
                }}
              >
                <Stack spacing={2}>
                  {[
                    "Choose medication type",
                    "Set dosage & frequency",
                    "Pick reminder times",
                    "Select notification method",
                  ].map((text, i) => (
                    <Stack direction="row" spacing={1} key={i}>
                      <CheckCircleIcon sx={{ color: "#34d399" }} />
                      <Typography color="grey.300">{text}</Typography>
                    </Stack>
                  ))}
                </Stack>

                <Button
                  fullWidth
                  size="large"
                  sx={{
                    mt: 4,
                    background:
                      "linear-gradient(90deg,#7c3aed,#06b6d4)",
                  }}
                  variant="contained"
                  onClick={() =>
                    navigate("/patient/medicine-reminders")
                  }
                >
                  Configure Reminders
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ================= FEATURES ================= */}
      <Container sx={{ py: 10 }} maxWidth="lg">
        <Typography
          variant="h3"
          textAlign="center"
          color="white"
          fontWeight="bold"
        >
          Everything You Need
        </Typography>

        <Typography textAlign="center" color="grey.400" mb={6}>
          Comprehensive health management in one place
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card
                sx={{
                  p: 3,
                  height: "100%",
                  bgcolor: "rgba(15,23,42,0.6)",
                  border: "1px solid rgba(100,116,139,0.3)",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    borderColor: "#a78bfa",
                  },
                }}
              >
                <Box sx={{ color: "#a78bfa", mb: 2 }}>{f.icon}</Box>
                <Typography variant="h6" color="white">
                  {f.title}
                </Typography>
                <Typography color="grey.400" fontSize={14}>
                  {f.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ================= CTA ================= */}
      <Container sx={{ py: 20 }} maxWidth="md">
        <Box
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 6,
            background:
              "linear-gradient(90deg,#7c3aed,#06b6d4,#34d399)",
          }}
        >
          <Typography variant="h3" fontWeight="bold" color="white">
            Ready to Take Control?
          </Typography>
          <Typography color="white" mt={2} mb={4}>
            Join thousands of users managing their health with Mediva
          </Typography>
          <Button
            size="large"
            variant="contained"
            sx={{ bgcolor: "white", color: "#7c3aed" }}
            onClick={() =>
              navigate("/patient/medicine-reminders")
            }
          >
            Get Started Today
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default MedivaHomepage;
