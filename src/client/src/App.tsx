import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectPage } from './pages/ProjectPage';
import SchedulePage from './pages/SchedulePage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import MonitoringDashboard from './components/MonitoringDashboard';
import PWAInstallPrompt from './components/PWAInstallPrompt';

function App() {
  const { isAuthenticated, isLoading, setLoading, logout } = useAuthStore();

  // Initialize auth state
  useEffect(() => {
    // Set loading to false after a short delay to allow hydration
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [setLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/project/:id" 
              element={
                isAuthenticated ? <ProjectPage /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/schedule/:projectId" 
              element={
                isAuthenticated ? <SchedulePage /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/monitoring" 
              element={
                isAuthenticated ? <MonitoringDashboard /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/" 
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
              } 
            />
          </Routes>
          
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
