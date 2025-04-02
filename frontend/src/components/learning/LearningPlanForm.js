import React, { useState } from 'react';
import { Container, Form, Button, Card, ListGroup, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { createLearningPlan } from '../../services/api';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  steps: Yup.array().min(1, 'At least one step is required').of(
    Yup.object().shape({
      title: Yup.string().required('Step title is required')
    })
  )
});

const LearningPlanForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const initialValues = {
    title: '',
    description: '',
    category: '',
    steps: [{ title: '', description: '', completed: false }]
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await createLearningPlan(values);
      navigate(`/learning-plans/${response.data.id}`);
    } catch (err) {
      setError('Failed to create learning plan');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4">Create Learning Plan</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
          <Form onSubmit={handleSubmit}>
            <Card className="mb-4">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.title && errors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Category (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={values.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.description && errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Learning Steps</h4>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => {
                    setFieldValue('steps', [
                      ...values.steps,
                      { title: '', description: '', completed: false }
                    ]);
                  }}
                >
                  <FaPlus className="me-1" /> Add Step
                </Button>
              </Card.Header>
              
              <ListGroup variant="flush">
                {values.steps.map((step, index) => (
                  <ListGroup.Item key={index} className="py-3">
                    <div className="mb-3 d-flex justify-content-between">
                      <Form.Group className="flex-grow-1 me-2">
                        <Form.Control
                          type="text"
                          placeholder="Step title"
                          name={`steps[${index}].title`}
                          value={step.title}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={
                            touched.steps && 
                            touched.steps[index] && 
                            touched.steps[index].title && 
                            errors.steps && 
                            errors.steps[index] && 
                            errors.steps[index].title
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.steps && 
                           errors.steps[index] && 
                           errors.steps[index].title}
                        </Form.Control.Feedback>
                      </Form.Group>
                      {values.steps.length > 1 && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => {
                            const newSteps = [...values.steps];
                            newSteps.splice(index, 1);
                            setFieldValue('steps', newSteps);
                          }}
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Step description (optional)"
                        name={`steps[${index}].description`}
                        value={step.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              
              {errors.steps && typeof errors.steps === 'string' && (
                <div className="text-danger px-3 py-2">
                  {errors.steps}
                </div>
              )}
            </Card>
            
            <div className="d-flex gap-2 mt-4">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/learning-plans')}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Learning Plan'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default LearningPlanForm;
