import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { getComments, createComment } from '../../services/api';
import CommentItem from './CommentItem';

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getComments(postId);
      setComments(response.data);
    } catch (err) {
      setError('Failed to load comments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      const response = await createComment(postId, content);
      setComments([response.data, ...comments]);
      setContent('');
    } catch (err) {
      setError('Failed to post comment');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentUpdate = (updatedComment) => {
    setComments(comments.map(comment => 
      comment.id === updatedComment.id ? updatedComment : comment
    ));
  };

  const handleCommentDelete = (commentId) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  return (
    <div className="comment-section">
      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Group className="mb-2">
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
          />
        </Form.Group>
        <Button 
          variant="primary" 
          type="submit" 
          size="sm" 
          disabled={submitting || !content.trim()}
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </Form>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center my-3">
          <Spinner animation="border" size="sm" role="status">
            <span className="visually-hidden">Loading comments...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {comments.length === 0 ? (
            <p className="text-center text-muted">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                postId={postId}
                onUpdate={handleCommentUpdate}
                onDelete={handleCommentDelete}
              />
            ))
          )}
        </>
      )}
    </div>
  );
};

export default CommentSection;
