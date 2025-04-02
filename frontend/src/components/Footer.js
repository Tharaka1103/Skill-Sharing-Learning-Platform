  import React from 'react';
  import { Container, Row, Col } from 'react-bootstrap';
  import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

  const Footer = () => {
    return (
      <footer className="bg-dark text-light py-5">
        <Container>
          <Row className="gy-4">
            <Col lg={4} md={6}>
              <h4 className="fw-bold mb-4">About SkillShare</h4>
              <p className="text-secondary">
                Empowering individuals through knowledge sharing and skill development. Join our community of learners and experts to enhance your capabilities.
              </p>
            </Col>
            <Col lg={2} md={6}>
              <h4 className="fw-bold mb-4">Quick Links</h4>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-light">Home</a></li>
                <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-light">Courses</a></li>
                <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-light">Instructors</a></li>
                <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-light">About Us</a></li>
                <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-light">Contact</a></li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h4 className="fw-bold mb-4">Popular Categories</h4>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-light">Web Development</a></li>
                <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-light">Digital Marketing</a></li>
                <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-light">Data Science</a></li>
                <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-light">Business</a></li>
                <li className="mb-2"><a href="#" className="text-secondary text-decoration-none hover-light">Design</a></li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h4 className="fw-bold mb-4">Contact Info</h4>
              <div className="text-secondary">
                <p className="d-flex align-items-center mb-3">
                  <FaPhone className="me-3" /> +1 234 567 8900
                </p>
                <p className="d-flex align-items-center mb-3">
                  <FaEnvelope className="me-3" /> info@skillshare.com
                </p>
                <p className="d-flex align-items-center mb-3">
                  <FaMapMarkerAlt className="me-3" /> 123 Learning Street, Education City, ST 12345
                </p>
              </div>
            </Col>
          </Row>
          <hr className="border-secondary my-4" />
          <Row>
            <Col className="text-center text-secondary">
              <p className="mb-0">© {new Date().getFullYear()} SkillShare. All rights reserved.</p>
            </Col>
          </Row>
        </Container>
      </footer>
    );
  };

  export default Footer;
