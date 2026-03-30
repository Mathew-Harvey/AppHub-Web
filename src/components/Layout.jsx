import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { resolveApiUrl } from '../utils/api';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Apply workspace theme colors
  const style = {};
  if (user?.workspace?.primaryColor) {
    style['--primary'] = user.workspace.primaryColor;
  }
  if (user?.workspace?.accentColor) {
    style['--accent'] = user.workspace.accentColor;
  }

  const logoSrc = resolveApiUrl(user?.workspace?.logoPath);

  return (
    <div className="layout" style={style}>
      <header className="topbar">
        <div className="topbar-brand">
          {logoSrc && <img src={logoSrc} alt="" />}
          <h2>{user?.workspace?.name || 'AppHub'}</h2>
        </div>

        <nav className="topbar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Apps
          </NavLink>
          <NavLink to="/upload" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Upload
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="topbar-user">
          <span>{user?.displayName}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
