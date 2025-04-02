import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OAuth2RedirectHandler from './components/auth/OAuth2RedirectHandler';
import PrivateRoute from './components/common/PrivateRoute';
import Feed from './components/posts/Feed';
import PostDetail from './components/posts/PostDetail';
import Profile from './components/user/Profile';
import LearningPlanList from './components/learning/LearningPlanList';
import LearningPlanDetail from './components/learning/LearningPlanDetail';
import LearningPlanForm from './components/learning/LearningPlanForm';
import EditProfile from './components/user/EditProfile';
import NotFound from './components/common/NotFound';

const App = () => {
  return (
    <Router>
      <Navigation />
      <main className="py-4">
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            
            <Route path="/feed" element={
              <PrivateRoute>
                <Feed />
              </PrivateRoute>
            } />
            
            <Route path="/posts/:postId" element={
              <PrivateRoute>
                <PostDetail />
              </PrivateRoute>
            } />
            
            <Route path="/profile/:username" element={<Profile />} />
            
            <Route path="/profile/edit" element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            } />
            
            <Route path="/learning-plans" element={
              <PrivateRoute>
                <LearningPlanList />
              </PrivateRoute>
            } />
            
            <Route path="/learning-plans/create" element={
              <PrivateRoute>
                <LearningPlanForm />
              </PrivateRoute>
            } />
            
            <Route path="/learning-plans/:planId" element={
              <PrivateRoute>
                <LearningPlanDetail />
              </PrivateRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </main>
    </Router>
  );
};

export default App;
