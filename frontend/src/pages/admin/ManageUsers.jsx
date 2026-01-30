import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Chip,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  Divider,
  Stack,
  Fade,
  Zoom,
  ThemeProvider,
  createTheme,
  CssBaseline,
  InputAdornment,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  PersonOff as PersonOffIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#667eea',
      light: '#8b9aee',
      dark: '#4c63c9',
    },
    secondary: {
      main: '#764ba2',
      light: '#9567ba',
      dark: '#5a3878',
    },
    success: {
      main: '#03dac6',
      light: '#66fff9',
      dark: '#00a896',
    },
    error: {
      main: '#f5576c',
      light: '#ff8a95',
      dark: '#c83349',
    },
    warning: {
      main: '#ffc107',
      light: '#ffecb3',
      dark: '#c79100',
    },
    background: {
      default: '#0f1419',
      paper: '#1a1f2e',
    },
    text: {
      primary: '#e4e6eb',
      secondary: '#b0b3b8',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #1a1f2e 0%, #252b4a 100%)',
          border: '1px solid rgba(102, 126, 234, 0.15)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #1a1f2e 0%, #252b4a 100%)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editData, setEditData] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    patients: 0,
    doctors: 0,
    admins: 0,
    active: 0,
    verified: 0,
    blocked: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setLoading(false);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const calculateStats = () => {
    setStats({
      total: users.length,
      patients: users.filter(u => u.role === 'patient').length,
      doctors: users.filter(u => u.role === 'doctor').length,
      admins: users.filter(u => u.role === 'admin').length,
      active: users.filter(u => u.isActive).length,
      verified: users.filter(u => u.isEmailVerified).length,
      blocked: users.filter(u => u.isBlocked).length
    });
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleRoleFilter = (event) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditData(user);
    setEditDialog(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialog(true);
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      setSuccess('User updated successfully');
      setEditDialog(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleBlock = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/block`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isBlocked: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      setSuccess(`User ${!currentStatus ? 'blocked' : 'unblocked'} successfully`);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setSuccess('User deleted successfully');
      setDeleteDialog(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor':
        return <MedicalServicesIcon />;
      case 'admin':
        return <AdminIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'doctor': return 'primary';
      default: return 'secondary';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'blocked' && user.isBlocked) ||
                         (statusFilter === 'verified' && user.isEmailVerified);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card sx={{ p: 4, borderRadius: 3 }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                Loading users...
              </Typography>
            </Box>
          </Card>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="xl">
          <Fade in timeout={800}>
            <Box>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}

              {/* Header */}
              <Zoom in timeout={600}>
                <Card elevation={0} sx={{ 
                  borderRadius: 3, 
                  mb: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.3)'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                      <Box display="flex" alignItems="center" gap={3}>
                        <Avatar sx={{ 
                          width: 80, 
                          height: 80,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          border: '3px solid rgba(255,255,255,0.3)'
                        }}>
                          <PeopleIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h3" sx={{ 
                            fontWeight: 700, 
                            color: 'white',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                            mb: 1
                          }}>
                            User Management
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            Manage and monitor all system users
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          startIcon={<RefreshIcon />}
                          onClick={fetchUsers}
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.15)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                          }}
                        >
                          Refresh
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.15)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                          }}
                        >
                          Export
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>

              {/* Statistics Cards */}
              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="text.secondary">Total Users</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {stats.total}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'rgba(102, 126, 234, 0.2)', width: 56, height: 56 }}>
                          <PeopleIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(3, 218, 198, 0.2)' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="text.secondary">Active Users</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {stats.active}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'rgba(3, 218, 198, 0.2)', width: 56, height: 56 }}>
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28 }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(118, 75, 162, 0.2)' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="text.secondary">Doctors</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                            {stats.doctors}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'rgba(118, 75, 162, 0.2)', width: 56, height: 56 }}>
                          <MedicalServicesIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(245, 87, 108, 0.2)' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="text.secondary">Blocked</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                            {stats.blocked}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'rgba(245, 87, 108, 0.2)', width: 56, height: 56 }}>
                          <PersonOffIcon sx={{ color: 'error.main', fontSize: 28 }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Filters and Search */}
              <Card elevation={0} sx={{ borderRadius: 3, mb: 3, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={handleSearch}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={roleFilter}
                          label="Role"
                          onChange={handleRoleFilter}
                        >
                          <MenuItem value="all">All Roles</MenuItem>
                          <MenuItem value="patient">Patients</MenuItem>
                          <MenuItem value="doctor">Doctors</MenuItem>
                          <MenuItem value="admin">Admins</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={statusFilter}
                          label="Status"
                          onChange={handleStatusFilter}
                        >
                          <MenuItem value="all">All Status</MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="blocked">Blocked</MenuItem>
                          <MenuItem value="verified">Verified</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography variant="body2" color="text.secondary" align="right">
                        <strong>{filteredUsers.length}</strong> results
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedUsers.map((user) => (
                        <TableRow key={user._id} hover sx={{ '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.05)' } }}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ bgcolor: getRoleColor(user.role) + '.main' }}>
                                {getRoleIcon(user.role)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {user.fullName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {user._id.slice(-8)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <EmailIcon sx={{ fontSize: 14 }} />
                                {user.email}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PhoneIcon sx={{ fontSize: 14 }} />
                                {user.phone || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={user.role.toUpperCase()} 
                              color={getRoleColor(user.role)}
                              size="small"
                              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              {user.isEmailVerified && (
                                <Chip 
                                  icon={<VerifiedIcon />}
                                  label="Verified" 
                                  color="success" 
                                  size="small"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                              {user.isBlocked ? (
                                <Chip 
                                  icon={<BlockIcon />}
                                  label="Blocked" 
                                  color="error" 
                                  size="small"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              ) : user.isActive ? (
                                <Chip 
                                  icon={<CheckCircleIcon />}
                                  label="Active" 
                                  color="success" 
                                  size="small"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              ) : (
                                <Chip 
                                  label="Inactive" 
                                  size="small"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(user.createdAt), 'hh:mm a')}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" justifyContent="center" gap={0.5}>
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleViewUser(user)}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit User">
                                <IconButton 
                                  size="small" 
                                  color="secondary"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={user.isBlocked ? "Unblock" : "Block"}>
                                <IconButton 
                                  size="small" 
                                  color={user.isBlocked ? "success" : "warning"}
                                  onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                                >
                                  <BlockIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete User">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteUser(user)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredUsers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Card>
            </Box>
          </Fade>

          {/* View User Dialog */}
          <Dialog 
            open={viewDialog} 
            onClose={() => setViewDialog(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                {selectedUser && getRoleIcon(selectedUser.role)}
              </Avatar>
              User Details
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              {selectedUser && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(102, 126, 234, 0.1)', borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom>{selectedUser.fullName}</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={selectedUser.role.toUpperCase()} color={getRoleColor(selectedUser.role)} size="small" />
                        {selectedUser.isEmailVerified && <Chip icon={<VerifiedIcon />} label="Verified" color="success" size="small" />}
                        {selectedUser.isBlocked && <Chip label="Blocked" color="error" size="small" />}
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body2">{selectedUser.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Typography variant="body2">{selectedUser.phone || 'N/A'}</Typography>
                  </Grid>
                  {selectedUser.role === 'doctor' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                        <Typography variant="body2">
                          {selectedUser.dateOfBirth ? format(new Date(selectedUser.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Blood Type</Typography>
                        <Typography variant="body2">{selectedUser.bloodType || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Address</Typography>
                        <Typography variant="body2">{selectedUser.address || 'N/A'}</Typography>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Joined</Typography>
                    <Typography variant="body2">{format(new Date(selectedUser.createdAt), 'MMM dd, yyyy hh:mm a')}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Last Login</Typography>
                    <Typography variant="body2">
                      {selectedUser.lastLogin ? format(new Date(selectedUser.lastLogin), 'MMM dd, yyyy hh:mm a') : 'Never'}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setViewDialog(false)} variant="outlined">
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog 
            open={editDialog} 
            onClose={() => setEditDialog(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <DialogTitle sx={{ fontWeight: 600, color: 'primary.main' }}>
              Edit User
            </DialogTitle>
            <Divider sx={{ mx: 3 }} />
            <DialogContent sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={editData.fullName || ''}
                    onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={editData.email || ''}
                    disabled
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={editData.role || 'patient'}
                      label="Role"
                      onChange={(e) => setEditData({...editData, role: e.target.value})}
                    >
                      <MenuItem value="patient">Patient</MenuItem>
                      <MenuItem value="doctor">Doctor</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editData.isActive || false}
                        onChange={(e) => setEditData({...editData, isActive: e.target.checked})}
                      />
                    }
                    label="Active"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editData.isBlocked || false}
                        onChange={(e) => setEditData({...editData, isBlocked: e.target.checked})}
                      />
                    }
                    label="Blocked"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
              <Button onClick={() => setEditDialog(false)} variant="outlined">
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} variant="contained">
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog 
            open={deleteDialog} 
            onClose={() => setDeleteDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <DialogTitle sx={{ color: 'error.main', fontWeight: 600 }}>
              Confirm Deletion
            </DialogTitle>
            <DialogContent>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <WarningIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  Are you sure you want to delete this user?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser?.fullName} ({selectedUser?.email})
                </Typography>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This action cannot be undone!
                </Alert>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
              <Button onClick={() => setDeleteDialog(false)} variant="outlined">
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} variant="contained" color="error">
                Delete User
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default UserManagement;