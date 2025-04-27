import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, IconButton, Box, Chip, CircularProgress,
  Typography, Alert, useTheme, useMediaQuery, alpha, Divider,
  Paper, Tooltip, Zoom, styled
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Add as AddIcon, 
  PhotoCamera, 
  EmojiEmotions as EmojiIcon,
  Send as SendIcon,
  Tag as TagIcon,
  CancelOutlined as CancelIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { useMutation, useQueryClient } from 'react-query';
import { postApi } from '../services/api';

// Custom styled components
const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: 16,
  fontWeight: 500,
  transition: 'all 0.2s ease',
  background: `linear-gradient(45deg, ${alpha(theme.palette.primary.light, 0.8)}, ${alpha(theme.palette.secondary.light, 0.8)})`,
  color: theme.palette.getContrastText(theme.palette.primary.light),
  '&:hover': { 
    transform: 'translateY(-2px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  },
  '& .MuiChip-deleteIcon': {
    color: 'inherit',
    '&:hover': {
      color: theme.palette.error.light
    }
  }
}));

const ContentTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.3s ease',
    fontSize: '1rem',
    lineHeight: 1.5,
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
    },
    '& fieldset': {
      borderColor: alpha(theme.palette.divider, 0.7)
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.light
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    }
  }
}));

export default function CreatePostDialog({ open, onClose }) {
  const [content, setContent] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const createPostMutation = useMutation(
    (postData) => postApi.createPost(postData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['feed']);
        queryClient.invalidateQueries(['userPosts']);
        resetForm();
        onClose();
      },
      onError: (err) => {
        console.error('Error creating post:', err);
        setError(err.response?.data?.message || 'Failed to create post. Please try again.');
      }
    }
  );

  const handleSubmit = () => {
    setError('');
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    createPostMutation.mutate({
      content: content.trim(),
      skills: skills,
      files: files
    });
  };

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (
      trimmedSkill && 
      !skills.includes(trimmedSkill) &&
      skills.length < 5
    ) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const resetForm = () => {
    setContent('');
    setSkills([]);
    setSkillInput('');
    setFiles([]);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      TransitionComponent={Zoom}
      PaperProps={{
        elevation: 5,
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          overflow: 'hidden',
          backgroundImage: theme.palette.mode === 'dark' 
            ? 'linear-gradient(to bottom, rgba(40,40,50,0.9), rgba(30,30,40,0.9))'
            : 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(250,250,255,0.9))',
          backdropFilter: 'blur(10px)'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          pb: 1 
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              background: theme.palette.mode === 'dark' 
                ? `-webkit-linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` 
                : `-webkit-linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px'
            }}
          >
            Create Post
          </Typography>
          <Tooltip title="Close">
            <IconButton 
              onClick={handleClose} 
              size="medium"
              sx={{
                color: theme.palette.grey[500],
                backgroundColor: alpha(theme.palette.grey[300], 0.2),
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.grey[300], 0.3),
                  transform: 'rotate(90deg)'
                },
                borderRadius: 2
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      
      <DialogContent 
        dividers={false}
        sx={{
          px: { xs: 2, sm: 3 },
          py: 3,
          backgroundColor: 'transparent'
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: `0 2px 10px ${alpha(theme.palette.error.main, 0.2)}`,
              '& .MuiAlert-icon': {
                opacity: 0.8
              }
            }}
          >
            {error}
          </Alert>
        )}
        
        <Paper 
          elevation={0}
          sx={{ 
            p: 0.5, 
            mb: 3, 
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(5px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.05)}`
          }}
        >
          <ContentTextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            placeholder="What would you like to share today?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
            InputProps={{
              sx: {
                padding: 1.5
              }
            }}
          />
        </Paper>
        
        <Box sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
          backdropFilter: 'blur(5px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <TagIcon 
              fontSize="small" 
              sx={{ 
                mr: 1, 
                color: theme.palette.primary.main,
                opacity: 0.9
              }} 
            />
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                color: theme.palette.text.primary,
                fontSize: '1rem'
              }}
            >
              Add Related Skills
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Add a skill and press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={handleSkillInputKeyPress}
              disabled={skills.length >= 5}
              size="small"
              variant="outlined"
              InputProps={{
                sx: {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8)
                }
              }}
            />
            <Tooltip title={skills.length >= 5 ? "Maximum 5 skills allowed" : "Add Skill"}>
              <span>
                <Button
                  onClick={handleAddSkill}
                  disabled={!skillInput.trim() || skills.length >= 5}
                  sx={{ 
                    ml: 1,
                    minWidth: 0,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    },
                    height: 40,
                    width: 40,
                    p: 0
                  }}
                >
                  <AddIcon />
                </Button>
              </span>
            </Tooltip>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {skills.map((skill) => (
              <StyledChip
                key={skill}
                label={skill}
                onDelete={() => handleRemoveSkill(skill)}
                size="medium"
                deleteIcon={<CancelIcon fontSize="small" />}
              />
            ))}
          </Box>
          
          {skills.length >= 5 && (
            <Typography 
              variant="caption" 
              sx={{
                display: 'block',
                color: theme.palette.warning.main,
                fontWeight: 500,
                backgroundColor: alpha(theme.palette.warning.light, 0.2),
                p: 0.5,
                borderRadius: 1,
                textAlign: 'center'
              }}
            >
              Maximum of 5 skills reached
            </Typography>
          )}
        </Box>

        {/* Media Upload Section */}
        <Box sx={{
          p: 2,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
          backdropFilter: 'blur(5px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <AttachFileIcon 
              fontSize="small" 
              sx={{ 
                mr: 1, 
                color: theme.palette.secondary.main,
                opacity: 0.9
              }} 
            />
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                color: theme.palette.text.primary,
                fontSize: '1rem'
              }}
            >
              Add Media
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCamera />}
            fullWidth
            sx={{
              borderRadius: 2,
              p: 1.2,
              border: `2px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
              color: theme.palette.primary.main,
              fontWeight: 500,
              textTransform: 'none',
              backgroundColor: alpha(theme.palette.primary.light, 0.05),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.light, 0.1),
                borderColor: alpha(theme.palette.primary.main, 0.6)
              }
            }}
          >
            Click to Select Images or Videos
            <input
              type="file"
              multiple
              hidden
              accept="image/*, video/*"
              onChange={handleFileChange}
            />
          </Button>
          
          {files.length > 0 && (
            <Paper 
              elevation={0}
              sx={{ 
                mt: 2, 
                p: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.success.light, 0.1),
                borderLeft: `4px solid ${theme.palette.success.main}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachFileIcon 
                  fontSize="small" 
                  sx={{ 
                    mr: 1, 
                    color: theme.palette.success.main 
                  }} 
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    color: theme.palette.success.dark
                  }}
                >
                  {files.length} {files.length === 1 ? 'file' : 'files'} selected
                </Typography>
              </Box>
              <Tooltip title="Clear selection">
                <IconButton 
                  size="small" 
                  onClick={() => setFiles([])}
                  sx={{
                    color: theme.palette.grey[600],
                    '&:hover': {
                      color: theme.palette.error.main,
                      backgroundColor: alpha(theme.palette.error.light, 0.1)
                    }
                  }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Paper>
          )}
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mt: 3,
            mb: 1,
            opacity: 0.7
          }}
        >
          <Divider sx={{ flexGrow: 1 }} />
          <Typography 
            variant="caption" 
            sx={{ 
              px: 2, 
              color: theme.palette.text.secondary,
              fontWeight: 500
            }}
          >
            Ready to share your knowledge?
          </Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Box>
      </DialogContent>
      
      <DialogActions 
        sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: 2,
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          startIcon={<CancelIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            py: 1,
            fontWeight: 500,
            borderColor: alpha(theme.palette.grey[500], 0.3),
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.grey[500],
              backgroundColor: alpha(theme.palette.grey[100], 0.1)
            }
          }}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!content.trim() || createPostMutation.isLoading}
          startIcon={createPostMutation.isLoading ? null : <SendIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            py: 1,
            fontWeight: 600,
            boxShadow: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)',
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
            },
            '&:disabled': {
              background: theme.palette.action.disabledBackground
            }
          }}
        >
          {createPostMutation.isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Share Post"
          )}
        </Button>
      </DialogActions>
      
      {/* Bottom toolbar for mobile - enhances usability on small screens */}
      {isMobile && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            p: 1.5,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)'
          }}
        >
          <Tooltip title="Add Emoji">
            <IconButton 
              size="medium"
              sx={{
                color: theme.palette.warning.main,
                backgroundColor: alpha(theme.palette.warning.light, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.warning.light, 0.2)
                },
                borderRadius: 2
              }}
            >
              <EmojiIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Add Media">
            <IconButton
              component="label"
              size="medium"
              sx={{
                color: theme.palette.info.main,
                backgroundColor: alpha(theme.palette.info.light, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.info.light, 0.2)
                },
                borderRadius: 2
              }}
            >
              <PhotoCamera />
              <input
                type="file"
                multiple
                hidden
                accept="image/*, video/*"
                onChange={handleFileChange}
              />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Add Skills">
            <IconButton 
              size="medium"
              sx={{
                color: theme.palette.success.main,
                backgroundColor: alpha(theme.palette.success.light, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.success.light, 0.2)
                },
                borderRadius: 2
              }}
              onClick={() => {
                // Focus on the skill input field
                document.querySelector('input[placeholder="Add a skill and press Enter"]')?.focus();
              }}
            >
              <TagIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Dialog>
  );
}

