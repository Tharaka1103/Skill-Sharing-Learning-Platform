import { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Card, CardHeader, CardContent, CardActions, Avatar,
  Typography, IconButton, Button, Box, Chip,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, ImageList, ImageListItem,
  useTheme, useMediaQuery, Divider, Paper, Tooltip, alpha
} from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ChatBubbleOutline as CommentIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from 'react-query';
import { AuthContext } from '../contexts/AuthContext';
import { postApi } from '../services/api';
import { getFullImageUrl } from '../utils/imageUtils';

export default function PostCard({ post }) {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const isOwner = currentUser?.id === post.userId;
  const isLiked = post.likedBy?.includes(currentUser?.id);
  const isSaved = post.savedBy?.includes(currentUser?.id);
  const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;

  const isVideo = (url) => {
    return url && url.match(/\.(mp4|webm|ogg)$/i);
  };

  const likeMutation = useMutation(
    () => isLiked ? postApi.unlikePost(post.id) : postApi.likePost(post.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['userPosts']);
        queryClient.invalidateQueries(['explorePosts']);
        queryClient.invalidateQueries(['feed']);
        queryClient.invalidateQueries(['post', post.id]);
      }
    }
  );

  const saveMutation = useMutation(
    () => isSaved ? postApi.unsavePost(post.id) : postApi.savePost(post.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['userPosts']);
        queryClient.invalidateQueries(['savedPosts']);
      }
    }
  );

  const deleteMutation = useMutation(
    () => postApi.deletePost(post.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['userPosts']);
        queryClient.invalidateQueries(['explorePosts']);
        queryClient.invalidateQueries(['feed']);
        setConfirmDelete(false);
      }
    }
  );

  const updateMutation = useMutation(
    (content) => postApi.updatePost(post.id, { 
      content,
      mediaUrls: post.mediaUrls, // Preserve the existing media URLs
      skillCategory: post.skillCategory // Preserve the skill category
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['userPosts']);
        queryClient.invalidateQueries(['explorePosts']);
        queryClient.invalidateQueries(['feed']);
        queryClient.invalidateQueries(['post', post.id]);
        setEditMode(false);
      }
    }
  );

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEdit = () => {
    setEditedContent(post.content);
    setEditMode(true);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() !== '') {
      updateMutation.mutate(editedContent);
    }
  };
  
  const API_BASE_URL = 'http://localhost:4000';
  
  const handleDeleteClick = () => {
    setConfirmDelete(true);
    handleMenuClose();
  };

  const handleLike = () => {
    if (currentUser) {
      likeMutation.mutate();
    }
  };

  const handleSave = () => {
    if (currentUser) {
      saveMutation.mutate();
    }
  };
  
  const handleMediaClick = (url) => {
    setSelectedMedia(url);
  };

  const handleProfileClick = () => {
    if (post.userId) {
      navigate(`/profile/${post.userId}`);
    }
  };

  const renderMedia = (url) => {
    const fullUrl = getFullImageUrl(url);
    if (isVideo(url)) {
      return (
        <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <video
            src={fullUrl}
            style={{ 
              width: '100%',
              maxWidth: '600px',
              borderRadius: 12,
              cursor: 'pointer',
              objectFit: 'contain',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              }
            }}
            onClick={() => handleMediaClick(fullUrl)}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: alpha(theme.palette.primary.main, 0.8),
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                transform: 'translate(-50%, -50%) scale(1.1)',
              }
            }}
          >
            <PlayArrowIcon
              sx={{
                fontSize: 36,
                color: 'white',
              }}
            />
          </Box>
        </Box>
      );
    }
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <img
          src={fullUrl}
          alt="Post media"
          style={{ 
            width: '100%',
            maxWidth: '600px',
            borderRadius: 12,
            cursor: 'pointer',
            objectFit: 'contain',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
          }}
          onClick={() => handleMediaClick(fullUrl)}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        />
      </Box>
    );
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return format(postDate, 'MMM d, yyyy • h:mm a');
    }
  };

  return (
    <Card 
      elevation={0} 
      sx={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        mb: 3,
        borderRadius: 3,
        backgroundColor: '#fff',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.divider, 0.8) : alpha(theme.palette.divider, 0.3),
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
          transform: 'translateY(-2px)'
        },
        overflow: 'visible'
      }}
    >
      <CardHeader
        avatar={
          <Avatar 
            src={getFullImageUrl(post.userProfilePicture)} 
            alt={post.userName || "User"}
            sx={{
              width: 54,
              height: 54,
              border: `3px solid ${theme.palette.primary.main}`,
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1) rotate(5deg)',
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.5)}`,
                borderColor: theme.palette.secondary.main
              },
              objectFit: 'cover',
              cursor: 'pointer'
            }}
            onClick={handleProfileClick}
          />
        }
        action={
          isOwner && (
            <Tooltip title="Post options">
              <IconButton 
                onClick={handleMenuOpen}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  transition: 'all 0.2s',
                  borderRadius: 2
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          )
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography 
              variant="h6"
              component="span"
              onClick={handleProfileClick}
              sx={{ 
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                color: theme.palette.text.primary,
                '&:hover': { 
                  background: `-webkit-linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }
              }}
            >
              {post.userName || "Unknown User"}
            </Typography>
            {post.username && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                component="span"
                sx={{ ml: 1 }}
              >
                @{post.username}
              </Typography>
            )}
          </Box>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: '0.8rem',
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.primary.main, 0.07),
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              {getTimeAgo(post.createdAt)}
            </Typography>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ pt: 0, px: { xs: 2, sm: 3 } }}>
        {editMode ? (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2
                  }
                }
              }}
            />
            
            {/* Display existing media during edit mode but make it clear it can't be changed */}
            {hasMedia && (
              <Box sx={{ my: 2 }}>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'block', 
                    mb: 1,
                    fontStyle: 'italic',
                    backgroundColor: alpha(theme.palette.warning.light, 0.2),
                    p: 1,
                    borderRadius: 1
                  }}
                >
                  Media cannot be changed during edit
                </Typography>
                {post.mediaUrls.length === 1 ? (
                  renderMedia(post.mediaUrls[0])
                ) : (
                  <ImageList 
                    cols={isMobile ? 1 : (post.mediaUrls.length > 3 ? 2 : post.mediaUrls.length)} 
                    gap={12}
                    sx={{ mb: 0, width: '100%', maxWidth: '600px', margin: '0 auto' }}
                  >
                    {post.mediaUrls.map((url, index) => (
                      <ImageListItem key={index}>
                        {renderMedia(url)}
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
              <Button 
                onClick={() => setEditMode(false)}
                variant="outlined"
                startIcon={<CloseIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 2,
                  borderColor: alpha(theme.palette.grey[500], 0.5),
                  '&:hover': {
                    borderColor: theme.palette.grey[500],
                    backgroundColor: alpha(theme.palette.grey[100], 0.5)
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSaveEdit}
                disabled={updateMutation.isLoading}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3, 
                  fontWeight: 600,
                  boxShadow: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  '&:hover': {
                    boxShadow: 4,
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
                  }
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography 
            variant="body1" 
            component="div" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
              letterSpacing: '0.015em',
              fontWeight: 400,
              color: theme.palette.text.primary,
            }}
          >
            {post.content}
          </Typography>
        )}
        
        {hasMedia && !editMode && (
          <Box sx={{ my: 2 }}>
            {post.mediaUrls.length === 1 ? (
              renderMedia(post.mediaUrls[0])
            ) : (
              <ImageList 
                cols={isMobile ? 1 : (post.mediaUrls.length > 3 ? 2 : post.mediaUrls.length)} 
                gap={12}
                sx={{ mb: 0, width: '100%', maxWidth: '600px', margin: '0 auto' }}
              >
                {post.mediaUrls.map((url, index) => (
                  <ImageListItem key={index}>
                    {renderMedia(url)}
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Box>
        )}
        
        {post.skillCategory && !editMode && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {post.skillCategory.split(',').map(skill => {
              const trimmedSkill = skill.trim();
              return trimmedSkill ? (
                <Chip 
                  key={trimmedSkill} 
                  label={trimmedSkill} 
                  size="small" 
                  component={RouterLink}
                  to={`/explore?skill=${encodeURIComponent(trimmedSkill)}`}
                  clickable
                  sx={{ 
                    textDecoration: 'none',
                    fontWeight: 500,
                    borderRadius: 4,
                    background: `linear-gradient(45deg, ${alpha(theme.palette.primary.light, 0.7)}, ${alpha(theme.palette.secondary.light, 0.7)})`,
                    color: theme.palette.getContrastText(theme.palette.primary.light),
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      transform: 'translateY(-2px) scale(1.05)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    },
                    px: 0.5
                  }}
                />
              ) : null;
            }).filter(Boolean)}
          </Box>
        )}
      </CardContent>
      
      <Divider sx={{ mx: 2, opacity: 0.6 }} />
      
      <CardActions disableSpacing sx={{ px: { xs: 2, sm: 3 }, py: 1.5, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={isLiked ? "Unlike" : "Like"}>
              <IconButton 
                onClick={handleLike}
                disabled={!currentUser || likeMutation.isLoading}
                color={isLiked ? "error" : "default"}
                sx={{
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'scale(1.15)' }
                }}
              >
                {isLiked ? (
                  <FavoriteIcon sx={{ color: theme.palette.error.main }} />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </IconButton>
            </Tooltip>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600, 
                color: isLiked ? theme.palette.error.main : theme.palette.text.secondary
              }}
            >
              {post.likesCount || 0}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Comment">
              <IconButton 
                component={RouterLink}
                to={`/posts/${post.id}`}
                sx={{
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'scale(1.15)' }
                }}
              >
                <CommentIcon sx={{ color: theme.palette.info.main }} />
              </IconButton>
            </Tooltip>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600, 
                color: theme.palette.info.main 
              }}
            >
              {post.commentsCount || 0}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isSaved ? "Unsave" : "Save"}>
            <IconButton 
              onClick={handleSave}
              disabled={!currentUser || saveMutation.isLoading}
              color={isSaved ? "primary" : "default"}
              sx={{
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'scale(1.15)' }
              }}
            >
              {isSaved ? (
                <BookmarkIcon sx={{ color: theme.palette.primary.main }} />
              ) : (
                <BookmarkBorderIcon />
              )}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Share">
            <IconButton
              sx={{
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'scale(1.15)' }
              }}
            >
              <ShareIcon sx={{ color: theme.palette.success.dark }} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>

      {/* Media Preview Dialog */}
      <Dialog 
        open={Boolean(selectedMedia)} 
        onClose={() => setSelectedMedia(null)}
        maxWidth="lg"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            overflow: 'hidden',
            bgcolor: 'black',
            boxShadow: 24
          }
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          right: 8, 
          top: 8, 
          zIndex: 1 
        }}>
          <IconButton 
            onClick={() => setSelectedMedia(null)}
            sx={{ 
              color: 'white', 
              bgcolor: 'rgba(0,0,0,0.4)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {selectedMedia && isVideo(selectedMedia) ? (
            <video 
              src={selectedMedia}
              controls
              autoPlay
              style={{ 
                width: '100%',
                maxHeight: '90vh',
                objectFit: 'contain'
              }}
            />
          ) : (
            <img 
              src={selectedMedia} 
              alt="Full size media" 
              style={{ 
                width: '100%',
                maxHeight: '90vh',
                objectFit: 'contain'
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Post Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 180,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={handleEdit}
          sx={{
            borderRadius: 1,
            mx: 0.5,
            mb: 0.5,
            py: 1.5,
            '&:hover': { 
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1.5, color: theme.palette.primary.main }} />
          <Typography fontWeight={500}>Edit Post</Typography>
        </MenuItem>
        <MenuItem 
          onClick={handleDeleteClick}
          sx={{
            borderRadius: 1,
            mx: 0.5,
            py: 1.5,
            '&:hover': { 
              bgcolor: alpha(theme.palette.error.main, 0.1)
            }
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: theme.palette.error.main }} />
          <Typography fontWeight={500} color="error.main">Delete Post</Typography>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={confirmDelete} 
        onClose={() => setConfirmDelete(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          color: theme.palette.error.main,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <DeleteIcon fontSize="small" />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mt: 1,
              bgcolor: alpha(theme.palette.error.light, 0.1),
              borderRadius: 2,
              borderLeft: `4px solid ${theme.palette.error.main}`
            }}
          >
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: theme.palette.text.secondary }}>
              All associated comments, likes, and saves will also be removed.
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setConfirmDelete(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => deleteMutation.mutate()} 
            color="error" 
            variant="contained"
            disabled={deleteMutation.isLoading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              fontWeight: 600,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                bgcolor: theme.palette.error.dark
              }
            }}
          >
            Delete Post
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
