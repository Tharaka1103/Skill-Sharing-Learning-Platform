import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaGoogle, FaFacebook, FaUser, FaLock } from 'react-icons/fa';
import { login } from '../../services/api';
import { setToken, removeToken, validateTokenFormat } from '../../services/auth';

const validationSchema = Yup.object().shape({
  usernameOrEmail: Yup.string().required('Username or Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await login(values.usernameOrEmail, values.password);
      console.log("Login response:", response.data);
      
      const token = response.data.accessToken || response.data.token;
      
      if (token) {
        // Clear any existing token first
        removeToken();
        // Then set the new token
        setToken(token);
        
        // Validate token format to ensure it contains all required fields
        if (!validateTokenFormat()) {
          setError('Invalid token format received from server');
          return;
        }
        
        navigate('/');
      } else {
        setError('Token not found in response');
        console.error("Token not found in response:", response.data);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setSubmitting(false);
    }
  };
    
  return (
    <Container fluid className="auth-form-container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0 rounded-lg">
            <Card.Body className="p-5">
              <h2 className="text-center mb-4 fw-bold">Welcome Back!</h2>
              {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
              
              <Formik
                initialValues={{ usernameOrEmail: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                  <Form onSubmit={handleSubmit} className="mb-4">
                    <Form.Group className="mb-4 position-relative">
                      <Form.Label className="fw-semibold">Username or Email</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FaUser />
                        </span>
                        <Form.Control
                          type="text"
                          name="usernameOrEmail"
                          value={values.usernameOrEmail}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.usernameOrEmail && errors.usernameOrEmail}
                          className="border-start-0"
                          placeholder="Enter your username or email"
                        />
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {errors.usernameOrEmail}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4 position-relative">
                      <Form.Label className="fw-semibold">Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FaLock />
                        </span>
                        <Form.Control
                          type="password"
                          name="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && errors.password}
                          className="border-start-0"
                          placeholder="Enter your password"
                        />
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mb-4 py-2 fw-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Logging in...' : 'Sign In'}
                    </Button>

                    <div className="position-relative mb-4">
                      <hr className="text-muted" />
                      <div className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
                        or continue with
                      </div>
                    </div>

                    <Row className="g-3 mb-4">
                      <Col xs={12} sm={6}>
                        <Button 
                          variant="outline-danger" 
                          href="http://localhost:4000/oauth2/authorize/google" 
                          className="w-100 d-flex align-items-center justify-content-center gap-2"
                        >
                          <FaGoogle /> Google
                        </Button>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Button 
                          variant="outline-primary" 
                          href="http://localhost:4000/oauth2/authorize/facebook" 
                          className="w-100 d-flex align-items-center justify-content-center gap-2"
                        >
                          <FaFacebook /> Facebook
                        </Button>
                      </Col>
                    </Row>

                    <div className="text-center">
                      <span className="text-muted">Don't have an account? </span>
                      <Link to="/register" className="text-decoration-none fw-semibold">Register here</Link>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
