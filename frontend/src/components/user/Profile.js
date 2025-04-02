import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Button, Image, Tabs, Tab, Spinner, Alert, 
  Card, Badge, Modal, Form, InputGroup
} from 'react-bootstrap';
import { 
  getUserProfile, getPostsByUser, getUserLearningPlans, 
  followUser, unfollowUser, updateUserProfile 
} from '../../services/api';
import { getUserInfo } from '../../services/auth';
import PostItem from '../posts/PostItem';
import LearningPlanItem from '../learning/LearningPlanItem';
import { 
  FaUserEdit, FaUsers, FaNewspaper, FaBookReader, FaEdit, 
  FaEnvelope, FaUser, FaLock, FaCamera, FaInfoCircle 
} from 'react-icons/fa';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [learningPlans, setLearningPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followed, setFollowed] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // For profile edit modal tabs
  const [updateForm, setUpdateForm] = useState({
    id: null,
    username: '',
    email: '',
    bio: '',
    profilePicture: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const userInfo = getUserInfo();

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileResponse = await getUserProfile(username);
      
      if (!profileResponse.data) {
        setError('User profile not found');
        return;
      }
      
      setProfile(profileResponse.data);
      setUpdateForm({
        id: profileResponse.data.id,
        username: profileResponse.data.username,
        email: profileResponse.data.email,
        bio: profileResponse.data.bio || '',
        profilePicture: profileResponse.data.profilePicture || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Check if current user follows this profile
      const userInfo = getUserInfo();
      if (userInfo && profileResponse.data.followers) {
        const isFollowing = profileResponse.data.followers.some(
          follower => follower.id === userInfo.id
        );
        setFollowed(isFollowing);
      }

      // Load posts and learning plans
      const [postsResponse, plansResponse] = await Promise.all([
        getPostsByUser(profileResponse.data.id),
        getUserLearningPlans(profileResponse.data.id)
      ]);

      setPosts(postsResponse.data.content || []);
      setLearningPlans(plansResponse.data || []);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile. ' + 
        (err.response?.status === 401 ? 'Please log in again.' : 'Please try again later.'));
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (followed) {
        await unfollowUser(profile.id);
      } else {
        await followUser(profile.id);
      }
      setFollowed(!followed);
      
      // Update follower count
      setProfile(prev => ({
        ...prev,
        followers: followed 
          ? prev.followers.filter(f => f.id !== userInfo.id)
          : [...prev.followers, { id: userInfo.id }]
      }));
    } catch (err) {
      console.error('Failed to follow/unfollow:', err);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate based on active tab
    if (activeTab === 'basic') {
      if (!updateForm.username || updateForm.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      }
      
      if (!updateForm.email || !/\S+@\S+\.\S+/.test(updateForm.email)) {
        errors.email = 'Please enter a valid email address';
      }
    } else if (activeTab === 'password') {
      if (!updateForm.currentPassword) {
        errors.currentPassword = 'Current password is required';
      }
      
      if (updateForm.newPassword && updateForm.newPassword.length < 6) {
        errors.newPassword = 'New password must be at least 6 characters';
      }
      
      if (updateForm.newPassword !== updateForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    return errors;
  };

  const handleUpdateProfile = async () => {
    // Validate form inputs
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    
    try {
      // Create payload based on active tab
      const payload = {
        id: profile.id
      };
      
      if (activeTab === 'basic') {
        payload.username = updateForm.username;
        payload.email = updateForm.email;
        payload.bio = updateForm.bio;
        payload.profilePicture = updateForm.profilePicture;
      } else if (activeTab === 'password') {
        payload.currentPassword = updateForm.currentPassword;
        payload.newPassword = updateForm.newPassword;
      }
      
      const response = await updateUserProfile(payload);
      
      // Update the profile state with new data
      setProfile(prev => ({
        ...prev,
        ...(activeTab === 'basic' ? {
          username: updateForm.username,
          email: updateForm.email,
          bio: updateForm.bio,
          profilePicture: updateForm.profilePicture
        } : {})
      }));
      
      setUpdateSuccess(
        activeTab === 'basic' 
          ? 'Profile updated successfully!' 
          : 'Password updated successfully!'
      );
      
      // Clear password fields
      if (activeTab === 'password') {
        setUpdateForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
      
      // If username changed, redirect to new profile URL after a delay
      if (activeTab === 'basic' && updateForm.username !== username) {
        setTimeout(() => {
          navigate(`/profile/${updateForm.username}`);
          setShowUpdateModal(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setUpdateError(
        err.response?.data?.message || 
        'Failed to update profile. Please try again.'
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Loading profile...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="shadow-sm rounded-3 p-4">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button 
            variant="outline-danger" 
            onClick={() => navigate(-1)}
            className="mt-2"
          >
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="my-5">
        <Alert variant="warning" className="shadow-sm rounded-3 p-4">
          <Alert.Heading>User Not Found</Alert.Heading>
          <p>We couldn't find the user you're looking for.</p>
          <Button 
            variant="outline-warning" 
            onClick={() => navigate('/feed')}
            className="mt-2"
          >
            Return to Feed
          </Button>
        </Alert>
      </Container>
    );
  }

  const isCurrentUser = userInfo && profile.id === userInfo.id;

  return (
    <Container className="py-5">
      <Card className="border-0 shadow-sm mb-4 overflow-hidden">
        <div className="profile-banner bg-primary" style={{ height: '120px' }}></div>
        <Card.Body className="pt-0">
          <Row>
            <Col md={3} className="text-center">
              <div className="position-relative" style={{ marginTop: '-60px' }}>
                <Image 
                  src={profile.profilePicture || "https://via.placeholder.com/150"} 
                  className="border border-4 border-white shadow" 
                  alt={profile.username} 
                  roundedCircle 
                  width={120}
                  height={120}
                  style={{ objectFit: 'cover', backgroundColor: '#f8f9fa' }}
                />
                {isCurrentUser && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="position-absolute bottom-0 end-0 rounded-circle"
                    onClick={() => {
                      setActiveTab('basic');
                      setShowUpdateModal(true);
                    }}
                    style={{ width: '32px', height: '32px', padding: '0' }}
                  >
                    <FaEdit className="m-auto" />
                  </Button>
                )}
              </div>
            </Col>
            <Col md={9} className="mt-md-0 mt-4">
              <div className="d-flex flex-wrap justify-content-between align-items-start">
                <div>
                  <h2 className="mb-1 fw-bold">{profile.username}</h2>
                  <p className="text-muted mb-2">
                    <small>
                      <FaEnvelope className="me-1" /> {profile.email}
                    </small>
                  </p>
                  <p className="text-muted mb-2">
                    <small>Joined {new Date(profile.createdAt).toLocaleDateString()}</small>
                  </p>
                  <p className="mb-3">{profile.bio || 'No bio provided'}</p>
                </div>
                <div className="mt-2">
                  {!isCurrentUser && userInfo ? (
                    <Button 
                      variant={followed ? "outline-primary" : "primary"} 
                      className={`rounded-pill px-4 ${followed ? '' : 'shadow-sm'}`}
                      onClick={handleFollow}
                    >
                      {followed ? 'Unfollow' : 'Follow'}
                    </Button>
                  ) : isCurrentUser ? (
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-primary" 
                        className="rounded-pill px-4"
                        onClick={() => {
                          setActiveTab('basic');
                          setShowUpdateModal(true);
                        }}
                      >
                        <FaUserEdit className="me-2" />
                        Edit Profile
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        className="rounded-pill px-4"
                        onClick={() => {
                          setActiveTab('password');
                          setShowUpdateModal(true);
                        }}
                      >
                        <FaLock className="me-2" />
                        Change Password
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
              
              <div className="d-flex flex-wrap mt-3 profile-stats gap-4">
                <div className="text-center me-4">
                  <h5 className="mb-0 fw-bold">{posts.length}</h5>
                  <small className="text-muted"><FaNewspaper className="me-1" />Posts</small>
                </div>
                <div className="text-center me-4">
                  <h5 className="mb-0 fw-bold">{profile.followers.length}</h5>
                  <small className="text-muted"><FaUsers className="me-1" />Followers</small>
                </div>
                <div className="text-center">
                  <h5 className="mb-0 fw-bold">{profile.following.length}</h5>
                  <small className="text-muted"><FaUsers className="me-1" />Following</small>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Tabs 
        className="mb-4 profile-tabs" 
        fill
        variant="pills"
      >
        <Tab 
          eventKey="posts" 
          title={
            <span><FaNewspaper className="me-2" />Posts</span>
          }
        >
          {posts.length === 0 ? (
            <Card className="text-center my-4 py-5 bg-light border-0">
              <Card.Body>
                <h5 className="text-muted mb-3">No posts yet</h5>
                <p className="text-muted">This user hasn't shared any posts.</p>
                {isCurrentUser && (
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/create-post')}
                    className="mt-2 rounded-pill px-4"
                  >
                    Create Your First Post
                  </Button>
                )}
              </Card.Body>
            </Card>
          ) : (
            <div className="post-grid mt-4">
              {posts.map(post => 
                <Card key={post.id} className="mb-4 border-0 shadow-sm hover-shadow">
                  <PostItem post={post} />
                </Card>
              )}
            </div>
          )}
        </Tab>
        
        <Tab 
          eventKey="learning-plans" 
          title={
            <span><FaBookReader className="me-2" />Learning Plans</span>
          }
        >
          {learningPlans.length === 0 ? (
            <Card className="text-center my-4 py-5 bg-light border-0">
              <Card.Body>
                <h5 className="text-muted mb-3">No learning plans yet</h5>
                <p className="text-muted">This user hasn't created any learning plans.</p>
                {isCurrentUser && (
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/create-learning-plan')}
                    className="mt-2 rounded-pill px-4"
                  >
                    Create Your First Learning Plan
                  </Button>
                )}
              </Card.Body>
            </Card>
          ) : (
            <Row className="mt-4">
              {learningPlans.map(plan => (
                <Col sm={12} md={6} lg={4} key={plan.id} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm hover-shadow">
                    <LearningPlanItem plan={plan} />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Tab>
      </Tabs>

      {/* Profile Update Modal */}
      <Modal 
        show={showUpdateModal} 
        onHide={() => setShowUpdateModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {activeTab === 'basic' ? 'Edit Profile' : 'Change Password'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {updateError && <Alert variant="danger">{updateError}</Alert>}
          {updateSuccess && <Alert variant="success">{updateSuccess}</Alert>}
          
          <div className="d-flex mb-4">
            <Button 
              variant={activeTab === 'basic' ? 'primary' : 'outline-primary'} 
              className="me-2 flex-grow-1"
              onClick={() => setActiveTab('basic')}
            >
              <FaUser className="me-2" />Basic Information
            </Button>
            <Button 
              variant={activeTab === 'password' ? 'primary' : 'outline-primary'} 
              className="flex-grow-1"
              onClick={() => setActiveTab('password')}
            >
              <FaLock className="me-2" />Change Password
            </Button>
          </div>
          
          {activeTab === 'basic' ? (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <InputGroup hasValidation>
                  <InputGroup.Text>
                    <FaUser />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="username"
                    value={updateForm.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    isInvalid={!!formErrors.username}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.username}
                  </Form.Control.Feedback>
                </InputGroup>
                <Form.Text className="text-muted">
                  Your username must be unique and at least 3 characters long.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <InputGroup hasValidation>
                  <InputGroup.Text>
                    <FaEnvelope />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    name="email"
                    value={updateForm.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    isInvalid={!!formErrors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.email}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Profile Picture URL</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaCamera />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="profilePicture"
                    value={updateForm.profilePicture}
                    onChange={handleInputChange}
                    placeholder="Enter image URL"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Enter a URL for your profile picture
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Bio</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaInfoCircle />
                  </InputGroup.Text>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    value={updateForm.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                  />
                </InputGroup>
              </Form.Group>
            </Form>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <InputGroup hasValidation>
                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={updateForm.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter your current password"
                    isInvalid={!!formErrors.currentPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.currentPassword}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <InputGroup hasValidation>
                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={updateForm.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    isInvalid={!!formErrors.newPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.newPassword}
                  </Form.Control.Feedback>
                </InputGroup>
                <Form.Text className="text-muted">
                  Password must be at least 6 characters long
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <InputGroup hasValidation>
                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={updateForm.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    isInvalid={!!formErrors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.confirmPassword}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateProfile}
            disabled={updateLoading}
          >
            {updateLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;
