import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getUserInfo, removeAccessToken } from '../services/auth';

const Navigation = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const userInfo = getUserInfo();

  const handleLogout = () => {
    removeAccessToken();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" fixed="top" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Skill Share</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {authenticated && (
              <>
                <Nav.Link as={Link} to="/feed">Feed</Nav.Link>
                <Nav.Link as={Link} to="/learning-plans">Learning Plans</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {authenticated ? (
              <>
                <Nav.Link as={Link} to={`/profile/${userInfo.username}`}>Profile</Nav.Link>
                <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
