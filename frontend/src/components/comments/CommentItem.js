import React, { useState } from 'react';
import { Image, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { updateComment, deleteComment } from '../../services/api';
import { getUserInfo } from '../../services/auth';
import { formatDistanceToNow } from 'date-fns';

const CommentItem = ({ comment, postId, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [submitting, setSubmitting] = useState(false);
  const userInfo = getUserInfo();

  const isCurrentUserComment = userInfo && comment.user.id === userInfo.id;

  const handleEdit = async () => {
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      const response = await updateComment(postId, comment.id, content);
      onUpdate(response.data);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(postId, comment.id);
        onDelete(comment.id);
      } catch (err) {
        console.error('Failed to delete comment:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="comment mb-3">
      <div className="comment-header">
        <Image 
          src={comment.user.profilePicture || "https://via.placeholder.com/30"} 
          className="comment-avatar" 
          alt={comment.user.username} 
        />
        <Link to={`/profile/${comment.user.username}`} className="comment-username">
          {comment.user.username}
        </Link>
        <div className="comment-date">
          {formatDate(comment.createdAt)}
        </div>
        
        {isCurrentUserComment && (
          <div className="ms-auto">
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 me-2" 
              onClick={() => setEditing(true)}
              disabled={editing}
            >
              <FaEdit />
            </Button>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 text-danger" 
              onClick={handleDelete}
            >
              <FaTrash />
            </Button>
          </div>
        )}
      </div>
      
      {editing ? (
        <Form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
          <Form.Group className="mb-2">
            <Form.Control
              as="textarea"
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
            />
          </Form.Group>
          <div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="me-2" 
              onClick={() => { setEditing(false); setContent(comment.content); }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              type="submit" 
              disabled={submitting || !content.trim()}
            >
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Form>
      ) : (
        <div className="comment-content mt-2">
          {comment.content}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
