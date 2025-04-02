import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';

const Home = () => {
  const authenticated = isAuthenticated();

  return (
    <Container className="my-5">
      <Row className="align-items-center mb-5">
        <Col md={6}>
          <h1 className="display-4 mb-3">Share Skills, Learn Together</h1>
          <p className="lead mb-4">
            Connect with learners, share your knowledge, and grow your skills
            through our collaborative learning platform.
          </p>
          {authenticated ? (
            <div className="d-flex gap-3">
              <Button as={Link} to="/feed" variant="primary" size="lg">
                Go to Feed
              </Button>
              <Button as={Link} to="/learning-plans" variant="outline-primary" size="lg">
                Explore Learning Plans
              </Button>
            </div>
          ) : (
            <div className="d-flex gap-3">
              <Button as={Link} to="/register" variant="primary" size="lg">
                Sign Up
              </Button>
              <Button as={Link} to="/login" variant="outline-primary" size="lg">
                Login
              </Button>
            </div>
          )}
        </Col>
        <Col md={6} className="d-none d-md-block">
          <img 
            src="/img/learning-illustration.svg" 
            alt="People learning together" 
            className="img-fluid" 
          />
        </Col>
      </Row>

      <h2 className="text-center mb-4">How It Works</h2>
      <Row className="mb-5">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="feature-icon mb-3">
                <i className="bi bi-people-fill"></i>
              </div>
              <Card.Title>Connect with Learners</Card.Title>
              <Card.Text>
                Find like-minded individuals who share your interests and learning goals.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
            <div className="feature-icon mb-3">
                <i className="bi bi-lightbulb-fill"></i>
              </div>
              <Card.Title>Share Knowledge</Card.Title>
              <Card.Text>
                Post tutorials, guides, and tips to help others learn from your experience.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="feature-icon mb-3">
                <i className="bi bi-graph-up"></i>
              </div>
              <Card.Title>Track Your Progress</Card.Title>
              <Card.Text>
                Create learning plans, set goals, and monitor your progress over time.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="text-center mb-5">
        <h2 className="mb-4">Start Your Learning Journey Today</h2>
        <p className="lead">
          Join our community of learners and educators to accelerate your growth.
        </p>
        {!authenticated && (
          <Button as={Link} to="/register" variant="primary" size="lg">
            Sign Up Now - It's Free!
          </Button>
        )}
      </div>
    </Container>
  );
};

export default Home;
