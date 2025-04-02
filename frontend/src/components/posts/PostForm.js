import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  content: Yup.string().required('Content is required'),
  type: Yup.string().required('Post type is required')
});

const PostForm = ({ onSubmit, onCancel }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event, setFieldValue) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    
    // Convert files to Media objects for the API
    const mediaPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            url: e.target.result,
            type: file.type
          });
        };
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(mediaPromises).then(media => {
      setFieldValue('media', media);
    });
  };

  return (
    <Formik
      initialValues={{
        content: '',
        type: 'REGULAR',
        media: []
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isSubmitting }) => (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="What's on your mind?"
              name="content"
              value={values.content}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.content && errors.content}
            />
            <Form.Control.Feedback type="invalid">
              {errors.content}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Post Type</Form.Label>
            <Form.Select
              name="type"
              value={values.type}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.type && errors.type}
            >
              <option value="REGULAR">Regular Post</option>
              <option value="QUESTION">Question</option>
              <option value="LEARNING_PLAN">Learning Plan</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.type}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Attach Media (Optional)</Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={(e) => handleFileChange(e, setFieldValue)}
            />
            <Form.Text className="text-muted">
              You can attach up to 3 media files
            </Form.Text>
          </Form.Group>

          {selectedFiles.length > 0 && (
            <div className="selected-files mb-3">
              <p>Selected files:</p>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          {values.type === 'LEARNING_PLAN' && (
            <div className="learning-plan-form mb-3">
              <h5>Learning Plan Details</h5>
              <Form.Group className="mb-2">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="learningPlan.title"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="learningPlan.description"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Target Completion Date</Form.Label>
                <Form.Control
                  type="date"
                  name="learningPlan.completionTarget"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Form.Group>
            </div>
          )}

          <Row>
            <Col>
              <Button variant="secondary" onClick={onCancel} className="w-100">
                Cancel
              </Button>
            </Col>
            <Col>
              <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

export default PostForm;

