import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { getPost, deletePost } from '../../services/api';
import { getUserInfo } from '../../services/auth';
import PostItem from './PostItem';
import CommentSection from '../comments/CommentSection';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userInfo = getUserInfo();

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await getPost(postId);
      setPost(response.data);
    } catch (err) {
      setError('Failed to load post. It may have been deleted or is unavailable.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
        navigate('/feed');
      } catch (err) {
        setError('Failed to delete post');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
        <Button as={Link} to="/feed" variant="primary">
          Back to Feed
        </Button>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Post not found</Alert>
        <Button as={Link} to="/feed" variant="primary">
          Back to Feed
        </Button>
      </Container>
    );
  }

  const isCurrentUserPost = userInfo && post.user.id === userInfo.id;

  return (
    <Container className="my-4">
      <div className="mb-3">
        <Button as={Link} to="/feed" variant="outline-secondary">
          ← Back to Feed
        </Button>
        {isCurrentUserPost && (
          <Button variant="danger" className="float-end" onClick={handleDeletePost}>
            Delete Post
          </Button>
        )}
      </div>

      <PostItem post={post} />
      
      <Card className="mt-4">
        <Card.Header>Comments</Card.Header>
        <Card.Body>
          <CommentSection postId={post.id} />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PostDetail;
