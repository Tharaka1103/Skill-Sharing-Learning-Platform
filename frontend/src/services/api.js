import axios from 'axios';
import { getToken, isAuthenticated, logout } from './auth';

const API_BASE_URL = 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we get a 401, the token might be expired
      if (isAuthenticated()) {
        // Only logout if we thought we were authenticated
        console.log("Unauthorized response - logging out");
        logout();
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const login = (usernameOrEmail, password) => {
  console.log('Login attempt for:', usernameOrEmail);
  return api.post('/auth/signin', { usernameOrEmail, password });
};

export const register = (username, email, password) => {
  return api.post('/auth/signup', { username, email, password });
};

// User services
export const getCurrentUser = () => {
  return api.get('/users/me');
};

export const getUserProfile = (username) => {
  return api.get(`/users/${username}`);
};
export const updateUserProfile = (userData) => {
  return api.put('/users/me', userData);
};

export const followUser = (userId) => {
  return api.post(`/users/${userId}/follow`);
};

export const unfollowUser = (userId) => {
  return api.post(`/users/${userId}/unfollow`);
};

// Post API calls
export const getPosts = (page = 0, size = 10) => {
  return api.get(`/posts?page=${page}&size=${size}`);
};

export const getFeedPosts = (page = 0, size = 10) => {
  return api.get(`/posts/feed?page=${page}&size=${size}`);
};

export const getPostsByUser = (userId, page = 0, size = 10) => {
  return api.get(`/posts/user/${userId}?page=${page}&size=${size}`);
};

export const getPost = (postId) => {
  return api.get(`/posts/${postId}`);
};

export const createPost = (postData) => {
  return api.post('/posts', postData);
};

export const updatePost = (postId, postData) => {
  return api.put(`/posts/${postId}`, postData);
};

export const deletePost = (postId) => {
  return api.delete(`/posts/${postId}`);
};

// Comment API calls
export const getComments = (postId) => {
  return api.get(`/posts/${postId}/comments`);
};

export const createComment = (postId, content) => {
  return api.post(`/posts/${postId}/comments`, { content });
};

export const updateComment = (postId, commentId, content) => {
  return api.put(`/posts/${postId}/comments/${commentId}`, { content });
};

export const deleteComment = (postId, commentId) => {
  return api.delete(`/posts/${postId}/comments/${commentId}`);
};

// Like API calls
export const getLikeCount = (postId) => {
  return api.get(`/posts/${postId}/likes/count`);
};

export const hasUserLiked = (postId) => {
  return api.get(`/posts/${postId}/likes/status`);
};

export const toggleLike = (postId) => {
  return api.post(`/posts/${postId}/likes`);
};

// Learning Plan API calls
export const getLearningPlans = () => {
  return api.get('/learning-plans');
};

export const getLearningPlan = (planId) => {
  return api.get(`/learning-plans/${planId}`);
};

export const getUserLearningPlans = (userId) => {
  return api.get(`/learning-plans/user/${userId}`);
};

export const createLearningPlan = (planData) => {
  return api.post('/learning-plans', planData);
};

export const updateLearningPlan = (planId, planData) => {
  return api.put(`/learning-plans/${planId}`, planData);
};

export const deleteLearningPlan = (planId) => {
  return api.delete(`/learning-plans/${planId}`);
};

export default api;