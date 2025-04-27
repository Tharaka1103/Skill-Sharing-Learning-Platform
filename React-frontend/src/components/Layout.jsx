import { useState, useContext, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, Container, Button, Avatar,
  IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Divider, useMediaQuery, useTheme, Badge, Menu, MenuItem, Tooltip,
  Popover, Paper, ListItemAvatar, Typography as MuiTypography,
  alpha, styled, Fade, ListItemButton, Collapse
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Explore as ExploreIcon,
  Bookmark as BookmarkIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Create as CreateIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Comment as CommentIcon,
  Favorite as LikeIcon,
  Person as PersonIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { useQuery, useQueryClient } from 'react-query';
import { AuthContext } from '../contexts/AuthContext';
import { getFullImageUrl } from '../utils/imageUtils';
import { notificationApi } from '../services/api';
import { format } from 'date-fns';

// Custom styled components
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundImage: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main}, ${alpha(theme.palette.secondary.main, 0.85)})`,
  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
  position: 'sticky',
  backdropFilter: 'blur(10px)',
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

const LogoTypography = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  cursor: 'pointer',
  fontWeight: 'bold',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(45deg, #FFFFFF 30%, #EEEEEE 90%)' 
    : 'linear-gradient(45deg, #FFFFFF 30%, #F5F5F5 90%)',
  backgroundClip: 'text',
  textFillColor: 'transparent',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '0.5px',
  fontSize: '1.5rem',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.2rem',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  padding: '8px 16px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  position: 'relative',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: alpha(theme.palette.common.white, 0.15),
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    boxShadow: `0 0 8px ${alpha(theme.palette.common.white, 0.5)}`,
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  '&:hover::after': {
    opacity: 1,
  },
}));

const NotificationItem = styled(ListItem)(({ theme, read }) => ({
  padding: theme.spacing(1.5, 2),
  backgroundColor: read ? 'transparent' : alpha(theme.palette.primary.light, 0.1),
  borderLeft: read ? 'none' : `3px solid ${theme.palette.primary.main}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.15),
    transform: 'translateX(4px)',
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    background: theme.palette.mode === 'dark' 
      ? `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.dark, 0.2)})` 
      : `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.light, 0.1)})`,
    boxShadow: theme.shadows[8],
    paddingTop: theme.spacing(1),
  },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.7)}, ${alpha(theme.palette.primary.main, 0.6)})`,
  color: theme.palette.common.white,
  borderRadius: '0 0 16px 16px',
  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
  marginBottom: theme.spacing(2),
}));

const DrawerItem = styled(ListItemButton)(({ theme, active }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: '10px',
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(4px)',
  },
  transition: 'all 0.2s ease',
  ...(active && {
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 4,
      height: '60%',
      backgroundColor: theme.palette.primary.main,
      borderRadius: '0 4px 4px 0',
    },
  }),
}));

const FooterBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.6) 
    : alpha(theme.palette.background.paper, 0.8),
  textAlign: 'center',
  backdropFilter: 'blur(8px)',
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  marginTop: 'auto',
}));

export default function Layout() {
  const { currentUser, isAuthenticated, logout } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
    // Refetch notifications when opened
    queryClient.invalidateQueries(['notifications']);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = async () => {
    logout();
    handleProfileMenuClose();
    navigate('/login');
  };
  
  const { data: unreadCount } = useQuery(
    ['unreadNotifications'], 
    () => notificationApi.getUnreadCount(),
    { 
      enabled: isAuthenticated,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const { data: notifications } = useQuery(
    ['notifications'],
    () => notificationApi.getNotifications(),
    {
      enabled: isAuthenticated && Boolean(notificationsAnchor),
      onSuccess: () => {
        // Invalidate unread count after getting notifications
        queryClient.invalidateQueries(['unreadNotifications']);
      }
    }
  );

  const handleNotificationClick = async (notification) => {
    // Mark notification as read
    await notificationApi.markAsRead(notification.id);
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries(['notifications']);
    queryClient.invalidateQueries(['unreadNotifications']);
    
    // Close notifications menu
    handleNotificationsClose();
    
    // Navigate based on notification type
    switch(notification.type) {
      case 'COMMENT':
      case 'LIKE':
        navigate(`/posts/${notification.entityId}`);
        break;
      case 'FOLLOW':
        navigate(`/profile/${notification.senderId}`);
        break;
      case 'LEARNING_UPDATE':
        // Assuming this redirects to the learning progress
        navigate(`/learning-progress/${notification.entityId}`);
        break;
      default:
        navigate('/');
    }
  };

  const handleMarkAllAsRead = async () => {
    await notificationApi.markAllAsRead();
    queryClient.invalidateQueries(['notifications']);
    queryClient.invalidateQueries(['unreadNotifications']);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
   
  ];
  
  // Function to render notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'COMMENT':
        return <CommentIcon color="primary" />;
      case 'LIKE':
        return <LikeIcon color="error" />;
      case 'FOLLOW':
        return <PersonIcon color="success" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DrawerHeader>
        <Typography variant="h6" component="div" fontWeight="bold">
          SkillShare
        </Typography>
      </DrawerHeader>
      
      <List component="nav" sx={{ flex: 1 }}>
        {navItems.map((item) => (
          (!item.auth || (item.auth && isAuthenticated)) && (
            <DrawerItem
              key={item.name}
              active={isActive(item.path)}
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40,
                color: isActive(item.path) ? 'primary.main' : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.name} 
                primaryTypographyProps={{ 
                  fontWeight: isActive(item.path) ? 600 : 400,
                  color: isActive(item.path) ? 'primary.main' : 'inherit'
                }}
              />
              {isActive(item.path) && (
                <ChevronRightIcon color="primary" fontSize="small" />
              )}
            </DrawerItem>
          )
        ))}
      </List>
      
      <Divider sx={{ 
        my: 2,
        opacity: 0.6,
        width: '90%',
        mx: 'auto',
        borderStyle: 'dashed'
      }} />
      
      <List sx={{ mb: 2 }}>
        {isAuthenticated ? (
          <>
            <DrawerItem
              onClick={() => {
                navigate(`/profile/${currentUser.id}`);
                setDrawerOpen(false);
              }}
              active={isActive(`/profile/${currentUser.id}`)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Avatar 
                  src={getFullImageUrl(currentUser?.profilePicture)} 
                  sx={{ 
                    width: 28, 
                    height: 28,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                  }} 
                />
              </ListItemIcon>
              <ListItemText 
                primary="My Profile" 
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </DrawerItem>
            
            <DrawerItem
              onClick={() => {
                navigate('/edit-profile');
                setDrawerOpen(false);
              }}
              active={isActive('/edit-profile')}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Edit Profile"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </DrawerItem>
            
            <DrawerItem
              onClick={handleLogout}
            >
              <ListItemIcon sx={{ minWidth: 40, color: theme.palette.error.main }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ 
                  fontWeight: 500,
                  color: theme.palette.error.main
                }}
              />
            </DrawerItem>
          </>
        ) : (
          <>
            <DrawerItem
              onClick={() => {
                navigate('/login');
                setDrawerOpen(false);
              }}
              active={isActive('/login')}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Login"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </DrawerItem>
            
            <DrawerItem
              onClick={() => {
                navigate('/register');
                setDrawerOpen(false);
              }}
              active={isActive('/register')}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <RegisterIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Register"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </DrawerItem>
          </>
        )}
      </List>
      
      <Box sx={{ p: 2, textAlign: 'center', mt: 'auto', mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} SkillShare
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      background: theme.palette.mode === 'dark' 
        ? `linear-gradient(135deg, ${alpha('#000000', 0.95)}, ${alpha(theme.palette.background.default, 0.9)})`
        : `linear-gradient(135deg, ${alpha('#f5f7fa', 0.95)}, ${alpha(theme.palette.background.default, 0.9)})`,
      backgroundAttachment: 'fixed'
    }}>
      <StyledAppBar>
        <Toolbar sx={{ 
          px: { xs: 1, sm: 2, md: 3 },
          height: { xs: 64, md: 72 }
        }}>
          {isMobile && (
            <AnimatedIconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
              aria-label="menu"
            >
              <MenuIcon />
            </AnimatedIconButton>
          )}
          
          <LogoTypography
            variant="h6"
            component="div"
            onClick={() => navigate('/')}
          >
            SkillShare
          </LogoTypography>

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', mx: 2 }}>
              {navItems.map((item) => (
                (!item.auth || (item.auth && isAuthenticated)) && (
                  <Button
                    key={item.name}
                    color="inherit"
                    onClick={() => navigate(item.path)}
                    startIcon={item.icon}
                    sx={{
                      mx: 1,
                      textTransform: 'none',
                      fontWeight: isActive(item.path) ? 700 : 500,
                      fontSize: '0.95rem',
                      borderRadius: '8px',
                      px: 2,
                      py: 1,
                      color: 'white',
                      backgroundColor: isActive(item.path) ? alpha(theme.palette.common.white, 0.15) : 'transparent',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: isActive(item.path) ? '40%' : '0%',
                        height: '3px',
                        bottom: '6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: theme.palette.common.white,
                        transition: 'width 0.3s ease',
                        borderRadius: '2px',
                        opacity: 0.8
                      },
                      '&:hover::after': {
                        width: '40%'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {item.name}
                  </Button>
                )
              ))}
            </Box>
          )}

          {isAuthenticated ? (
            <>
              <Tooltip title="Create Post" arrow>
                <AnimatedIconButton 
                  color="inherit" 
                  onClick={() => navigate('/create-post')}
                  sx={{ 
                    mr: { xs: 1, sm: 2 },
                    background: alpha(theme.palette.common.white, 0.1)
                  }}
                >
                  <CreateIcon />
                </AnimatedIconButton>
              </Tooltip>
              
              <Tooltip title="Notifications" arrow>
                <AnimatedIconButton 
                  color="inherit" 
                  sx={{ 
                    mr: { xs: 1, sm: 2 },
                    background: alpha(theme.palette.common.white, 0.1)
                  }}
                  onClick={handleNotificationsOpen}
                >
                  <StyledBadge badgeContent={unreadCount?.data || 0} color="error">
                    <NotificationsIcon />
                  </StyledBadge>
                </AnimatedIconButton>
              </Tooltip>
              
              <Popover
                open={Boolean(notificationsAnchor)}
                anchorEl={notificationsAnchor}
                onClose={handleNotificationsClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  elevation: 4,
                  sx: {
                    mt: 1.5,
                    width: { xs: '100%', sm: 350 },
                    maxWidth: { xs: 'calc(100% - 32px)', sm: '100%' },
                    maxHeight: 450,
                    overflow: 'hidden',
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.2)}`
                  }
                }}
              >
                <Paper sx={{ 
                  width: '100%', 
                  maxHeight: 450, 
                  overflow: 'auto',
                  background: theme.palette.mode === 'dark' 
                    ? `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.98)})`
                    : `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.98)})`,
                  backdropFilter: 'blur(10px)'
                }}>
                  <Box sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}>
                    <Typography variant="h6" fontWeight={600}>
                      Notifications
                    </Typography>
                    <Button 
                      size="small" 
                      onClick={handleMarkAllAsRead}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: 6,
                        px: 2,
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08)
                        }
                      }}
                    >
                      Mark All as Read
                    </Button>
                  </Box>
                  
                  <List sx={{ py: 0 }}>
                    {notifications?.data?.content?.length > 0 ? (
                      notifications.data.content.map((notification) => (
                        <NotificationItem 
                          key={notification.id}
                          button 
                          onClick={() => handleNotificationClick(notification)}
                          read={notification.read}
                          divider
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: (() => {
                                switch(notification.type) {
                                  case 'COMMENT': return alpha(theme.palette.common.white, 0.9);
                                  case 'LIKE': return alpha(theme.palette.common.white, 0.9);
                                  case 'FOLLOW': return alpha(theme.palette.common.white, 0.9);
                                  default: return alpha(theme.palette.common.white, 0.9);
                                }                              })(),
                              boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.15)}`
                            }}>
                              {getNotificationIcon(notification.type)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
                                {notification.content}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {format(new Date(notification.createdAt), 'MMM d, yyyy • h:mm a')}
                              </Typography>
                            }
                          />
                        </NotificationItem>
                      ))
                    ) : (
                      <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <NotificationsIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.5) }} />
                        <Typography variant="body2" color="text.secondary">
                          No notifications yet
                        </Typography>
                      </Box>
                    )}
                  </List>
                </Paper>
              </Popover>
              
              <Tooltip title="Profile" arrow>
                <Box sx={{ position: 'relative' }}>
                  <AnimatedIconButton
                    onClick={handleProfileMenuOpen}
                    size="small"
                    edge="end"
                    aria-label="account of current user"
                    sx={{ 
                      p: 0.5,
                      border: `2px solid ${alpha(theme.palette.common.white, 0.5)}`,
                      '&:hover': {
                        borderColor: theme.palette.common.white
                      }
                    }}
                  >
                    <Avatar 
                      alt={currentUser?.name}
                      src={getFullImageUrl(currentUser?.profilePicture) || '/default-avatar.png'}                    
                      sx={{ 
                        width: { xs: 30, sm: 36 }, 
                        height: { xs: 30, sm: 36 },
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </AnimatedIconButton>
                  <KeyboardArrowDownIcon sx={{ 
                    position: 'absolute',
                    right: -12,
                    bottom: -3,
                    fontSize: 14,
                    color: 'white',
                    opacity: 0.8
                  }} />
                </Box>
              </Tooltip>
              
              <Menu
                anchorEl={profileMenuAnchor}
                open={Boolean(profileMenuAnchor)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    overflow: 'visible',
                    borderRadius: 2,
                    width: 230,
                    boxShadow: `0 8px 35px ${alpha(theme.palette.common.black, 0.15)}`,
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 20,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {currentUser?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{currentUser?.username}
                  </Typography>
                </Box>
                
                <MenuItem onClick={() => {
                  handleProfileMenuClose();
                  navigate(`/profile/${currentUser.id}`);
                }} sx={{
                  py: 1.5,
                  borderRadius: 0,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    paddingLeft: theme.spacing(3),
                  }
                }}>
                  <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                    <AccountIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="My Profile" 
                    primaryTypographyProps={{ fontSize: '0.95rem' }}
                  />
                </MenuItem>

                <MenuItem onClick={() => {
                  handleProfileMenuClose();
                  navigate('/edit-profile');
                }} sx={{
                  py: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    paddingLeft: theme.spacing(3),
                  }
                }}>
                  <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                    <CreateIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Edit Profile" 
                    primaryTypographyProps={{ fontSize: '0.95rem' }}
                  />
                </MenuItem>

                <Divider sx={{ my: 1, opacity: 0.6 }} />

                <MenuItem onClick={handleLogout} sx={{
                  py: 1.5,
                  color: theme.palette.error.main,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                    paddingLeft: theme.spacing(3),
                  }
                }}>
                  <ListItemIcon sx={{ color: theme.palette.error.main }}>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Logout" 
                    primaryTypographyProps={{ 
                      fontSize: '0.95rem',
                      fontWeight: 500 
                    }}
                  />
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box>
              <ActionButton 
                color="inherit" 
                onClick={() => navigate('/login')}
                sx={{ 
                  mr: { xs: 1, sm: 2 },
                  backgroundColor: alpha(theme.palette.common.white, 0.15),
                  color: 'white',
                  fontWeight: 500,
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.25),
                  }
                }}
              >
                Login
              </ActionButton>
              <ActionButton 
                variant="contained" 
                color="secondary" 
                onClick={() => navigate('/register')}
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                  fontWeight: 600,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.4)}`,
                  '&:hover': {
                    boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.6)}`,
                  }
                }}
              >
                Register
              </ActionButton>
            </Box>
          )}
        </Toolbar>
      </StyledAppBar>

      <StyledDrawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
        }}
      >
        {drawer}
      </StyledDrawer>

      <Container 
        component="main" 
        sx={{ 
          py: { xs: 2, sm: 3, md: 4 }, 
          px: { xs: 1, sm: 2, md: 3 },
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
        maxWidth="lg"
      >
        <Box 
          sx={{ 
            flexGrow: 1,
            width: '100%',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Outlet />
        </Box>
      </Container>

      <FooterBox component="footer">
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            opacity: 0.8,
            '& span': {
              color: theme.palette.primary.main,
              fontWeight: 500
            }
          }}
        >
          © {new Date().getFullYear()} <span>SkillShare</span> - Connect, Learn, Grow
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 1,
            gap: 2
          }}
        >
          {['About', 'Privacy', 'Terms', 'Help'].map(item => (
            <Typography 
              key={item}
              variant="caption" 
              color="text.secondary"
              sx={{
                cursor: 'pointer',
                opacity: 0.7,
                transition: 'all 0.2s ease',
                '&:hover': {
                  opacity: 1,
                  color: theme.palette.primary.main
                }
              }}
            >
              {item}
            </Typography>
          ))}
        </Box>
      </FooterBox>
    </Box>
  );
}

