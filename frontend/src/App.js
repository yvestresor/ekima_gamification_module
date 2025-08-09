import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { RecommendationProvider } from './context/RecommendationContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/common/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Page imports
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Subject from './pages/Subject';
import Topic from './pages/Topic';
import Chapter from './pages/Chapter';
import Progress from './pages/Progress';
import Experiments from './pages/Experiments';
import Videos from './pages/Videos';
import Simulations from './pages/Simulations';
import Models3D from './pages/Models3D';
import Questions from './pages/Questions';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Leaderboards from './pages/Leaderboards';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/common/ProtectedRoute';
import SubjectFormPage from './pages/SubjectFormPage';
import TopicFormPage from './pages/TopicFormPage';
import ChapterFormPage from './pages/ChapterFormPage';

// Styles
import './styles/globals.css';
import './styles/components.css';
import './styles/animations.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ProgressProvider>
              <RecommendationProvider>
              <Router>
              <div className="App">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  {/* Protected Routes */}
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/subjects" element={<Subjects />} />
                            <Route path="/subjects/new" element={<SubjectFormPage mode="add" />} />
                            <Route path="/subjects/:subjectId/edit" element={<SubjectFormPage mode="edit" />} />
                            <Route path="/subject/:subjectId" element={<Subject />} />
                            <Route path="/topic/:topicId" element={<Topic />} />
                            <Route path="/chapter/:chapterId" element={<Chapter />} />
                            <Route path="/experiments" element={<Experiments />} />
                            <Route path="/videos" element={<Videos />} />
                            <Route path="/simulations" element={<Simulations />} />
                            <Route path="/models" element={<Models3D />} />
                            <Route path="/questions" element={<Questions />} />
                            <Route path="/progress" element={<Progress />} />
                            <Route path="/leaderboards" element={<Leaderboards />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/topics/new" element={<TopicFormPage mode="add" />} />
                            <Route path="/topics/:topicId/edit" element={<TopicFormPage mode="edit" />} />
                            <Route path="/chapters/new" element={<ChapterFormPage mode="add" />} />
                            <Route path="/chapters/:chapterId/edit" element={<ChapterFormPage mode="edit" />} />
                            <Route path="*" element={<div>Page Not Found</div>} />
                          </Routes>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
              </Router>
              </RecommendationProvider>
            </ProgressProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;