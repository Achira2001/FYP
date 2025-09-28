import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

export default function Navbar({ onLogout, username }) {
  return (
    <AppBar position="static" sx={{ bgcolor: "primary.main" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight="bold">
          Smart Health Assistant
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body1">Hello, {username}</Typography>
          <Button
            variant="contained"
            color="error"
            onClick={onLogout}
            size="small"
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
