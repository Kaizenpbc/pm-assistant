import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectPage } from './pages/ProjectPage';
import SchedulePage from './pages/SchedulePage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import AppLoadingWrapper from './components/AppLoadingWrapper';
import MonitoringDashboard from './components/MonitoringDashboard';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { ToastManager } from './components/ToastNotification';
import { toastService } from './services/toastService';
import { logDeploymentInfo } from './utils/buildUtils';
import { securityService } from './services/securityService';
import { indexedDBService } from './services/indexedDBService';
import { backgroundSyncService } from './services/backgroundSyncService';
import { accessibilityService } from './services/accessibilityService';
import AppShell from './components/AppShell';
import ShareTargetHandler from './components/ShareTargetHandler';

function App() {
  const { isAuthenticated, isLoading, setLoading, logout } = useAuthStore();
  const [toasts, setToasts] = useState(toastService.getToasts());

  // Initialize auth state
  useEffect(() => {
    // Set loading to false after a short delay to allow hydration
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [setLoading]);

  // Subscribe to toast changes
  useEffect(() => {
    const unsubscribe = toastService.subscribe(setToasts);
    return unsubscribe;
  }, []);

  // Log deployment information for debugging
  useEffect(() => {
    logDeploymentInfo();
  }, []);

  // Log security information for debugging
  useEffect(() => {
    securityService.logSecurityInfo();
  }, []);

  // Initialize accessibility features
  useEffect(() => {
    accessibilityService.setupSkipLinks();
    accessibilityService.announce('PM Application loaded successfully');
    
    // Initialize IndexedDB and background sync
    const initializeServices = async () => {
      try {
        await indexedDBService.initialize();
        console.log('✅ IndexedDB and background sync services initialized');
      } catch (error) {
        console.error('❌ Failed to initialize services:', error);
      }
    };
    
    initializeServices();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <AppLoadingWrapper fallbackMessage="Loading your project management workspace...">
        <Router>
          <AppShell>
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
                  path="/project/:id/schedule" 
                  element={
                    isAuthenticated ? <SchedulePage /> : <Navigate to="/login" replace />
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
                  path="/share-target" 
                  element={<ShareTargetHandler />} 
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
              
              {/* Toast Notifications */}
              <ToastManager 
                toasts={toasts} 
                onRemoveToast={(id) => toastService.removeToast(id)} 
              />
            </div>
          </AppShell>
        </Router>
      </AppLoadingWrapper>
    </ErrorBoundary>
  );
}

export default App;
