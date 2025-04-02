import React from 'react';
import { Card, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const LearningPlanItem = ({ plan }) => {
  // Calculate progress percentage
  const completedSteps = plan.steps.filter(step => step.completed).length;
  const progressPercentage = Math.round((completedSteps / plan.steps.length) * 100) || 0;

  const formatDate = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Card className="learning-plan-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Link to={`/learning-plans/${plan.id}`} className="text-decoration-none">
              <Card.Title>{plan.title}</Card.Title>
            </Link>
            <Card.Subtitle className="mb-2 text-muted">
              by <Link to={`/profile/${plan.user.username}`}>{plan.user.username}</Link>
            </Card.Subtitle>
          </div>
          {plan.category && (
            <Badge bg="secondary">{plan.category}</Badge>
          )}
        </div>
        
        <Card.Text>
          {plan.description.length > 100 
            ? `${plan.description.substring(0, 100)}...` 
            : plan.description}
        </Card.Text>
        
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted">Progress</small>
          <small>{progressPercentage}%</small>
        </div>
        <ProgressBar 
          now={progressPercentage} 
          variant={progressPercentage === 100 ? "success" : "primary"} 
          className="mb-3" 
        />
        
        <div className="d-flex justify-content-between">
          <small className="text-muted">
            Created {formatDate(plan.createdAt)}
          </small>
          <small className="text-muted">
            {plan.steps.length} steps
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LearningPlanItem;
