import { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, Grid, 
  Link, Paper, Divider, Alert, CircularProgress, useTheme
} from '@mui/material';
import { Google as GoogleIcon, GitHub as GitHubIcon, School as SchoolIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../contexts/AuthContext';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function LoginPage() {
  const theme = useTheme();
  const { login, isAuthenticated } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Check for success message from registration
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [isAuthenticated, navigate, location]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError('');
      
      try {
        const result = await login(values.email, values.password);
        
        if (result.success) {
          console.log("Login successful, redirecting to home page");
          setTimeout(() => navigate('/'), 1000); // Add a small delay before redirect
        } else {
          setError(result.message || 'Login failed. Please check your credentials.');
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleOAuthLogin = (provider) => {
    window.location.href = `http://localhost:4000/oauth2/authorize/${provider}?redirect_uri=${window.location.origin}/oauth2/redirect`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
        display: 'flex',
        alignItems: 'center',
        backgroundSize: 'cover',
        position: 'relative',
        py: 6,
      }}
    >
      {/* Decorative elements */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        opacity: 0.05,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="1" fill-rule="evenodd"/%3E%3C/svg%3E")',
      }} />

      <Container maxWidth="sm">
        <Box 
          sx={{ 
            mb: 4, 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              p: 2,
              mb: 2,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            <SchoolIcon sx={{ fontSize: 40, color: '#2979ff' }} />
          </Box>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              color: 'white', 
              fontWeight: 700,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              mb: 1
            }}
          >
            SkillShare
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white', 
              opacity: 0.9,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            Welcome back!
          </Typography>
        </Box>

        <Paper 
          elevation={5} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 245, 255, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 40px rgba(0, 13, 255, 0.15), 0 1px 2px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                borderRadius: 2
              }}
            >
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                borderRadius: 2
              }}
            >
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                  }
                }
              }}
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
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                  }
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(41, 121, 255, 0.2)',
                background: 'linear-gradient(90deg, #2979ff, #1565c0)',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(41, 121, 255, 0.3)',
                  transform: 'translateY(-2px)'
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Box sx={{ mt: 2, mb: 3 }}>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link 
                    href="#" 
                    variant="body2" 
                    sx={{ 
                      color: '#1565c0',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'none',
                        color: '#0d47a1'
                      }
                    }}
                  >
                    Forgot password?
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>

          <Divider sx={{ 
            my: 3, 
            '&::before, &::after': {
              borderColor: 'rgba(0, 0, 0, 0.1)',
            },
            '& .MuiDivider-wrapper': {
              px: 2,
              color: 'text.secondary'
            }
          }}>
            or
          </Divider>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => handleOAuthLogin('google')}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: '#757575',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderColor: 'rgba(0, 0, 0,.23)',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              Continue with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GitHubIcon />}
              onClick={() => handleOAuthLogin('github')}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: '#333',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderColor: 'rgba(0, 0, 0, .23)',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              Continue with GitHub
            </Button>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Don't have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/register" 
                variant="body2"
                sx={{ 
                  color: '#2979ff',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
