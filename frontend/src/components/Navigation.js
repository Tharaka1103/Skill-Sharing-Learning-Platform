import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getUserInfo, removeAccessToken } from '../services/auth';

const Navigation = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const userInfo = getUserInfo();
  const [expanded, setExpanded] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    removeAccessToken();
    setShowLogoutModal(false);
    navigate('/login');
  };

  return (
    <>
      <Navbar 
        bg="white" 
        variant="light" 
        fixed="top" 
        expand="lg" 
        expanded={expanded}
        onToggle={(expanded) => setExpanded(expanded)}
        className="py-2 shadow-sm"
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 d-flex align-items-center">
            <span className="me-2">🎯</span>
            Skill Share
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto ">
              <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)} className="px-3 py-2">
                <i className="fas fa-home me-2"></i>Home
              </Nav.Link>
              {authenticated && (
                <>
                  <Nav.Link as={Link} to="/feed" onClick={() => setExpanded(false)} className="px-3 py-2">
                    <i className="fas fa-stream me-2"></i>Feed
                  </Nav.Link>
                  <Nav.Link as={Link} to="/learning-plans" onClick={() => setExpanded(false)} className="px-3 py-2">
                    <i className="fas fa-book-reader me-2"></i>Learning Plans
                  </Nav.Link>
                </>
              )}
            </Nav>
            <Nav>
              {authenticated ? (
                <>
                  <Nav.Link 
                    as={Link} 
                    to={`/profile/${userInfo.username}`} 
                    onClick={() => setExpanded(false)}
                    className="px-3 py-2 d-flex align-items-center"
                  >
                    <i className="fas fa-user-circle me-2"></i>Profile
                  </Nav.Link>
                  <Button 
                    variant="danger" 
                    onClick={() => {
                      setShowLogoutModal(true);
                      setExpanded(false);
                    }}
                    className="ms-2 px-3 py-2 border-2 hover-shadow rounded-pill"
                  >
                    <i className="fas fa-sign-out-alt"></i>Exit
                  </Button>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" onClick={() => setExpanded(false)} className="px-3 py-2">
                    <i className="fas fa-sign-in-alt me-2"></i>Login
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register" onClick={() => setExpanded(false)} className="px-3 py-2">
                    <i className="fas fa-user-plus me-2"></i>Register
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        centered
        className="fade"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-5">
            <i className="fas fa-sign-out-alt text-danger me-2"></i>
            Confirm Logout
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="mb-0">Are you sure you want to logout from Skill Share?</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowLogoutModal(false)}
            className="rounded-pill px-4"
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleLogout}
            className="rounded-pill px-4 ms-2"
          >
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Navigation;