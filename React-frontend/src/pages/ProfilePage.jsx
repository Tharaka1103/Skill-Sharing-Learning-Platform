import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Box, Typography, Button, Avatar, Paper,
  Tabs, Tab, Divider, CircularProgress, Chip, IconButton, Snackbar, Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  PersonAdd as FollowIcon,
  Check as FollowingIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userApi, postApi, learningPlanApi } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import LearningPlanCard from '../components/LearningPlanCard';
import FollowDialog from '../components/FollowDialog';

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const [followDialogType, setFollowDialogType] = useState('followers');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  
  const { userId } = useParams();
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  // Extract user data from response
  // Handle different response formats from different endpoints
  const user = userData?.data || userData;
  const isFollowing = user?.isFollowing;
  
  // Extract posts and learning plans
  const posts = postsData?.data?.content || postsData?.data || [];
  const learningPlans = learningPlansData?.data || [];

  // Log data for debugging
  useEffect(() => {
    if (userData) {
      console.log("User data:", userData);
    }
  }, [userData]);

  if (userLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (userError || !user) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          User not found
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Go to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        {/* Cover Photo */}
        <Box
          sx={{
            height: 200,
            bgcolor: 'primary.light',
            position: 'relative',
            backgroundImage: user.coverPhoto ? `url(${user.coverPhoto})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <Box sx={{ p: 3, position: 'relative' }}>
          {/* Profile Picture */}
          <Avatar
            src={user.profilePicture}
            alt={user.name}
            sx={{
              width: 120,
              height: 120,
              border: '4px solid white',
              position: 'absolute',
              top: -60,
              left: 24,
            }}
          />

          {/* Profile Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            {isOwnProfile ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate('/edit-profile')}
              >
                Edit Profile
              </Button>
            ) : isAuthenticated && (
              <Button
                variant={isFollowing ? "outlined" : "contained"}
                startIcon={isFollowing ? <FollowingIcon /> : <FollowIcon />}
                onClick={handleFollowToggle}
                disabled={followMutation.isLoading || unfollowMutation.isLoading}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </Box>

          {/* Profile Info */}
          <Box sx={{ mt: 5 }}>
            <Typography variant="h5" fontWeight="bold">
              {user.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              @{user.username}
            </Typography>
            
            {user.bio && (
              <Typography variant="body1" paragraph>
                {user.bio}
              </Typography>
            )}

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 3, my: 2 }}>
              <Box 
                sx={{ cursor: 'pointer' }}
                onClick={handleFollowersClick}
              >
                <Typography variant="h6" component="span">
                  {user.followerCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  Followers
                </Typography>
              </Box>
              
              <Box 
                sx={{ cursor: 'pointer' }}
                onClick={handleFollowingClick}
              >
                <Typography variant="h6" component="span">
                  {user.followingCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  Following
                </Typography>
              </Box>
            </Box>

            {/* Skills */}
            {user.skills?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {user.skills.map((skill) => (
                    <Chip 
                      key={skill} 
                      label={skill} 
                      size="small"
                      onClick={() => navigate(`/explore?skill=${encodeURIComponent(skill)}`)}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Posts" />
          <Tab label="Learning Plans" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 ? (
        /* Posts */
        postsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No posts yet
            </Typography>
            {isOwnProfile && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/create-post')}
                sx={{ mt: 2 }}
              >
                Create your first post
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item xs={12} key={post.id}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        /* Learning Plans */
        plansLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : learningPlans.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No learning plans yet
            </Typography>
            {isOwnProfile && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/learning-plans/create')}
                sx={{ mt: 2 }}
              >
                Create a learning plan
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {learningPlans.map((plan) => (
              <Grid item xs={12} md={6} key={plan.id}>
                <LearningPlanCard plan={plan} />
              </Grid>
            ))}
          </Grid>
        )
      )}

      {/* Followers/Following Dialog */}
      <FollowDialog
        open={followDialogOpen}
        onClose={() => setFollowDialogOpen(false)}
        userId={userId}
        type={followDialogType}
        username={user.username}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
