import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import all necessary components from Material-UI
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Grid,
  Link // Import Link from MUI to get the theme styling
} from '@mui/material';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      // Your login logic remains the same
      const success = await login({ username, password });
      if (success) {
        navigate('/'); // Navigate to homepage on success
      } else {
        setError('Invalid username or password.'); // More specific error
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    // 'component="main"' is good for accessibility
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // Use 'background.paper' from the theme (White) to create a clean card
          // on top of the 'background.default' (Alabaster)
          backgroundColor: 'background.paper', 
          padding: { xs: 3, sm: 4 }, // Responsive padding
          borderRadius: 2, // Soft, rounded corners
        }}
      >
        {/* 1. Brand Name: Using the elegant 'Laginchy' font from the theme */}
        <Typography component="h1" variant="h5">
          NuaréSkyn
        </Typography>

        {/* 2. Tagline: Styled using 'subtitle1' from the theme */}
        <Typography variant="subtitle1" sx={{ mt: 1, mb: 3 }}>
          Tailored for you. Inspired by beauty.
        </Typography>
        
        {/* 3. Error Alert: Styled by the theme's MuiAlert override */}
        {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
            </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          {/* 4. Text Fields: Styled by the theme's MuiTextField override */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* 5. Button: Styled by the theme's MuiButton override */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary" // This now maps to the 'Soft Taupe' color
            sx={{ mt: 3, mb: 2, py: 1.5 }} // Add a bit more vertical padding
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          {/* 6. Links: Styled by the theme's MuiLink override */}
          <Grid container justifyContent="space-between">
            <Grid item>
              {/* This pattern applies MUI's Link styles to React Router's Link */}
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                Don't have an account?
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;