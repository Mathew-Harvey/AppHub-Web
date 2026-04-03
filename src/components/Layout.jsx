import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePlan } from '../hooks/usePlan';
import { useBuilderJobs } from '../contexts/BuilderContext';
import EasterEgg from './EasterEgg';
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

  const { showToast, ToastElement } = useToast();
  const location = useLocation();
  const { hasActiveJobs, completions, dismissCompletion } = useBuilderJobs();
  const prevCompletionsRef = useRef(completions);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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

  const { isPaid, hasAppBuilder, isInvitedMember, workspaceHasPaidPlan } = usePlan();

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

  return (
    <div className="layout" style={style}>
      <header className="topbar">
        <div className="topbar-brand">
          <img src={logoSrc} alt="" className="topbar-logo" />
          <h2>{isPaid && ws?.name ? ws.name : 'AppHub'}</h2>
          {ws && (
            <span className={`plan-badge ${isPaid ? 'plan-badge-pro' : 'plan-badge-free'}`}>
              {isInvitedMember ? 'MEMBER' : (isPaid ? 'PRO' : 'FREE')}
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
          <NavLink
            to={hasAppBuilder ? '/builder' : '/builder/upgrade'}
            className={({ isActive }) => `nav-link nav-link-builder ${isActive ? 'active' : ''}`}
          >
            <span className="nav-builder-icon">{hasAppBuilder ? '✨' : '🔒'}</span>
            AI Builder
            {hasActiveJobs && <span className="nav-builder-building" title="Build in progress" />}
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

      <footer className="app-footer">
        <span>&copy; {new Date().getFullYear()} App Hub</span>
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
