import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardRouter } from './pages/DashboardRouter';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import SchedulePage from './pages/SchedulePage';
import { ReportsPage } from './pages/ReportsPage';
import MonitoringPage from './pages/MonitoringPage';
import PerformanceDashboard from './components/PerformanceDashboard';
import { RegionInfoPage } from './pages/RegionInfoPage';
import { RegionNoticesPage } from './pages/RegionNoticesPage';
import { RegionAdminDashboard } from './pages/RegionAdminDashboard';
import { RegionSectionEditor } from './pages/RegionSectionEditor';
import { NotFoundPage, ForbiddenPage, ServerErrorPage } from './pages/ErrorPages';

// Components
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import ShareTargetHandler from './components/ShareTargetHandler';

// Services
import { logDeploymentInfo } from './utils/buildUtils';
import { securityService } from './services/securityService';
import { indexedDBService } from './services/indexedDBService';
import { accessibilityService } from './services/accessibilityService';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated, isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, [setLoading]);

  useEffect(() => { logDeploymentInfo(); }, []);
  useEffect(() => { securityService.logSecurityInfo(); }, []);

  useEffect(() => {
    accessibilityService.setupSkipLinks();
    accessibilityService.announce('PM Application loaded successfully');
    indexedDBService.initialize().catch(console.error);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public routes - no layout wrapper */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />}
          />
          <Route path="/region/:regionId/info" element={<RegionInfoPage />} />
          <Route path="/share-target" element={<ShareTargetHandler />} />

          {/* Protected routes - wrapped in AppLayout */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardRouter /></PrivateRoute>} />
          <Route path="/project/:id" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
          <Route path="/project/:id/schedule" element={<PrivateRoute><SchedulePage /></PrivateRoute>} />
          <Route path="/schedule/:projectId" element={<PrivateRoute><SchedulePage /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
          <Route path="/monitoring" element={<PrivateRoute><MonitoringPage /></PrivateRoute>} />
          <Route path="/performance" element={<PrivateRoute><PerformanceDashboard /></PrivateRoute>} />
          <Route path="/region/notices" element={<PrivateRoute><RegionNoticesPage /></PrivateRoute>} />
          <Route path="/region/admin" element={<PrivateRoute><RegionAdminDashboard /></PrivateRoute>} />
          <Route path="/region/admin/sections/:sectionType" element={<PrivateRoute><RegionSectionEditor /></PrivateRoute>} />

          {/* Error routes */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
