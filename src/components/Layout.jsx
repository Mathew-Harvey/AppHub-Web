import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePlan } from '../hooks/usePlan';
import { useBuilderJobs } from '../contexts/BuilderContext';
import EasterEgg from './EasterEgg';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import InviteModal from './InviteModal';
import OnboardingOverlay from './OnboardingOverlay';
import EUAModal, { hasAcceptedEUA } from './EUAModal';
import { useToast } from './Toast';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showInvite, setShowInvite] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('apphub-onboarding-done');
  });
  const [showEUA, setShowEUA] = useState(() => !hasAcceptedEUA());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { showToast, ToastElement } = useToast();
  const location = useLocation();
  const { hasActiveJobs, completions, dismissCompletion } = useBuilderJobs();
  const prevCompletionsRef = useRef(completions);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close user menu on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  // Close user menu on route change
  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Show toasts for background build completions when NOT on a builder workspace page
  useEffect(() => {
    const prev = prevCompletionsRef.current;
    const newIds = Object.keys(completions).filter(id => !prev[id]);
    const onWorkspacePage = /^\/builder\/[^/]+$/.test(location.pathname) && !location.pathname.endsWith('/new') && !location.pathname.endsWith('/upgrade');

    if (newIds.length > 0 && !onWorkspacePage) {
      newIds.forEach(sid => {
        const c = completions[sid];
        if (c.status === 'done') {
          showToast(`"${c.sessionName}" is ready! Click AI Builder to view it.`, 'success');
        } else {
          showToast(`Build "${c.sessionName}" failed: ${c.error || 'unknown error'}`, 'error');
        }
        dismissCompletion(sid);
      });
    }
    prevCompletionsRef.current = completions;
  }, [completions, location.pathname]);

  const { isPaid, hasAppBuilder } = usePlan();

  const style = {};
  const ws = user?.workspace;

  if (isPaid) {
    if (theme === 'light') {
      if (ws?.primaryColorLight) style['--primary'] = ws.primaryColorLight;
      if (ws?.accentColorLight) style['--accent'] = ws.accentColorLight;
    } else {
      if (ws?.primaryColor) style['--primary'] = ws.primaryColor;
      if (ws?.accentColor) style['--accent'] = ws.accentColor;
    }
  }

  const apiHost = import.meta.env.VITE_API_URL || '';
  const logoSrc = isPaid && ws?.logoUrl ? `${apiHost}${ws.logoUrl}` : '/apphubLogo.png';
  const initials = user?.displayName ? user.displayName.charAt(0).toUpperCase() : '?';

  return (
    <div className="layout" style={style}>
      <header className="topbar">
        <div className="topbar-brand">
          <Link to="/" className="topbar-brand-link">
            <img src={logoSrc} alt="" className="topbar-logo" />
            <h2>{isPaid && ws?.name ? ws.name : 'AppHub'}</h2>
          </Link>
          <WorkspaceSwitcher />
        </div>

        <nav className="topbar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end data-onboarding="nav-apps">
            Apps
          </NavLink>
          <NavLink to="/upload" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} data-onboarding="nav-upload">
            Create
          </NavLink>
          <NavLink to="/marketplace" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Marketplace
          </NavLink>
          {hasAppBuilder && (
            <NavLink
              to="/builder"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              AI Builder
              {hasActiveJobs && <span className="nav-builder-building" title="Build in progress" />}
            </NavLink>
          )}
        </nav>

        <div className="topbar-user" ref={userMenuRef}>
          <button
            className="btn-theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            className="topbar-avatar"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            title={user?.displayName}
          >
            {initials}
          </button>

          {userMenuOpen && (
            <div className="topbar-user-menu">
              <div className="topbar-user-menu-header">
                <span className="topbar-user-menu-name">{user?.displayName}</span>
                <span className="topbar-user-menu-email">{user?.email}</span>
                {ws && (
                  <span className={`plan-badge ${isPaid ? 'plan-badge-pro' : 'plan-badge-free'}`} style={{ marginTop: 6 }}>
                    {(ws.planLimits?.planName || ws.plan || 'FREE').toUpperCase()}
                  </span>
                )}
              </div>
              <div className="topbar-user-menu-divider" />
              <button className="topbar-user-menu-item" onClick={() => { setUserMenuOpen(false); setShowInvite(true); }} data-onboarding="invite-btn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="5" r="3" />
                  <path d="M2 14c0-3 2-5 4-5s4 2 4 5" />
                  <line x1="12" y1="5" x2="12" y2="11" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                </svg>
                Invite team member
              </button>
              {!hasAppBuilder && (
                <button className="topbar-user-menu-item" onClick={() => { setUserMenuOpen(false); navigate('/builder/upgrade'); }}>
                  <span style={{ fontSize: 14 }}>&#x2728;</span>
                  AI Builder
                  <span className="plan-badge plan-badge-pro plan-badge-sm" style={{ marginLeft: 'auto' }}>PRO</span>
                </button>
              )}
              <button className="topbar-user-menu-item" onClick={() => { setUserMenuOpen(false); navigate('/settings'); }} data-onboarding="nav-settings">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="2" />
                  <path d="M13.4 10a1.2 1.2 0 0 0 .2 1.3l.1.1a1.4 1.4 0 1 1-2 2l-.1-.1A1.2 1.2 0 0 0 10 13.4v.2a1.4 1.4 0 1 1-2.8 0v-.1A1.2 1.2 0 0 0 6 12.2a1.2 1.2 0 0 0-1.3.2l-.1.1a1.4 1.4 0 1 1-2-2l.1-.1A1.2 1.2 0 0 0 2.6 9H2.4a1.4 1.4 0 1 1 0-2.8h.1A1.2 1.2 0 0 0 3.8 5a1.2 1.2 0 0 0-.2-1.3l-.1-.1a1.4 1.4 0 1 1 2-2l.1.1A1.2 1.2 0 0 0 7 2.6V2.4a1.4 1.4 0 1 1 2.8 0v.1A1.2 1.2 0 0 0 11 3.8a1.2 1.2 0 0 0 1.3-.2l.1-.1a1.4 1.4 0 1 1 2 2l-.1.1a1.2 1.2 0 0 0-.2 1.3h.2a1.4 1.4 0 1 1 0 2.8z" />
                </svg>
                Settings
              </button>
              <button className="topbar-user-menu-item" onClick={() => { setUserMenuOpen(false); navigate('/help'); }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="7" />
                  <path d="M6 6a2 2 0 1 1 2 2v1.5" />
                  <circle cx="8" cy="12" r="0.5" fill="currentColor" />
                </svg>
                Help
              </button>
              <div className="topbar-user-menu-divider" />
              <button className="topbar-user-menu-item topbar-user-menu-logout" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <span>&copy; {new Date().getFullYear()} App Hub</span>
        <span className="app-footer-sep">&middot;</span>
        <Link to="/about" className="app-footer-link">About</Link>
        <span className="app-footer-sep">&middot;</span>
        <Link to="/eua" className="app-footer-link">End User Licence Agreement</Link>
      </footer>

      <EasterEgg />
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      {showEUA && <EUAModal onAccept={() => setShowEUA(false)} />}
      {showOnboarding && !showEUA && (
        <OnboardingOverlay onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('apphub-onboarding-done', 'true');
        }} />
      )}
      {ToastElement}
    </div>
  );
}
