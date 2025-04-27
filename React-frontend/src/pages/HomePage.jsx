import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Box, Typography, Button, Paper, 
  Divider, CircularProgress, TextField, Avatar, Card, CardContent,
  useTheme, alpha, useMediaQuery
} from '@mui/material';
import { 
  Add as AddIcon, 
  Explore as ExploreIcon,
  Bookmark as BookmarkIcon,
  Timeline as TimelineIcon,
  ForumOutlined as ForumIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { AuthContext } from '../contexts/AuthContext';
import { postApi, userApi } from '../services/api';
import PostCard from '../components/PostCard';
import SuggestedUserCard from '../components/SuggestedUserCard';
import TrendingSkillsCard from '../components/TrendingSkillsCard';
import CreatePostDialog from '../components/CreatePostDialog';
import { getFullImageUrl } from '../utils/imageUtils';

export default function HomePage() {
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Get both feeds and combine them
  const { data: feedData, isLoading: feedLoading } = useQuery(
    ['allPosts'],
    () => postApi.getFeed(),
    {
      enabled: isAuthenticated,
      staleTime: 60000, // 1 minute
    }
  );

  const { data: exploreData, isLoading: exploreLoading } = useQuery(
    ['explorePosts'],
    () => postApi.getExploreFeed(),
    {
      enabled: isAuthenticated,
      staleTime: 60000, // 1 minute
    }
  );

  const { data: suggestedUsersData } = useQuery(
    ['suggestedUsers'],
    () => userApi.getSuggestedUsers(),
    {
      enabled: isAuthenticated,
      staleTime: 300000, // 5 minutes
    }
  );

  // Combine both feed and explore posts
  const feedPosts = feedData?.data?.content || [];
  const explorePosts = exploreData?.data?.content || [];
  
  // Remove duplicates when combining posts
  const allPosts = [...feedPosts];
  explorePosts.forEach(post => {
    if (!allPosts.some(p => p.id === post.id)) {
      allPosts.push(post);
    }
  });
  
  const isLoading = feedLoading || exploreLoading;

  return (
    <Box sx={{ 
      backgroundColor: alpha(theme.palette.primary.light, 0.05),
      minHeight: '100vh',
      pt: 2,
      pb: 6
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Main content */}
          <Grid item xs={12} md={8}>
            <Card elevation={3} sx={{ 
              p: 2, 
              mb: 3, 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <TimelineIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 'bold',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Skill Share Feed
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => setCreatePostOpen(true)}
                  sx={{ 
                    borderRadius: 8,
                    px: 3,
                    py: 1,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                >
                  Create Post
                </Button>
              </Box>
            </Card>

            {isLoading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                py: 8,
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Loading amazing content...
                </Typography>
              </Box>
            ) : allPosts.length === 0 ? (
              <Card sx={{ 
                p: 4, 
                textAlign: 'center',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <ExploreIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Your feed is waiting for content
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                  Start following people with similar interests to see their posts here, or explore new skills and topics to discover!
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/explore')}
                  size="large"
                  startIcon={<ExploreIcon />}
                  sx={{ 
                    borderRadius: 6,
                    px: 4,
                    py: 1.5,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}
                >
                  Find People to Follow
                </Button>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {allPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </Box>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              position: 'sticky', 
              top: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}>
              {/* User Profile Card */}
              {currentUser && (
                <Card elevation={3} sx={{ 
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
                  overflow: 'visible',
                  position: 'relative'
                }}>
                  <Box sx={{ 
                    p: 3,
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: isTablet ? 'row' : 'column',
                      alignItems: isTablet ? 'center' : 'flex-start',
                      mb: 2,
                      gap: 2
                    }}>
                      <Avatar
                        src={getFullImageUrl(currentUser.profilePicture) || '/default-avatar.png'}
                        alt={currentUser.name}
                        sx={{ 
                          width: 80, 
                          height: 80,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          border: `3px solid ${theme.palette.background.paper}`
                        }}
                      />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {currentUser.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: theme.palette.primary.main,
                            fontWeight: 500,
                            mb: 1
                          }}
                        >
                          @{currentUser.username}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex',
                          gap: 2, 
                          alignItems: 'center',
                          flexWrap: 'wrap'
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'text.secondary'
                          }}>
                            <BookmarkIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">Saved</Typography>
                          </Box>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'text.secondary'
                          }}>
                            <ForumIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">Messages</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Button 
                      fullWidth 
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate(`/profile/${currentUser.id}`)}
                      sx={{ 
                        borderRadius: 6,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        py: 1,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      View Profile
                    </Button>
                  </Box>
                </Card>
              )}

              {/* Trending Skills */}
              <Card elevation={3} sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`
              }}>
                <Box sx={{ 
                  p: 0.5, 
                  background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`
                }} />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrophyIcon color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Trending Skills
                    </Typography>
                  </Box>
                  <TrendingSkillsCard sx={{ boxShadow: 'none', background: 'transparent', p: 0 }} />
                </CardContent>
              </Card>

              {/* Suggested Users */}
              <Card elevation={3} sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`
              }}>
                <Box sx={{ 
                  p: 0.5, 
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`
                }} />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ExploreIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      People to Connect With
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {suggestedUsersData?.data?.slice(0, 3).map(user => (
                      <SuggestedUserCard key={user.id} user={user} />
                    ))}
                    {!suggestedUsersData?.data?.length && (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No suggestions available
                      </Typography>
                    )}
                  </Box>
                  <Button 
                    fullWidth 
                    sx={{ 
                      mt: 2, 
                      borderRadius: 6,
                      py: 1,
                      fontWeight: 'medium',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                    onClick={() => navigate('/explore')}
                  >
                    Discover More People
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>

        <CreatePostDialog 
          open={createPostOpen} 
          onClose={() => setCreatePostOpen(false)} 
        />
      </Container>
    </Box>
  );
}
