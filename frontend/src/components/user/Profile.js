import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Image, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { getUserProfile, getPostsByUser, getUserLearningPlans, followUser, unfollowUser } from '../../services/api';
import { getUserInfo } from '../../services/auth';
import PostItem from '../posts/PostItem';
import LearningPlanItem from '../learning/LearningPlanItem';

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [learningPlans, setLearningPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followed, setFollowed] = useState(false);
  const userInfo = getUserInfo();

  useEffect(() => {
    loadProfile();
  }, [username]);

  // In the loadProfile function
const loadProfile = async () => {
  try {
    setLoading(true);
    const profileResponse = await getUserProfile(username);
    
    if (!profileResponse.data) {
      setError('User profile not found');
      return;
    }
    
    setProfile(profileResponse.data);

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

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="my-5">
        <Alert variant="warning">User not found</Alert>
      </Container>
    );
  }

  const isCurrentUser = userInfo && profile.id === userInfo.id;

  return (
    <Container className="my-4 mt-5 pt-5">
      <div className="profile-header">
        <Row>
          <Col md={3} className="text-center">
            <Image 
              src={profile.profilePicture || "https://via.placeholder.com/150"} 
              className="profile-avatar mb-3" 
              alt={profile.username} 
              roundedCircle 
            />
          </Col>
          <Col md={9}>
            <h2>{profile.username}</h2>
            <p>{profile.bio || 'No bio provided'}</p>
            
            {!isCurrentUser && userInfo && (
              <Button 
                variant={followed ? "outline-primary" : "primary"} 
                onClick={handleFollow}
              >
                {followed ? 'Unfollow' : 'Follow'}
              </Button>
            )}
            
            <div className="profile-stats mt-3">
              <div className="stat">
                <div className="stat-value">{posts.length}</div>
                <div className="stat-label">Posts</div>
              </div>
              <div className="stat">
                <div className="stat-value">{profile.followers.length}</div>
                <div className="stat-label">Followers</div>
              </div>
              <div className="stat">
                <div className="stat-value">{profile.following.length}</div>
                <div className="stat-label">Following</div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Tabs className="mb-4">
        <Tab eventKey="posts" title="Posts">
          {posts.length === 0 ? (
            <div className="text-center my-5 text-muted">
              No posts yet.
            </div>
          ) : (
            posts.map(post => <PostItem key={post.id} post={post} />)
          )}
        </Tab>
        
        <Tab eventKey="learning-plans" title="Learning Plans">
          {learningPlans.length === 0 ? (
            <div className="text-center my-5 text-muted">
              No learning plans yet.
            </div>
          ) : (
            <Row>
              {learningPlans.map(plan => (
                <Col md={6} lg={4} key={plan.id} className="mb-4">
                  <LearningPlanItem plan={plan} />
                </Col>
              ))}
            </Row>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Profile;
