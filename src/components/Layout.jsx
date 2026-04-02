import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import EasterEgg from './EasterEgg';
import InviteModal from './InviteModal';
import OnboardingOverlay from './OnboardingOverlay';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showInvite, setShowInvite] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('apphub-onboarding-done');
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const style = {};
  const ws = user?.workspace;
  if (theme === 'light') {
    if (ws?.primaryColorLight) style['--primary'] = ws.primaryColorLight;
    if (ws?.accentColorLight) style['--accent'] = ws.accentColorLight;
  } else {
    if (ws?.primaryColor) style['--primary'] = ws.primaryColor;
    if (ws?.accentColor) style['--accent'] = ws.accentColor;
  }

  const apiHost = import.meta.env.VITE_API_URL || '';
  const logoSrc = user?.workspace?.logoUrl ? `${apiHost}${user.workspace.logoUrl}` : '/apphubLogo.png';

  return (
    <div className="layout" style={style}>
      <header className="topbar">
        <div className="topbar-brand">
          <img src={logoSrc} alt="" className="topbar-logo" />
          <h2>{user?.workspace?.name || 'AppHub'}</h2>
          {ws && (
            <span className={`plan-badge ${ws.plan === 'pro' ? 'plan-badge-pro' : 'plan-badge-free'}`}>
              {ws.plan === 'pro' ? 'PRO' : 'FREE'}
            </span>
          )}
        </div>

        <nav className="topbar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end data-onboarding="nav-apps">
            Apps
          </NavLink>
          <NavLink to="/upload" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} data-onboarding="nav-upload">
            Upload
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            About
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} data-onboarding="nav-settings">
            Settings
          </NavLink>
        </nav>

        <div className="topbar-user">
          <button
            className="btn-invite-topbar"
            onClick={() => setShowInvite(true)}
            title="Invite someone to this workspace"
            data-onboarding="invite-btn"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="5" r="3" />
              <path d="M2 14c0-3 2-5 4-5s4 2 4 5" />
              <line x1="12" y1="5" x2="12" y2="11" />
              <line x1="9" y1="8" x2="15" y2="8" />
            </svg>
            <span>Invite</span>
          </button>
          <button
            className="btn-theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <span>{user?.displayName}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
      <EasterEgg />
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      {showOnboarding && (
        <OnboardingOverlay onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('apphub-onboarding-done', 'true');
        }} />
      )}
    </div>
  );
}
