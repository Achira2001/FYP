import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Activity,
  Pill,
  Heart,
  Clock,
  FileText,
} from "lucide-react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  Divider,
} from "@mui/material";

export default function PatientDashboard() {
  const patient = {
    fullName: "John Doe",
    email: "john@example.com",
    contactNumber: "+94 77 123 4567",
    address: "Colombo, Sri Lanka",
    age: 32,
    gender: "Male",
    bmi: 24.5,
    bloodType: "O+",
    medicalHistory: ["Diabetes", "Hypertension"],
    medications: [
      { name: "Metformin", dosage: "500mg", frequency: "Morning, Night" },
      { name: "Amlodipine", dosage: "5mg", frequency: "Morning" },
    ],
    mealTimes: {
      morning: "8:00 AM",
      afternoon: "1:00 PM",
      evening: "7:30 PM",
    },
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", p: 4 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" color="text.primary" mb={4}>
        Patient Dashboard
      </Typography>

      {/* Personal Information */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent>
          <Typography
            variant="h6"
            fontWeight="bold"
            mb={2}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <User color="#3b82f6" size={20} /> Personal Information
          </Typography>
          <Grid container spacing={2} color="text.secondary">
            <Grid item xs={12} md={6} display="flex" alignItems="center" gap={1}>
              <Mail size={18} /> {patient.email}
            </Grid>
            <Grid item xs={12} md={6} display="flex" alignItems="center" gap={1}>
              <Phone size={18} /> {patient.contactNumber}
            </Grid>
            <Grid item xs={12} md={6} display="flex" alignItems="center" gap={1}>
              <MapPin size={18} /> {patient.address}
            </Grid>
            <Grid item xs={12} md={6} display="flex" alignItems="center" gap={1}>
              <Activity size={18} /> Age: {patient.age}, {patient.gender}
            </Grid>
            <Grid item xs={12} md={6} display="flex" alignItems="center" gap={1}>
              <Heart size={18} /> BMI: {patient.bmi}
            </Grid>
            <Grid item xs={12} md={6} display="flex" alignItems="center" gap={1}>
              <FileText size={18} /> Blood Type: {patient.bloodType}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Medical History */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent>
          <Typography
            variant="h6"
            fontWeight="bold"
            mb={2}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <FileText color="#ef4444" size={20} /> Medical History
          </Typography>
          <List>
            {patient.medicalHistory.map((item, idx) => (
              <ListItem key={idx} sx={{ py: 0.5 }}>
                <Typography color="text.secondary">{item}</Typography>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent>
          <Typography
            variant="h6"
            fontWeight="bold"
            mb={2}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <Pill color="#22c55e" size={20} /> Current Medications
          </Typography>
          <List>
            {patient.medications.map((med, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 2,
                  mb: 2,
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                }}
              >
                <Typography fontWeight="500">{med.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {med.dosage} – {med.frequency}
                </Typography>
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Meal Times */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            fontWeight="bold"
            mb={2}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <Clock color="#8b5cf6" size={20} /> Daily Meal Times
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                }}
              >
                <Typography fontWeight="500">Morning</Typography>
                <Typography color="text.secondary">
                  {patient.mealTimes.morning}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                }}
              >
                <Typography fontWeight="500">Afternoon</Typography>
                <Typography color="text.secondary">
                  {patient.mealTimes.afternoon}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                }}
              >
                <Typography fontWeight="500">Evening</Typography>
                <Typography color="text.secondary">
                  {patient.mealTimes.evening}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
