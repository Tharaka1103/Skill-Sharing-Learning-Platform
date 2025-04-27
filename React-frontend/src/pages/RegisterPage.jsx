import { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, TextField, Button, Grid,
  Link, Paper, Divider, Alert, CircularProgress,
  Stepper, Step, StepLabel, StepConnector, styled, useTheme
} from '@mui/material';
import { stepConnectorClasses } from '@mui/material/StepConnector';
import { 
  Google as GoogleIcon, 
  GitHub as GitHubIcon, 
  School as SchoolIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../contexts/AuthContext';

const steps = ['Create Account', 'Personal Details'];

const validationSchema = [
  // Step 1 validation
  Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  }),
  // Step 2 validation
  Yup.object({
    bio: Yup.string().max(250, 'Bio must be at most 250 characters'),
    skills: Yup.string(),
    interests: Yup.string(),
  }),
];

// Custom styled step connector
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(95deg, #2979ff 0%, #6B73FF 50%, #9546C4 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(95deg, #2979ff 0%, #6B73FF 50%, #9546C4 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

// Custom styled step icon
const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 45,
  height: 45,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  ...(ownerState.active && {
    backgroundImage: 'linear-gradient(136deg, #2979ff 0%, #6B73FF 50%, #9546C4 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundImage: 'linear-gradient(136deg, #2979ff 0%, #6B73FF 50%, #9546C4 100%)',
  }),
}));

// Custom step icon component
function ColorlibStepIcon(props) {
  const { active, completed, className } = props;

  const icons = {
    1: completed ? <CheckIcon /> : "1",
    2: completed ? <CheckIcon /> : "2",
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

export default function RegisterPage() {
  const theme = useTheme();
  const { register } = useContext(AuthContext);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      bio: '',
      skills: '',
      interests: '',
    },
    validationSchema: validationSchema[activeStep],
    onSubmit: async (values) => {
      if (activeStep === 0) {
        // Move to next step
        setActiveStep(1);
      } else {
        // Final submission
        setIsLoading(true);
        setError('');
        
        try {
          const skillsArray = values.skills
            ? values.skills.split(',').map(s => s.trim()).filter(Boolean)
            : [];
            
          const interestsArray = values.interests
            ? values.interests.split(',').map(s => s.trim()).filter(Boolean)
            : [];
            
          const userData = {
            name: values.name,
            email: values.email,
            password: values.password,
            bio: values.bio || '',
            skills: skillsArray,
            interests: interestsArray
          };
          
          const result = await register(
            values.name,
            values.email,
            values.password,
            {
              bio: values.bio,
              skills: skillsArray,
              interests: interestsArray,
            }
          );
          
          if (result && result.success) {
            // Redirect to login page with success message
            navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
          } else {
            setError(result?.message || 'Registration failed. Please try again.');
          }
        } catch (err) {
          setError('An unexpected error occurred. Please try again.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    },
  });

  const handleBack = () => {
    setActiveStep(0);
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `http://localhost:4000/oauth2/authorize/${provider}?redirect_uri=${window.location.origin}/oauth2/redirect`;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
          </>
        );
      case 1:
        return (
          <>
            <TextField
              margin="normal"
              fullWidth
              id="bio"
              label="Bio (optional)"
              name="bio"
              multiline
              rows={3}
              value={formik.values.bio}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.bio && Boolean(formik.errors.bio)}
              helperText={formik.touched.bio && formik.errors.bio}
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
              fullWidth
              id="skills"
              label="Skills (comma separated, optional)"
              name="skills"
              placeholder="E.g. Programming, Design, Photography"
              value={formik.values.skills}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.skills && Boolean(formik.errors.skills)}
              helperText={formik.touched.skills && formik.errors.skills}
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
              fullWidth
              id="interests"
              label="Interests (comma separated, optional)"
              name="interests"
              placeholder="E.g. Music, Cooking, Travel"
              value={formik.values.interests}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.interests && Boolean(formik.errors.interests)}
              helperText={formik.touched.interests && formik.errors.interests}
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
          </>
        );
      default:
        return null;
    }
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
            Join our community today
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
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel 
            connector={<ColorlibConnector />}
            sx={{ mb: 4 }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

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

          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            {renderStepContent()}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              {activeStep > 0 ? (
                <Button
                  onClick={handleBack}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    color: '#2979ff',
                    '&:hover': {
                      backgroundColor: 'rgba(41, 121, 255, 0.08)'
                    }
                  }}
                >
                  Back
                </Button>
              ) : (
                <Box />
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{ 
                  py: 1.2,
                  px: 4,
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
              >
                {isLoading ? <CircularProgress size={24} /> : 
                  activeStep === steps.length - 1 ? 'Register' : 'Next'}
              </Button>
            </Box>
          </Box>

          {activeStep === 0 && (
            <>
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
            </>
          )}

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/login" 
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
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
