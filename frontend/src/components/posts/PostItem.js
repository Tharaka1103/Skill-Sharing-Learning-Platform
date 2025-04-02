import React, { useState, useEffect } from 'react';
import { Card, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment, FaShare } from 'react-icons/fa';
import { getLikeCount, hasUserLiked, toggleLike } from '../../services/api';
import CommentSection from '../comments/CommentSection';
import { formatDistanceToNow } from 'date-fns';

const PostItem = ({ post }) => {
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    fetchLikeInfo();
  }, [post.id]);

  const fetchLikeInfo = async () => {
    try {
      const [countRes, statusRes] = await Promise.all([
        getLikeCount(post.id),
        hasUserLiked(post.id)
      ]);
      setLikeCount(countRes.data);
      setLiked(statusRes.data);
    } catch (err) {
      console.error('Failed to fetch like info:', err);
    }
  };

  const handleLike = async () => {
    try {
      await toggleLike(post.id);
      setLiked(!liked);
      setLikeCount(prevCount => liked ? prevCount - 1 : prevCount + 1);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const formatDate = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Card className="post-card mb-4">
      <div className="post-header">
        <Image 
          src={post.user.profilePicture || "https://via.placeholder.com/40"} 
          className="post-avatar" 
          alt={post.user.username} 
        />
        <div className="post-user-info">
          <Link to={`/profile/${post.user.username}`} className="post-username">
            {post.user.username}
          </Link>
          <div className="post-date">{formatDate(post.createdAt)}</div>
        </div>
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
        
        {post.media && post.media.length > 0 && (
          <div className="post-media">
            {post.media.map((media, index) => (
              media.type.startsWith('image') ? (
                <Image 
                  key={index} 
                  src={media.url} 
                  fluid 
                  className="mb-2" 
                  alt="Post media" 
                />
              ) : (
                <video 
                  key={index} 
                  src={media.url} 
                  controls 
                  className="w-100 mb-2" 
                />
              )
            ))}
          </div>
        )}
        
        {post.type === 'LEARNING_PLAN' && post.learningPlan && (
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>{post.learningPlan.title}</Card.Title>
              <Card.Text>{post.learningPlan.description}</Card.Text>
              <Link to={`/learning-plans/${post.learningPlan.id}`}>
                <Button variant="outline-primary" size="sm">View Learning Plan</Button>
              </Link>
            </Card.Body>
          </Card>
        )}
      </div>
      
      <div className="post-actions">
        <Button className="action-button" onClick={handleLike}>
          {liked ? <FaHeart color="red" /> : <FaRegHeart />}
          <span>{likeCount}</span>
        </Button>
        
        <Button className="action-button" onClick={() => setShowComments(!showComments)}>
          <FaComment />
          <span>Comments</span>
        </Button>
        
        <Link to={`/posts/${post.id}`} className="action-button">
          <FaShare />
          <span>Share</span>
        </Link>
      </div>
      
      {showComments && (
        <CommentSection postId={post.id} />
      )}
    </Card>
  );
};

export default PostItem;
