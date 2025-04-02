import React from 'react';
import { Container, Row, Col, Button, Card, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
import Logo from '../assets/home.png';

const Home = () => {
  const authenticated = isAuthenticated();

  return (
    <div className="home-wrapper">
      <div className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6} className="hero-content">
              <h1 className="display-3 fw-bold mb-4 animate-text">Share Skills, Learn Together</h1>
              <p className="lead mb-4 animate-text-delay">
                Connect with learners, share your knowledge, and grow your skills
                through our collaborative learning platform. Join thousands of learners worldwide!
              </p>
              {authenticated ? (
                <div className="d-flex gap-3 flex-wrap">
                  <Button as={Link} to="/feed" variant="primary" size="lg" className="pulse-button">
                    Go to Feed
                  </Button>
                  <Button as={Link} to="/learning-plans" variant="outline-primary" size="lg" className="hover-scale">
                    Explore Learning Plans
                  </Button>
                </div>
              ) : (
                <div className="d-flex gap-3 flex-wrap">
                  <Button as={Link} to="/register" variant="primary" size="lg" className="pulse-button">
                    Get Started Free
                  </Button>
                  <Button as={Link} to="/login" variant="outline-primary" size="lg" className="hover-scale">
                    Login
                  </Button>
                </div>
              )}
            </Col>
            <Col lg={6} className="hero-image">
              <img 
                src={Logo} 
                alt="People learning together" 
                className="img-fluid floating-animation" 
              />
            </Col>
          </Row>
        </Container>
      </div>

      <section className="features-section py-5">
        <Container>
          <h2 className="text-center display-4 mb-5">How It Works</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="feature-card h-100 hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-4">
                    <i className="bi bi-people-fill fs-1"></i>
                  </div>
                  <Card.Title className="h3 mb-3">Connect with Learners</Card.Title>
                  <Card.Text className="text-muted">
                    Find like-minded individuals who share your interests and learning goals. Join study groups and participate in discussions.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card h-100 hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-4">
                    <i className="bi bi-lightbulb-fill fs-1"></i>
                  </div>
                  <Card.Title className="h3 mb-3">Share Knowledge</Card.Title>
                  <Card.Text className="text-muted">
                    Post tutorials, guides, and tips to help others learn from your experience. Earn recognition as an expert in your field.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card h-100 hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-4">
                    <i className="bi bi-graph-up fs-1"></i>
                  </div>
                  <Card.Title className="h3 mb-3">Track Your Progress</Card.Title>
                  <Card.Text className="text-muted">
                    Create learning plans, set goals, and monitor your progress over time. Stay motivated with achievement badges.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="statistics-section py-5 bg-light">
        <Container>
          <Row className="text-center g-4">
            <Col sm={3}>
              <div className="stat-item">
                <h3 className="display-4 fw-bold">10K+</h3>
                <p>Active Learners</p>
              </div>
            </Col>
            <Col sm={3}>
              <div className="stat-item">
                <h3 className="display-4 fw-bold">500+</h3>
                <p>Expert Mentors</p>
              </div>
            </Col>
            <Col sm={3}>
              <div className="stat-item">
                <h3 className="display-4 fw-bold">1000+</h3>
                <p>Learning Plans</p>
              </div>
            </Col>
            <Col sm={3}>
              <div className="stat-item">
                <h3 className="display-4 fw-bold">50+</h3>
                <p>Topics</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="testimonials-section py-5">
        <Container>
          <h2 className="text-center display-4 mb-5">What Our Users Say</h2>
          <Carousel className="testimonial-carousel">
            <Carousel.Item>
              <Card className="testimonial-card text-center mx-auto" style={{maxWidth: '700px'}}>
                <Card.Body className="p-5">
                  <blockquote className="mb-4">
                    "This platform has transformed the way I learn. The community is incredibly supportive and the resources are invaluable."
                  </blockquote>
                  <footer className="text-muted">- Sarah Johnson, Software Developer</footer>
                </Card.Body>
              </Card>
            </Carousel.Item>
            <Carousel.Item>
              <Card className="testimonial-card text-center mx-auto" style={{maxWidth: '700px'}}>
                <Card.Body className="p-5">
                  <blockquote className="mb-4">
                    "I've found amazing study partners and mentors here. The collaborative learning experience is unmatched!"
                  </blockquote>
                  <footer className="text-muted">- Mike Chen, Data Scientist</footer>
                </Card.Body>
              </Card>
            </Carousel.Item>
          </Carousel>
        </Container>
      </section>

      <section className="cta-section py-5 bg-primary text-white">
        <Container>
          <div className="text-center py-4">
            <h2 className="display-4 mb-4">Start Your Learning Journey Today</h2>
            <p className="lead mb-4">
              Join our community of learners and educators to accelerate your growth.
              Get access to exclusive resources, mentorship, and learning tools.
            </p>
            {!authenticated && (
              <Button as={Link} to="/register" variant="light" size="lg" className="pulse-button">
                Sign Up Now - It's Free!
              </Button>
            )}
          </div>
        </Container>
      </section>

      <section className="faq-section py-5">
        <Container>
          <h2 className="text-center display-4 mb-5">Frequently Asked Questions</h2>
          <Row className="g-4">
            <Col md={6}>
              <Card className="faq-card h-100">
                <Card.Body>
                  <h5>How do I get started?</h5>
                  <p>Simply sign up for a free account and start exploring learning plans and connecting with other learners.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="faq-card h-100">
                <Card.Body>
                  <h5>Is it really free?</h5>
                  <p>Yes! Our basic features are completely free. Premium features are available for advanced users.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;