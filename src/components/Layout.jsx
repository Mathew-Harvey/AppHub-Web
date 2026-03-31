import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import EasterEgg from './EasterEgg';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

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

  const logoSrc = user?.workspace?.logoData || null;

  return (
    <div className="layout" style={style}>
      <header className="topbar">
        <div className="topbar-brand">
          {logoSrc && <img src={logoSrc} alt="" />}
          <h2>{user?.workspace?.name || 'AppHub'}</h2>
          {ws && (
            <span className={`plan-badge ${ws.plan === 'pro' ? 'plan-badge-pro' : 'plan-badge-free'}`}>
              {ws.plan === 'pro' ? 'PRO' : 'FREE'}
            </span>
          )}
        </div>

        <nav className="topbar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Apps
          </NavLink>
          <NavLink to="/upload" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Upload
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            About
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="topbar-user">
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
    </div>
  );
}
