import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setAccessToken } from '../../services/auth';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getUrlParameter = (name) => {
      name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
      const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      const results = regex.exec(location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    const token = getUrlParameter('token');
    const error = getUrlParameter('error');

    if (token) {
      setAccessToken(token);
      navigate('/feed');
    } else {
      navigate('/login', { 
        state: { 
          error: error || 'OAuth2 authentication failed. Please try again.' 
        } 
      });
    }
  }, [location, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;
