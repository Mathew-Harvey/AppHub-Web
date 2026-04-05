import { Component } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import AppViewerPage from './pages/AppViewerPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import EUAPage from './pages/EUAPage';
import BuilderSessionsPage from './pages/BuilderSessionsPage';
import BuilderNewPage from './pages/BuilderNewPage';
import BuilderWorkspacePage from './pages/BuilderWorkspacePage';
import BuilderUpgradePage from './pages/BuilderUpgradePage';
import SuperAdminPage from './pages/SuperAdminPage';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-page">
          <div className="auth-card card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1>Something went wrong</h1>
            <p className="subtitle">An unexpected error occurred.</p>
            <button
              className="btn btn-primary btn-full"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
              style={{ marginTop: 16 }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
    <Routes>
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      <Route path="/super-admin" element={<SuperAdminPage />} />
      <Route path="/app/:id" element={<ProtectedRoute><AppViewerPage /></ProtectedRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/eua" element={<EUAPage />} />
        <Route path="/converter" element={<Navigate to="/upload" replace />} />
        <Route path="/builder" element={<BuilderSessionsPage />} />
        <Route path="/builder/new" element={<BuilderNewPage />} />
        <Route path="/builder/upgrade" element={<BuilderUpgradePage />} />
        <Route path="/builder/:sessionId" element={<BuilderWorkspacePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/settings" element={<AdminPage />} />
      </Route>
      <Route path="*" element={
        <div className="auth-page">
          <div className="auth-card card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h1>Page not found</h1>
            <p className="subtitle">The page you're looking for doesn't exist.</p>
            <button className="btn btn-primary btn-full" onClick={() => window.location.href = '/'} style={{ marginTop: 16 }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      } />
    </Routes>
    </ErrorBoundary>
  );
}
