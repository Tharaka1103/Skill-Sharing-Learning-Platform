import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Box, Typography, Button, Avatar, Paper,
  Tabs, Tab, Divider, CircularProgress, Chip, IconButton, Snackbar, Alert, Fab,
  useTheme, useMediaQuery, alpha, styled
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  PersonAdd as FollowIcon,
  Check as FollowingIcon,
  PostAdd as PostAddIcon,
  PlaylistAdd as PlanAddIcon,
  BookmarkAdd as ProgressAddIcon,
  Delete as DeleteIcon,
  Explore as ExploreIcon,
  Favorite as FavoriteIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userApi, postApi, learningPlanApi, learningProgressApi } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import LearningPlanCard from '../components/LearningPlanCard';
import LearningProgressCard from '../components/LearningProgressCard';
import FollowDialog from '../components/FollowDialog';
import CreatePostDialog from '../components/CreatePostDialog';
import CreateProgressDialog from '../components/CreateProgressDialog';
import { getFullImageUrl } from '../utils/imageUtils';

// Custom styled components
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  fontWeight: 600,
  fontSize: '0.95rem',
  marginRight: theme.spacing(3),
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
  '&.Mui-focusVisible': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.85rem',
    marginRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

const ProfileStat = styled(Box)(({ theme }) => ({
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: 12,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.07),
    transform: 'translateY(-3px)',
  },
}));

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const [followDialogType, setFollowDialogType] = useState('followers');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
  const [createProgressDialogOpen, setCreateProgressDialogOpen] = useState(false);
  const [progressToEdit, setProgressToEdit] = useState(null);
  
  const { userId } = useParams();
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  // Determine if this is the current user's profile
  const isOwnProfile = currentUser?.id === userId;

  // Fetch user data - use the correct endpoint based on whether it's the current user or another user
  const { data: userData, isLoading: userLoading, error: userError } = useQuery(
    ['user', userId],
    () => isOwnProfile ? userApi.getUser() : userApi.getUserById(userId),
    {
      enabled: !!userId,
      staleTime: 60000, // 1 minute
      onError: (error) => {
        console.error("Error fetching user:", error);
        setErrorMessage("Failed to load user profile. Please try again.");
        setShowError(true);
      }
    }
  );

  // Fetch user posts
  const { data: postsData, isLoading: postsLoading } = useQuery(
    ['userPosts', userId],
    () => postApi.getUserPosts(userId),
    {
      enabled: !!userId && tabValue === 0,
      staleTime: 60000, // 1 minute
    }
  );

  // Fetch user learning plans
  const { data: learningPlansData, isLoading: plansLoading } = useQuery(
    ['userLearningPlans', userId],
    () => learningPlanApi.getUserPlans(userId),
    {
      enabled: !!userId && tabValue === 1,
      staleTime: 60000, // 1 minute
    }
  );
  
  // Fetch user learning progress
  const { data: progressData, isLoading: progressLoading } = useQuery(
    ['userProgress', userId],
    () => learningProgressApi.getUserProgress(userId),
    {
      enabled: !!userId && tabValue === 2,
      staleTime: 60000, // 1 minute
    }
  );

  // Follow user mutation
  const followMutation = useMutation(
    () => userApi.followUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user', userId]);
      },
      onError: (error) => {
        console.error("Error following user:", error);
        setErrorMessage("Failed to follow user. Please try again.");
        setShowError(true);
      }
    }
  );

  // Unfollow user mutation
  const unfollowMutation = useMutation(
    () => userApi.unfollowUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user', userId]);
      },
      onError: (error) => {
        console.error("Error unfollowing user:", error);
        setErrorMessage("Failed to unfollow user. Please try again.");
        setShowError(true);
      }
    }
  );
  
  // Delete progress mutation
  const deleteProgressMutation = useMutation(
    (progressId) => learningProgressApi.deleteProgress(progressId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['userProgress', userId]);
        setErrorMessage("Learning progress deleted successfully.");
        setShowError(true);
      },
      onError: (error) => {
        console.error("Error deleting progress:", error);
        setErrorMessage("Failed to delete learning progress. Please try again.");
        setShowError(true);
      }
    }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFollowToggle = () => {
    if (user?.isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const handleFollowersClick = () => {
    setFollowDialogType('followers');
    setFollowDialogOpen(true);
  };

  const handleFollowingClick = () => {
    setFollowDialogType('following');
    setFollowDialogOpen(true);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCreatePost = () => {
    setCreatePostDialogOpen(true);
  };

  const handleCreateLearningPlan = () => {
    navigate('/learning-plans/create');
  };
  
  const handleCreateProgress = () => {
    setProgressToEdit(null);
    setCreateProgressDialogOpen(true);
  };
  
  const handleEditProgress = (progress) => {
    setProgressToEdit(progress);
    setCreateProgressDialogOpen(true);
  };
  
  const handleDeleteProgress = (progressId) => {
    if (window.confirm('Are you sure you want to delete this learning progress?')) {
      deleteProgressMutation.mutate(progressId);
    }
  };

  // Extract user data from response
  // Handle different response formats from different endpoints
  const user = userData?.data?.data || userData?.data || userData;
  const isFollowing = user?.isFollowing || false;  
  // Extract posts and learning plans
  const posts = postsData?.data?.content || postsData?.data || [];
  const learningPlans = learningPlansData?.data?.content || learningPlansData?.content || [];
  const learningProgress = progressData?.data?.content || progressData?.data || [];

  // Log data for debugging
  useEffect(() => {
    if (userData) {
      console.log("User data:", userData);
    }
    if (learningPlansData) {
      console.log("Learning plans data:", learningPlansData);
    }
    if (progressData) {
      console.log("Learning progress data:", progressData);
    }
  }, [userData, learningPlansData, progressData]);

  if (userLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress 
          size={60} 
          thickness={4} 
          sx={{ 
            color: theme.palette.primary.main,
            boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`
          }} 
        />
        <Typography variant="h6" color="text.secondary" fontWeight={500}>
          Loading profile...
        </Typography>
      </Box>
    );
  }

  if (userError || !user) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Box
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.error.light, 0.1),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.1)}`
          }}
        >
          <PersonIcon sx={{ fontSize: 60, color: theme.palette.error.main, opacity: 0.7 }} />
          <Typography variant="h5" gutterBottom color="error.main" fontWeight={600}>
            User not found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            The profile you're looking for doesn't exist or you don't have permission to view it.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            startIcon={<ExploreIcon />}
            sx={{ 
              mt: 2,
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: theme.shadows[4],
              '&:hover': {
                boxShadow: theme.shadows[8],
                transform: 'translateY(-2px)'
              }
            }}
          >
            Go to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mb: 8 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 4, 
          overflow: 'hidden', 
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: `0 8px 40px ${alpha(theme.palette.primary.main, 0.08)}`,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: `0 10px 50px ${alpha(theme.palette.primary.main, 0.1)}`
          }
        }}
      >
        {/* Cover Photo */}
        <Box
          sx={{
            height: { xs: 160, sm: 200, md: 250 },
            bgcolor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.primary.dark, 0.4) 
              : alpha(theme.palette.primary.light, 0.3),
            position: 'relative',
            backgroundImage: user.coverPicture ? `url(${getFullImageUrl(user.coverPicture)})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '30%',
              background: `linear-gradient(to top, ${alpha(theme.palette.background.paper, 0.9)}, transparent)`,
              zIndex: 1
            }
          }}
        />
        
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative' }}>
          {/* Profile Picture */}
          <Avatar
            src={getFullImageUrl(user.profilePicture)}
            alt={user.name}
            sx={{
              width: { xs: 100, sm: 130, md: 150 },
              height: { xs: 100, sm: 130, md: 150 },
              border: `5px solid ${theme.palette.background.paper}`,
              position: 'absolute',
              top: { xs: -50, sm: -65, md: -75 },
              left: { xs: '50%', sm: 24 },
              transform: { xs: 'translateX(-50%)', sm: 'none' },
              boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: { xs: 'translateX(-50%) scale(1.03)', sm: 'scale(1.03)' },
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                border: `5px solid ${alpha(theme.palette.primary.main, 0.2)}`
              },
              zIndex: 2
            }}
          />

          {/* Profile Actions */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: { xs: 'center', sm: 'flex-end' }, 
            mb: { xs: 8, sm: 2 },
            mt: { xs: 6, sm: 0 }
          }}>
            {isOwnProfile ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate('/edit-profile')}
                sx={{
                  borderRadius: 8,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Edit Profile
              </Button>
            ) : isAuthenticated && (
              <Button
                variant={isFollowing ? "outlined" : "contained"}
                startIcon={isFollowing ? <FollowingIcon /> : <FollowIcon />}
                onClick={handleFollowToggle}
                disabled={followMutation.isLoading || unfollowMutation.isLoading}
                sx={{
                  borderRadius: 8,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  ...(isFollowing ? {
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.light, 0.1),
                      borderColor: theme.palette.error.main,
                      color: theme.palette.error.main
                    }
                  } : {
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-2px)'
                    }
                  }),
                  transition: 'all 0.2s ease'
                }}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </Box>

          {/* Profile Info */}
          <Box sx={{ 
            mt: { xs: 0, sm: 5 },
            textAlign: { xs: 'center', sm: 'left' },
            pl: { sm: '160px', md: '180px' }
          }}>
            <Typography 
              variant="h4" 
              fontWeight="bold"
              sx={{
                background: theme.palette.mode === 'dark' 
                  ? `-webkit-linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` 
                  : `-webkit-linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                letterSpacing: '0.5px'
              }}
            >
              {user.name}
            </Typography>
            
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                mb: 1.5,
                fontSize: { xs: '1rem', sm: '1.1rem' }
              }}
            >
              @{user.username}
            </Typography>
            
            {user.bio && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mt: 2,
                  mb: 3,
                  backgroundColor: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(8px)',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  maxWidth: { xs: '100%', md: '80%' },
                  mx: { xs: 'auto', sm: 0 }
                }}
              >
                <Typography 
                  variant="body1"
                  sx={{
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    color: theme.palette.text.primary,
                    fontSize: { xs: '0.95rem', sm: '1rem' }
                  }}
                >
                  {user.bio}
                </Typography>
              </Paper>
            )}

            {/* Stats */}
            <Box sx={{ 
              display: 'flex', 
              gap: 4, 
              mt: 3, 
              mb: 3,
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              <ProfileStat onClick={handleFollowersClick}>
                <Typography 
                  variant="h5" 
                  component="div"
                  fontWeight="bold"
                  color="primary.main"
                >
                  {user.followers?.length || user.followerCount || 0}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5 
                  }}
                >
                  <PersonIcon fontSize="small" />
                  Followers
                </Typography>
              </ProfileStat>
              
              <ProfileStat onClick={handleFollowingClick}>
                <Typography 
                  variant="h5" 
                  component="div"
                  fontWeight="bold"
                  color="secondary.main"
                >
                  {user.following?.length || user.followingCount || 0}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5 
                  }}
                >
                  <FavoriteIcon fontSize="small" />
                  Following
                </Typography>
              </ProfileStat>
            </Box>


            {/* Skills */}
            {user.skills?.length > 0 && (
              <Box sx={{ 
                mt: 3,
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mb: 1.5,
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                    fontWeight: 600
                  }}
                >
                  <SchoolIcon color="primary" />
                  Skills & Expertise
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1,
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}>
                  {user.skills.map((skill) => (
                    <Chip 
                      key={skill} 
                      label={skill} 
                      size="medium"
                      onClick={() => navigate(`/explore?skill=${encodeURIComponent(skill)}`)}
                      sx={{
                        borderRadius: 6,
                        fontWeight: 500,
                        px: 1,
                        background: `linear-gradient(45deg, ${alpha(theme.palette.primary.light, 0.7)}, ${alpha(theme.palette.secondary.light, 0.7)})`,
                        color: theme.palette.getContrastText(theme.palette.primary.light),
                        transition: 'all 0.2s ease',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        '&:hover': { 
                          transform: 'translateY(-3px)',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper 
        sx={{ 
          mb: 3, 
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: `0 4px 20px ${alpha(theme.palette.divider, 0.1)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          px: { xs: 1, sm: 2 }
        }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{ 
              flexGrow: 1,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 1.5,
                backgroundColor: theme.palette.primary.main
              }
            }}
          >
            <StyledTab 
              label="Posts" 
              icon={<PostAddIcon fontSize="small" />} 
              iconPosition="start"
            />
            <StyledTab 
              label="Learning Plans" 
              icon={<PlanAddIcon fontSize="small" />} 
              iconPosition="start"
            />
            <StyledTab 
              label="Learning Progress" 
              icon={<ProgressAddIcon fontSize="small" />} 
              iconPosition="start"
            />
          </Tabs>
          
          {/* Add buttons for creating content */}
          {isOwnProfile && !isMobile && (
            <Box sx={{ pr: 2 }}>
              {tabValue === 0 ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PostAddIcon />}
                  onClick={handleCreatePost}
                  size="medium"
                  sx={{ 
                    my: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 2,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  New Post
                </Button>
              ) : tabValue === 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlanAddIcon />}
                  onClick={handleCreateLearningPlan}
                  size="medium"
                  sx={{ 
                    my: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 2,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  New Learning Plan
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ProgressAddIcon />}
                  onClick={handleCreateProgress}
                  size="medium"
                  sx={{ 
                    my: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 2,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Track Progress
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 ? (
        /* Posts */
        postsLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            py: 6,
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <CircularProgress size={40} />
            <Typography variant="body1" color="text.secondary">
              Loading posts...
            </Typography>
          </Box>
        ) : posts.length === 0 ? (
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(theme.palette.divider, 0.1)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.6)})`,
              backdropFilter: 'blur(8px)'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Box 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  background: `linear-gradient(45deg, ${alpha(theme.palette.primary.light, 0.2)}, ${alpha(theme.palette.secondary.light, 0.2)})`,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`
                }}
              >
                <PostAddIcon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.7) }} />
              </Box>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                No posts yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 3 }}>
                {isOwnProfile 
                  ? "Share your knowledge and experiences with the community by creating your first post."
                  : "This user hasn't shared any posts yet."}
              </Typography>
              {isOwnProfile && (
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleCreatePost}
                  sx={{ 
                    mt: 2,
                    borderRadius: 8,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: 3,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-3px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Create your first post
                </Button>
              )}
            </Box>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item xs={12} key={post.id} sx={{ 
                transition: 'transform 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-5px)'
                }
              }}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>
        )
      ) : tabValue === 1 ? (
        /* Learning Plans */
        plansLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            py: 6,
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <CircularProgress size={40} />
            <Typography variant="body1" color="text.secondary">
              Loading learning plans...
            </Typography>
          </Box>
        ) : learningPlans.length === 0 ? (
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(theme.palette.divider, 0.1)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.6)})`,
              backdropFilter: 'blur(8px)'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Box 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  background: `linear-gradient(45deg, ${alpha(theme.palette.secondary.light, 0.2)}, ${alpha(theme.palette.primary.light, 0.2)})`,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.secondary.main, 0.15)}`
                }}
              >
                <PlanAddIcon sx={{ fontSize: 60, color: alpha(theme.palette.secondary.main, 0.7) }} />
              </Box>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                No learning plans yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 3 }}>
                {isOwnProfile 
                  ? "Structure your learning journey by creating a personalized learning plan."
                  : "This user hasn't created any learning plans yet."}
              </Typography>
              {isOwnProfile && (
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleCreateLearningPlan}
                  sx={{ 
                    mt: 2,
                    borderRadius: 8,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: 3,
                    background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-3px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Create a learning plan
                </Button>
              )}
            </Box>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {Array.isArray(learningPlans) ? learningPlans.map((plan) => (
              <Grid item xs={12} md={6} key={plan.id} sx={{ 
                transition: 'transform 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-5px)'
                }
              }}>
                <LearningPlanCard 
                  learningPlan={plan} 
                  isOwner={isOwnProfile}
                />
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    backgroundColor: alpha(theme.palette.error.light, 0.1)
                  }}
                >
                  <Typography variant="body1" color="error">
                    Error loading learning plans
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )
      ) : (
        /* Learning Progress */
        progressLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            py: 6,
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <CircularProgress size={40} />
            <Typography variant="body1" color="text.secondary">
              Loading learning progress...
            </Typography>
          </Box>
        ) : learningProgress.length === 0 ? (
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(theme.palette.divider, 0.1)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.6)})`,
              backdropFilter: 'blur(8px)'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Box 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  background: `linear-gradient(45deg, ${alpha(theme.palette.info.light, 0.2)}, ${alpha(theme.palette.success.light, 0.2)})`,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.15)}`
                }}
              >
                <ProgressAddIcon sx={{ fontSize: 60, color: alpha(theme.palette.success.main, 0.7) }} />
              </Box>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                No learning progress tracked yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 3 }}>
                {isOwnProfile 
                  ? "Track your learning achievements and monitor your progress toward your goals."
                  : "This user hasn't tracked any learning progress yet."}
              </Typography>
              {isOwnProfile && (
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleCreateProgress}
                  sx={{ 
                    mt: 2,
                    borderRadius: 8,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: 3,
                    background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-3px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Track your learning progress
                </Button>
              )}
            </Box>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {Array.isArray(learningProgress) ? learningProgress.map((progress) => (
              <Grid item xs={12} md={6} lg={4} key={progress.id}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: '100%', 
                    position: 'relative',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.06)}`,
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.1)}`
                    }
                  }}
                >
                  {isOwnProfile && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10, 
                      display: 'flex', 
                      gap: 1,
                      zIndex: 2
                    }}>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleEditProgress(progress)}
                        sx={{
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteProgress(progress.id)}
                        sx={{
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.2),
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      pr: 6,
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      mb: 0.5
                    }}
                  >
                    {progress.title}
                  </Typography>
                  
                  <Typography 
                    color="text.secondary" 
                    variant="body2" 
                    sx={{ 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: '0.85rem'
                    }}
                  >
                    <SchoolIcon fontSize="small" color="primary" sx={{ opacity: 0.7 }} />
                    {progress.type} • {progress.startDate && new Date(progress.startDate).toLocaleDateString()}
                    {progress.completionDate && ` → ${new Date(progress.completionDate).toLocaleDateString()}`}
                  </Typography>
                  
                  {progress.description && (
                    <Typography 
                      variant="body2" 
                      paragraph
                      sx={{
                        color: alpha(theme.palette.text.primary, 0.9),
                        fontSize: '0.9rem',
                        mb: 2,
                        lineHeight: 1.5
                      }}
                    >
                      {progress.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      mb: 0.5
                    }}>
                      <Typography 
                        variant="body2"
                        fontWeight={500}
                      >
                        Completion
                      </Typography>
                      <Typography 
                        variant="body2"
                        fontWeight={600}
                        color={
                          progress.completionPercentage >= 80 ? 'success.main' :
                          progress.completionPercentage >= 40 ? 'primary.main' :
                          'text.secondary'
                        }
                      >
                        {progress.completionPercentage || 0}%
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      backgroundColor: alpha(theme.palette.divider, 0.2), 
                      borderRadius: 2, 
                      height: 10, 
                      overflow: 'hidden',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <Box 
                        sx={{ 
                          width: `${progress.completionPercentage || 0}%`,
                          height: '100%',
                          background: progress.completionPercentage >= 80 
                            ? `linear-gradient(90deg, ${theme.palette.success.light}, ${theme.palette.success.main})` 
                            : progress.completionPercentage >= 40
                              ? `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`
                              : `linear-gradient(90deg, ${theme.palette.grey[400]}, ${theme.palette.grey[600]})`,
                          borderRadius: 2,
                          transition: 'width 1s ease-in-out'
                        }}
                      />
                    </Box>
                  </Box>
                  
                  {progress.skills?.length > 0 && (
                    <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                      {progress.skills.map(skill => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/explore?skill=${encodeURIComponent(skill)}`)}
                          sx={{
                            borderRadius: 4,
                            backgroundColor: alpha(theme.palette.secondary.light, 0.1),
                            borderColor: alpha(theme.palette.secondary.main, 0.2),
                            color: theme.palette.secondary.dark,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.secondary.light, 0.2),
                              borderColor: theme.palette.secondary.main,
                              transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  
                  {progress.resourceUrl && (
                    <Button 
                      variant="text" 
                      size="small" 
                      href={progress.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<ExploreIcon fontSize="small" />}
                      sx={{ 
                        mt: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      View Resource
                    </Button>
                  )}
                </Paper>
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  backgroundColor: alpha(theme.palette.error.light, 0.1)
                }}>
                  <Typography variant="body1" color="error">
                    Error loading learning progress
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )
      )}

      {/* Floating Action Button for quick creation with animation */}
      {isOwnProfile && (
        <Fab
          color="primary"
          aria-label={
            tabValue === 0 ? "add post" : 
            tabValue === 1 ? "add learning plan" :
            "track progress"
          }
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: tabValue === 0 
              ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` 
              : tabValue === 1 
                ? `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`
                : `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
            boxShadow: `0 4px 12px ${alpha(
              tabValue === 0 ? theme.palette.primary.main : 
              tabValue === 1 ? theme.palette.secondary.main : 
              theme.palette.success.main, 0.4
            )}`,
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: `0 6px 16px ${alpha(
                tabValue === 0 ? theme.palette.primary.main : 
                tabValue === 1 ? theme.palette.secondary.main : 
                theme.palette.success.main, 0.6
              )}`
            },
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onClick={
            tabValue === 0 ? handleCreatePost : 
            tabValue === 1 ? handleCreateLearningPlan :
            handleCreateProgress
          }
        >
          <AddIcon />
        </Fab>
      )}

      {/* Followers/Following Dialog */}
      <FollowDialog
        open={followDialogOpen}
        onClose={() => setFollowDialogOpen(false)}
        userId={userId}
        type={followDialogType}
        username={user.username}
      />

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={createPostDialogOpen}
        onClose={() => setCreatePostDialogOpen(false)}
      />
      
      {/* Create/Edit Progress Dialog */}
      {createProgressDialogOpen && (
        <CreateProgressDialog
          open={createProgressDialogOpen}
          onClose={() => {
            setCreateProgressDialogOpen(false);
            setProgressToEdit(null);
          }}
          progressToEdit={progressToEdit}
          userId={userId}
        />
      )}

      {/* Error Snackbar with improved styling */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error"
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
