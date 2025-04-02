import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="text-center py-5">
      <h1 className="display-1">404</h1>
      <h2 className="mb-4">Page Not Found</h2>
      <p className="mb-4">We can't seem to find the page you're looking for.</p>
      <Button as={Link} to="/" variant="primary">Go to Home</Button>
    </Container>
  );
};

export default NotFound;
