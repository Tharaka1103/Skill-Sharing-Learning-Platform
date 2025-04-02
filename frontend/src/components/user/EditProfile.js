import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Spinner, Image } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { getUserProfile, updateUserProfile } from '../../services/api';
import { getUserInfo } from '../../services/auth';

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  bio: Yup.string()
});

const EditProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const userInfo = getUserInfo();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile(userInfo.username);
      setProfile(response.data);
      setPreviewImage(response.data.profilePicture);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSuccess(null);
      setError(null);
      
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('email', values.email);
      formData.append('bio', values.bio || '');
      
      if (values.profilePicture && values.profilePicture instanceof File) {
        formData.append('profilePicture', values.profilePicture);
      }
      
      await updateUserProfile(formData);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile. ' + (err.response?.data?.message || ''));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (event, setFieldValue) => {
    const file = event.target.files[0];
    if (file) {
      setFieldValue('profilePicture', file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </Spinner>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Profile not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h2 className="mb-4">Edit Profile</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Formik
        initialValues={{
          username: profile.username,
          email: profile.email,
          bio: profile.bio || '',
          profilePicture: null
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
          <Form onSubmit={handleSubmit}>
            <Card className="mb-4">
              <Card.Body>
                <div className="text-center mb-4">
                  <Image 
                    src={previewImage || "https://via.placeholder.com/150"} 
                    roundedCircle 
                    width={150} 
                    height={150} 
                    className="mb-3 profile-image" 
                  />
                  <div>
                    <Form.Group controlId="profilePicture">
                      <Form.Label className="btn btn-outline-primary">
                        Change Profile Picture
                        <Form.Control
                          type="file"
                          accept="image/*"
                          className="d-none"
                          onChange={(e) => handleImageChange(e, setFieldValue)}
                        />
                      </Form.Label>
                    </Form.Group>
                  </div>
                </div>
                
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.username && errors.username}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.email && errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    value={values.bio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.bio && errors.bio}
                    placeholder="Tell us about yourself..."
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.bio}
                  </Form.Control.Feedback>
                </Form.Group>
              </Card.Body>
            </Card>
            
            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default EditProfile;
