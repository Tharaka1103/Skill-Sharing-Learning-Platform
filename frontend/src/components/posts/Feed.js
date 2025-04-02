import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner } from 'react-bootstrap';
import { getFeedPosts, createPost } from '../../services/api';
import PostItem from './PostItem';
import PostForm from './PostForm';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await getFeedPosts(page);
      const newPosts = response.data.content;
      
      if (page === 0) {
        setPosts(newPosts);
      } else {
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
      }
      
      setHasMore(!response.data.last);
      setPage(prevPage => prevPage + 1);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      const response = await createPost(postData);
      setPosts(prevPosts => [response.data, ...prevPosts]);
      setShowPostForm(false);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  return (
    <Container className='mt-5 pt-5'>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              {!showPostForm ? (
                <Button 
                  variant="outline-primary" 
                  className="w-100"
                  onClick={() => setShowPostForm(true)}
                >
                  What's on your mind?
                </Button>
              ) : (
                <PostForm 
                  onSubmit={handleCreatePost} 
                  onCancel={() => setShowPostForm(false)} 
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </Col>
        </Row>
      )}

      {posts.map(post => (
        <PostItem key={post.id} post={post} />
      ))}

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {!loading && hasMore && (
        <div className="text-center my-4">
          <Button variant="outline-primary" onClick={loadPosts}>
            Load More
          </Button>
        </div>
      )}

      {!loading && !hasMore && posts.length > 0 && (
        <div className="text-center my-4 text-muted">
          No more posts to load
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center my-5">
          <h4>No posts in your feed yet!</h4>
          <p>Try following more users to see their posts here.</p>
        </div>
      )}
    </Container>
  );
};

export default Feed;
