import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Badge, ProgressBar, ListGroup, Form, Spinner, Alert } from 'react-bootstrap';
import { getLearningPlan, updateLearningPlan, deleteLearningPlan } from '../../services/api';
import { getUserInfo } from '../../services/auth';
import { formatDistanceToNow } from 'date-fns';
import { FaCheck, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';

const LearningPlanDetail = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    steps: []
  });
  const userInfo = getUserInfo();

  useEffect(() => {
    fetchLearningPlan();
  }, [planId]);

  const fetchLearningPlan = async () => {
    try {
      setLoading(true);
      const response = await getLearningPlan(planId);
      setPlan(response.data);
      setFormData({
        title: response.data.title,
        description: response.data.description,
        category: response.data.category || '',
        steps: response.data.steps
      });
    } catch (err) {
      setError('Failed to load learning plan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await updateLearningPlan(planId, formData);
      setPlan(response.data);
      setEditing(false);
    } catch (err) {
      setError('Failed to update learning plan');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this learning plan?')) {
      try {
        await deleteLearningPlan(planId);
        navigate('/learning-plans');
      } catch (err) {
        setError('Failed to delete learning plan');
        console.error(err);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setFormData({ ...formData, steps: updatedSteps });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        { title: '', description: '', completed: false }
      ]
    });
  };

  const removeStep = (index) => {
    const updatedSteps = [...formData.steps];
    updatedSteps.splice(index, 1);
    setFormData({ ...formData, steps: updatedSteps });
  };

  const toggleStepCompletion = async (index) => {
    if (editing) return;
    
    const updatedPlan = { ...plan };
    const step = { ...updatedPlan.steps[index] };
    step.completed = !step.completed;
    updatedPlan.steps[index] = step;
    
    try {
      const response = await updateLearningPlan(planId, updatedPlan);
      setPlan(response.data);
    } catch (err) {
      console.error('Failed to update step:', err);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading learning plan...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
        <Button as={Link} to="/learning-plans" variant="primary">
          <FaArrowLeft className="me-2" /> Back to Learning Plans
        </Button>
        </Container>
    );
  }

  if (!plan) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Learning plan not found</Alert>
        <Button as={Link} to="/learning-plans" variant="primary">
          <FaArrowLeft className="me-2" /> Back to Learning Plans
        </Button>
      </Container>
    );
  }

  const completedSteps = plan.steps.filter(step => step.completed).length;
  const progressPercentage = Math.round((completedSteps / plan.steps.length) * 100) || 0;
  const isCurrentUserPlan = userInfo && plan.user.id === userInfo.id;

  const formatDate = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Container className="my-4">
      <Button as={Link} to="/learning-plans" variant="outline-secondary" className="mb-3">
        <FaArrowLeft className="me-2" /> Back to Learning Plans
      </Button>
      
      <Card className="mb-4">
        <Card.Body>
          {editing ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Optional category"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2>{plan.title}</h2>
                  <p className="text-muted">
                    Created by <Link to={`/profile/${plan.user.username}`}>{plan.user.username}</Link> {formatDate(plan.createdAt)}
                  </p>
                </div>
                {plan.category && <Badge bg="secondary">{plan.category}</Badge>}
              </div>
              
              <div className="mb-4">
                {plan.description}
              </div>
            </>
          )}
          
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>Progress</div>
              <div>{progressPercentage}% Completed</div>
            </div>
            <ProgressBar 
              now={progressPercentage} 
              variant={progressPercentage === 100 ? "success" : "primary"} 
            />
          </div>
          
          {isCurrentUserPlan && !editing && (
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={() => setEditing(true)}>
                <FaEdit className="me-1" /> Edit
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                <FaTrash className="me-1" /> Delete
              </Button>
            </div>
          )}
          
          {editing && (
            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Learning Steps</h4>
          {editing && (
            <Button variant="outline-primary" size="sm" onClick={addStep}>
              Add Step
            </Button>
          )}
        </Card.Header>
        <ListGroup variant="flush">
          {editing ? (
            formData.steps.map((step, index) => (
              <ListGroup.Item key={index} className="py-3">
                <div className="mb-3 d-flex justify-content-between">
                  <Form.Group className="flex-grow-1 me-2">
                    <Form.Control
                      type="text"
                      placeholder="Step title"
                      value={step.title}
                      onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => removeStep(index)}
                  >
                    <FaTrash />
                  </Button>
                </div>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Step description (optional)"
                    value={step.description}
                    onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                  />
                </Form.Group>
                <Form.Check 
                  type="checkbox" 
                  label="Completed" 
                  className="mt-2"
                  checked={step.completed}
                  onChange={(e) => handleStepChange(index, 'completed', e.target.checked)}
                />
              </ListGroup.Item>
            ))
          ) : (
            plan.steps.length === 0 ? (
              <ListGroup.Item className="text-center py-3 text-muted">
                No steps defined for this learning plan yet.
              </ListGroup.Item>
            ) : (
              plan.steps.map((step, index) => (
                <ListGroup.Item 
                  key={index}
                  className={`py-3 ${step.completed ? 'bg-light' : ''}`}
                >
                  <div className="d-flex">
                    <div 
                      className={`step-check me-3 ${isCurrentUserPlan ? 'cursor-pointer' : ''}`}
                      onClick={() => isCurrentUserPlan && toggleStepCompletion(index)}
                    >
                      <div className={`step-check-circle ${step.completed ? 'completed' : ''}`}>
                        {step.completed && <FaCheck />}
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className={step.completed ? 'text-decoration-line-through' : ''}>
                        {step.title}
                      </h5>
                      {step.description && (
                        <p className="mb-0">{step.description}</p>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            )
          )}
        </ListGroup>
      </Card>
    </Container>
  );
};

export default LearningPlanDetail;
