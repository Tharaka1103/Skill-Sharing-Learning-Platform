import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { register } from '../../services/api';
import Logo from '../../assets/register.jpg'
const validationSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await register(values.username, values.email, values.password);
      setSuccess('Registration successful! You can now login.');
      resetForm();
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Response data:', err.response?.data);
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container fluid className="p-0">
      <Row className="g-0 min-vh-100">
        <Col md={6} className="p-0">
          <div className="h-100 position-fixed" style={{ width: '50%' }}>
            <img 
              src={Logo}
              alt="Register"
              className="w-100 h-100"
              style={{ objectFit: 'cover', objectPosition: 'left center' }}
            />
          </div>
        </Col>
        <Col md={6} className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
          <div className="w-100 px-4 py-5">
            <Card className="shadow-lg border-0 rounded-lg mx-auto" style={{ maxWidth: '500px' }}>
              <Card.Body className="p-4 p-md-5">
                <h2 className="text-center mb-4 fw-bold">Create Account</h2>
                {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
                {success && <Alert variant="success" className="rounded-3">{success}</Alert>}
                
                <Formik
                  initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                    <Form onSubmit={handleSubmit} className="needs-validation">
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Username</Form.Label>
                        <Form.Control
                          type="text"
                          name="username"
                          value={values.username}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.username && errors.username}
                          className="form-control-lg rounded-3"
                          placeholder="Enter your username"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.username}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.email && errors.email}
                          className="form-control-lg rounded-3"
                          placeholder="Enter your email"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && errors.password}
                          className="form-control-lg rounded-3"
                          placeholder="Enter your password"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.confirmPassword && errors.confirmPassword}
                          className="form-control-lg rounded-3"
                          placeholder="Confirm your password"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100 py-3 mb-4 rounded-3 fw-semibold"
                        disabled={isSubmitting}
                        size="lg"
                      >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </Form>
                  )}
                </Formik>

                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-decoration-none fw-semibold">
                      Sign In
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;