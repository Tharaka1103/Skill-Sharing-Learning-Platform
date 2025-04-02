import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getLearningPlans } from '../../services/api';
import LearningPlanItem from './LearningPlanItem';
import { FaSearch, FaPlus } from 'react-icons/fa';

const LearningPlanList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLearningPlans();
  }, []);

  const fetchLearningPlans = async () => {
    try {
      setLoading(true);
      const response = await getLearningPlans();
      setPlans(response.data);
    } catch (err) {
      setError('Failed to load learning plans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'completed') {
      const completedSteps = plan.steps.filter(step => step.completed).length;
      return matchesSearch && completedSteps === plan.steps.length;
    }
    if (filter === 'in-progress') {
      const completedSteps = plan.steps.filter(step => step.completed).length;
      return matchesSearch && completedSteps > 0 && completedSteps < plan.steps.length;
    }
    if (filter === 'not-started') {
      const completedSteps = plan.steps.filter(step => step.completed).length;
      return matchesSearch && completedSteps === 0;
    }
    return matchesSearch;
  });

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Learning Plans</h2>
        <Button as={Link} to="/learning-plans/create" variant="primary">
          <FaPlus className="me-1" /> Create New Plan
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={6} className="mb-3 mb-md-0">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search learning plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <Form.Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Plans</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="not-started">Not Started</option>
          </Form.Select>
        </Col>
      </Row>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading learning plans...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {filteredPlans.length === 0 ? (
            <div className="text-center my-5">
              <h4>No learning plans found</h4>
              <p>
                {searchTerm || filter !== 'all' 
                  ? 'Try changing your search or filter criteria.'
                  : 'Create your first learning plan to get started.'}
              </p>
              <Button as={Link} to="/learning-plans/create" variant="primary">
                Create Learning Plan
              </Button>
            </div>
          ) : (
            <Row>
              {filteredPlans.map(plan => (
                <Col md={6} lg={4} key={plan.id} className="mb-4">
                  <LearningPlanItem plan={plan} />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default LearningPlanList;
