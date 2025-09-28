import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { Calendar, FileText, Users, Activity, Bell } from "lucide-react";

export default function DoctorDashboard() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6", p: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={5}
      >
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Doctor Dashboard
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <IconButton>
            <Bell size={24} color="#4b5563" />
          </IconButton>
          <Avatar
            src="https://via.placeholder.com/40"
            alt="Doctor Avatar"
            sx={{ width: 40, height: 40, border: "2px solid #d1d5db" }}
          />
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Appointments
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  12
                </Typography>
              </Box>
              <Calendar size={40} color="#2563eb" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Patients
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: "green" }}>
                  45
                </Typography>
              </Box>
              <Users size={40} color="green" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Reports
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: "#ca8a04" }}>
                  8
                </Typography>
              </Box>
              <FileText size={40} color="#eab308" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Vitals
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: "red" }}>
                  Normal
                </Typography>
              </Box>
              <Activity size={40} color="red" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Appointments */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Upcoming Appointments
          </Typography>

          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f3f4f6" }}>
                <TableCell>Patient</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow hover>
                <TableCell>John Doe</TableCell>
                <TableCell>Aug 20, 2025</TableCell>
                <TableCell>10:00 AM</TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      bgcolor: "green.100",
                      color: "green",
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: "0.875rem",
                    }}
                  >
                    Confirmed
                  </Box>
                </TableCell>
              </TableRow>

              <TableRow hover>
                <TableCell>Jane Smith</TableCell>
                <TableCell>Aug 20, 2025</TableCell>
                <TableCell>11:30 AM</TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      bgcolor: "yellow.100",
                      color: "#b45309",
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: "0.875rem",
                    }}
                  >
                    Pending
                  </Box>
                </TableCell>
              </TableRow>

              <TableRow hover>
                <TableCell>Michael Lee</TableCell>
                <TableCell>Aug 21, 2025</TableCell>
                <TableCell>2:00 PM</TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      bgcolor: "red.100",
                      color: "red",
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: "0.875rem",
                    }}
                  >
                    Canceled
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
