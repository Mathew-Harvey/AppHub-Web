import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function WorkspaceSwitcher() {
  const { user, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (open) {
      api.listWorkspaces().then(data => setWorkspaces(data.workspaces)).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowCreate(false);
        setError('');
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  async function handleSwitch(workspaceId) {
    setLoading(true);
    try {
      const data = await api.switchWorkspace(workspaceId);
      setOpen(false);
      // Full reload to reset all state
      window.location.href = '/';
    } catch (err) {
      setError(err.error || 'Failed to switch');
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.createWorkspace(newName.trim());
      window.location.href = '/';
    } catch (err) {
      if (err.error === 'plan_limit') {
        setError(err.message || 'Workspace limit reached. Upgrade your plan to create more.');
      } else {
        setError(err.error || 'Failed to create workspace');
      }
      setLoading(false);
    }
  }

  const apiHost = import.meta.env.VITE_API_URL || '';

  return (
    <div className="workspace-switcher" ref={ref}>
      <button
        className="workspace-switcher-trigger"
        onClick={() => setOpen(!open)}
        title="Switch workspace"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 6 8 10 12 6" />
        </svg>
      </button>

      {open && (
        <div className="workspace-switcher-dropdown">
          <div className="workspace-switcher-header">Workspaces</div>

          {workspaces.map(ws => (
            <button
              key={ws.workspaceId}
              className={`workspace-switcher-item ${ws.isCurrent ? 'current' : ''}`}
              onClick={() => !ws.isCurrent && handleSwitch(ws.workspaceId)}
              disabled={ws.isCurrent || loading}
            >
              {ws.logoUrl ? (
                <img src={`${apiHost}${ws.logoUrl}`} alt="" className="workspace-switcher-logo" />
              ) : (
                <div className="workspace-switcher-logo-placeholder">
                  {ws.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="workspace-switcher-info">
                <span className="workspace-switcher-name">{ws.name}</span>
                <span className="workspace-switcher-role">{ws.role}</span>
              </div>
              {ws.isCurrent && <span className="workspace-switcher-check">&#x2713;</span>}
            </button>
          ))}

          <div className="workspace-switcher-divider" />

          {showCreate ? (
            <form onSubmit={handleCreate} className="workspace-switcher-create-form">
              <input
                className="input"
                type="text"
                placeholder="Workspace name"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setError(''); }}
                autoFocus
                style={{ fontSize: 13 }}
              />
              {error && <p style={{ color: 'var(--danger)', fontSize: 11, margin: '4px 0 0' }}>{error}</p>}
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !newName.trim()} style={{ flex: 1 }}>
                  {loading ? <span className="spinner" /> : 'Create'}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowCreate(false); setError(''); }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              className="workspace-switcher-item workspace-switcher-create"
              onClick={() => setShowCreate(true)}
            >
              <div className="workspace-switcher-logo-placeholder" style={{ fontSize: 16 }}>+</div>
              <span className="workspace-switcher-name">Create new workspace</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
