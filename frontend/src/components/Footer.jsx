import React from "react";
import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "grey.100",
        color: "text.secondary",
        py: 2,
        textAlign: "center",
        mt: "auto",
      }}
    >
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} Smart Health Assistant. All rights reserved.
      </Typography>
    </Box>
  );
}
