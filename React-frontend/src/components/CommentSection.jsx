import { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, Avatar, 
  List, ListItem, ListItemAvatar, ListItemText,
  IconButton, Menu, MenuItem, Divider,
  CircularProgress, Snackbar, Alert,
  Paper, alpha, styled, Collapse, Zoom, Fade,
  useTheme
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ChatBubbleOutline as CommentIcon,
  CheckCircleOutline as SuccessIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { AuthContext } from '../contexts/AuthContext';
import { commentApi, postApi } from '../services/api';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getFullImageUrl } from '../utils/imageUtils';

// Styled components for enhanced UI
const CommentSectionWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  position: 'relative',
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 1),
  },
}));

const CommentHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -10,
    left: 0,
    width: '100%',
    height: 1,
    background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.7)}, ${alpha(theme.palette.divider, 0.1)})`,
  }
}));

const CommentForm = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  backdropFilter: 'blur(10px)',
  boxShadow: `0 4px 20px ${alpha(theme.palette.divider, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 6px 24px ${alpha(theme.palette.divider, 0.15)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    border: `2px solid ${theme.palette.primary.main}`,
  },
}));

const CommentItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  backdropFilter: 'blur(8px)',
  boxShadow: `0 2px 12px ${alpha(theme.palette.divider, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 16px ${alpha(theme.palette.divider, 0.15)}`,
  },
  overflow: 'visible',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}));

const CommentContent = styled(Box)(({ theme }) => ({
  flex: 1,
  marginLeft: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    marginTop: theme.spacing(1),
    width: '100%',
  },
}));

const CommentAuthor = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(0.5),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}));

const CommentActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(1),
}));

const EmptyCommentsBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(5, 2),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.background.paper, 0.4),
  backdropFilter: 'blur(8px)',
  boxShadow: `0 4px 20px ${alpha(theme.palette.divider, 0.08)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 20,
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.background.paper, 1),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
    },
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(1, 3),
  transition: 'all 0.3s ease',
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
  },
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(1),
    width: '100%',
  },
}));

export default function CommentSection({ postId }) {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();
  const theme = useTheme();

  const { data, isLoading, isError } = useQuery(
    ['comments', postId],
    () => postApi.getComments(postId),
    {
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error("Error fetching comments:", error);
        setErrorMessage("Failed to load comments. Please try again.");
        setShowError(true);
      }
    }
  );

  // When adding a comment, invalidate the right queries
  const addCommentMutation = useMutation(
    (commentText) => postApi.createComment(postId, commentText),
    {
      onSuccess: () => {
        // Invalidate comment data
        queryClient.invalidateQueries(['comments', postId]);
        
        // Also invalidate queries that might show comment counts
        queryClient.invalidateQueries(['post', postId]);
        queryClient.invalidateQueries(['userPosts']);
        queryClient.invalidateQueries(['feed']);
        queryClient.invalidateQueries(['explorePosts']);
        
        setCommentText('');
        setSuccessMessage('Comment added successfully!');
        setShowSuccess(true);
      },
      onError: (error) => {
        console.error("Error adding comment:", error);
        setErrorMessage("Failed to add comment. Please try again.");
        setShowError(true);
      }
    }
  );

  const updateCommentMutation = useMutation(
    ({ commentId, commentData }) => commentApi.updateComment(commentId, commentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', postId]);
        setEditingComment(null);
        setSuccessMessage('Comment updated successfully!');
        setShowSuccess(true);
      },
      onError: (error) => {
        console.error("Error updating comment:", error);
        setErrorMessage("Failed to update comment. Please try again.");
        setShowError(true);
      }
    }
  );

  const deleteCommentMutation = useMutation(
    (commentId) => commentApi.deleteComment(commentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', postId]);
        queryClient.invalidateQueries(['post', postId]);
        queryClient.invalidateQueries(['userPosts']);
        queryClient.invalidateQueries(['feed']);
        queryClient.invalidateQueries(['explorePosts']);
        handleMenuClose();
        setSuccessMessage('Comment deleted successfully!');
        setShowSuccess(true);
      },
      onError: (error) => {
        console.error("Error deleting comment:", error);
        setErrorMessage("Failed to delete comment. Please try again.");
        setShowError(true);
        handleMenuClose();
      }
    }
  );

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      // Create a proper comment object with content property
      addCommentMutation.mutate({ content: commentText.trim() });
    }
  };

  const handleUpdateComment = () => {
    if (editText.trim()) {
      updateCommentMutation.mutate({
        commentId: editingComment.id,
        commentData: { content: editText }
      });
    }
  };

  const handleDeleteComment = () => {
    if (selectedComment) {
      deleteCommentMutation.mutate(selectedComment.id);
    }
  };

  const handleMenuOpen = (event, comment) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedComment(null);
  };

  const startEditComment = (comment) => {
    setEditingComment(comment);
    setEditText(comment.content);
    handleMenuClose();
  };

  const cancelEditComment = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleUserProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column',
        p: 4, 
        gap: 2 
      }}>
        <CircularProgress size={30} color="primary" />
        <Typography variant="body2" color="text.secondary">
          Loading comments...
        </Typography>
      </Box>
    );
  }
  
  if (isError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            borderRadius: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.25)}`
          }}
        >
          Failed to load comments. Please refresh and try again.
        </Alert>
      </Box>
    );
  }

  const comments = data?.data?.content || data?.data || [];
  
  return (
    <CommentSectionWrapper>
      <CommentHeader>
        <CommentIcon 
          sx={{ 
            fontSize: 28, 
            color: theme.palette.primary.main,
            mr: 1.5 
          }} 
        />
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Comments
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ ml: 1 }}
        >
          ({comments.length})
        </Typography>
      </CommentHeader>
      
      {currentUser && (
        <Fade in timeout={500}>
          <CommentForm component="form" onSubmit={handleSubmitComment}>
            <StyledAvatar 
              src={getFullImageUrl(currentUser.profilePicture) || '/default-avatar.png'}
              alt={currentUser?.name}
              sx={{ 
                width: 40, 
                height: 40,
                alignSelf: 'flex-start'
              }}
            />
            
            <Box sx={{ 
              flex: 1, 
              ml: { xs: 0, sm: 2 },
              mt: { xs: 2, sm: 0 },
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1
            }}>
              <StyledTextField
                fullWidth
                size="small"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                multiline
                maxRows={4}
                InputProps={{
                  sx: { 
                    pr: 1,
                    fontSize: '0.95rem'
                  }
                }}
              />
              <AnimatedButton 
                type="submit" 
                variant="contained" 
                disabled={!commentText.trim() || addCommentMutation.isLoading}
                endIcon={<SendIcon />}
                sx={{
                  background: addCommentMutation.isLoading 
                    ? theme.palette.action.disabledBackground 
                    : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  color: theme.palette.primary.contrastText,
                  minWidth: { xs: '100%', sm: 'auto' }
                }}
              >
                {addCommentMutation.isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                    Posting...
                  </Box>
                ) : "Post"}
              </AnimatedButton>
            </Box>
          </CommentForm>
        </Fade>
      )}

      {comments.length > 0 ? (
        <List sx={{ px: 0 }}>
          {comments.map((comment, index) => (
            <Zoom 
              in 
              style={{ transitionDelay: `${index * 50}ms` }}
              key={comment.id}
            >
              <CommentItem alignItems="flex-start">
                <StyledAvatar 
                  src={getFullImageUrl(comment.userProfilePicture) || '/default-avatar.png'}
                  alt={comment.userName || 'User'}
                  onClick={() => handleUserProfileClick(comment.userId)}
                  sx={{ 
                    cursor: 'pointer',
                    width: 46, 
                    height: 46
                  }}
                />
                
                <CommentContent>
                  {editingComment && editingComment.id === comment.id ? (
                    <Box sx={{ width: '100%' }}>
                      <StyledTextField
                        fullWidth
                        multiline
                        size="small"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        sx={{ mb: 1 }}
                        autoFocus
                        placeholder="Edit your comment..."
                      />
                      <CommentActions>
                        <Button 
                          size="small" 
                          onClick={cancelEditComment}
                          startIcon={<CancelIcon />}
                          sx={{ 
                            mr: 1,
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.light, 0.1),
                              color: theme.palette.error.main
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          onClick={handleUpdateComment}
                          disabled={!editText.trim() || updateCommentMutation.isLoading}
                          startIcon={updateCommentMutation.isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                          sx={{
                            borderRadius: 4,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            boxShadow: `0 3px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                            '&:hover': {
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                            }
                          }}
                        >
                          {updateCommentMutation.isLoading ? 'Saving...' : 'Save'}
                        </Button>
                      </CommentActions>
                    </Box>
                  ) : (
                    <>
                      <CommentAuthor>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant="subtitle2"
                            onClick={() => handleUserProfileClick(comment.userId)}
                            sx={{ 
                              cursor: 'pointer',
                              fontWeight: 600,
                              '&:hover': { 
                                textDecoration: 'underline',
                                color: theme.palette.primary.main 
                              }
                            }}
                          >
                            {comment.userName || 'Anonymous User'}
                          </Typography>
                          {comment.username && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ ml: 1 }}
                            >
                              @{comment.username}
                            </Typography>
                          )}
                        </Box>
                        
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            ml: { xs: 0, sm: 1 },
                            mt: { xs: 0.5, sm: 0 },
                            display: 'flex',
                            alignItems: 'center',
                            '&::before': {
                              content: {
                                xs: '""',
                                sm: '"•"'
                              },
                              mx: 1,
                              display: { xs: 'none', sm: 'inline' }
                            }
                          }}
                        >
                          {format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a')}
                        </Typography>
                      </CommentAuthor>
                      
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ 
                          whiteSpace: 'pre-line', 
                          mt: 1,
                          px: 0.5,
                          lineHeight: 1.6,
                          fontSize: '0.95rem'
                        }}
                      >
                        {comment.content}
                      </Typography>
                    </>
                  )}
                </CommentContent>
                
                {currentUser?.id === comment.userId && !editingComment && (
                  <IconButton 
                    edge="end" 
                    aria-label="comment options"
                    onClick={(e) => handleMenuOpen(e, comment)}
                    sx={{ 
                      ml: 1,
                      color: theme.palette.text.secondary,
                      opacity: 0.7,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        opacity: 1
                      }
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                )}
              </CommentItem>
            </Zoom>
          ))}
        </List>
      ) : (
        <Fade in timeout={500}>
          <EmptyCommentsBox>
            <CommentIcon 
              sx={{ 
                fontSize: 40, 
                color: alpha(theme.palette.text.secondary, 0.5), 
                mb: 1 
              }} 
            />
            <Typography variant="body1" color="text.secondary" fontWeight={500} gutterBottom>
              No comments yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to share your thoughts!
            </Typography>
          </EmptyCommentsBox>
        </Fade>
      )}

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 150,
            overflow: 'visible',
            boxShadow: `0 5px 15px ${alpha(theme.palette.common.black, 0.15)}`,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: theme.palette.background.paper,
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={() => startEditComment(selectedComment)}
          sx={{ 
            py: 1.5,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }
          }}
        >
          <ListItemIcon sx={{ color: theme.palette.primary.main }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Edit
          </Typography>
        </MenuItem>
        
        <MenuItem 
          onClick={handleDeleteComment}
          sx={{ 
            py: 1.5,
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.1),
            }
          }}
        >
          <ListItemIcon sx={{ color: theme.palette.error.main }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.error.main }}>
            Delete
          </Typography>
        </MenuItem>
      </Menu>

      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 6,
            boxShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.3)}`,
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={showSuccess} 
        autoHideDuration={3000} 
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleCloseSuccess} 
          severity="success" 
          variant="filled"
          icon={<SuccessIcon fontSize="inherit" />}
          sx={{ 
            width: '100%',
            borderRadius: 6,
            boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.3)}`,
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </CommentSectionWrapper>
  );
}

