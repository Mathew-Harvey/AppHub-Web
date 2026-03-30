import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, SANDBOX_BASE } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

export default function AppViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, ToastElement } = useToast();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    loadApp();
  }, [id]);

  async function loadApp() {
    try {
      const data = await api.getApp(id);
      setApp(data.app);
    } catch (err) {
      showToast(err.error || 'Failed to load app', 'error');
      setTimeout(() => navigate('/'), 1000);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      await api.deleteApp(id);
      showToast('App deleted', 'success');
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      showToast(err.error || 'Delete failed', 'error');
    }
  }

  if (loading) {
    return <div className="spinner-page"><div className="spinner" /></div>;
  }

  if (!app) return null;

  const isOwner = app.uploadedByEmail === user?.email;
  const isAdmin = user?.role === 'admin';
  const canManage = isOwner || isAdmin;

  return (
    <div className="app-viewer">
      <div className="app-viewer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            ← Back
          </button>
          <h3>
            <span>{app.icon}</span>
            {app.name}
          </h3>
          {app.description && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
              — {app.description}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            by {app.uploadedBy}
          </span>

          {canManage && (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowMenu(!showMenu)}
              >
                ⋯
              </button>

              {showMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 4,
                  minWidth: 150,
                  zIndex: 10,
                  boxShadow: 'var(--shadow)'
                }}>
                  {!confirmDelete ? (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger)' }}
                      onClick={() => setConfirmDelete(true)}
                    >
                      Delete app
                    </button>
                  ) : (
                    <div style={{ padding: 8, fontSize: 13 }}>
                      <p style={{ marginBottom: 8 }}>Are you sure?</p>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                          Yes, delete
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setConfirmDelete(false); setShowMenu(false); }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <iframe
        src={`${SANDBOX_BASE}/sandbox/${id}`}
        sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
        title={app.name}
        style={{ flex: 1, width: '100%', border: 'none', background: 'white' }}
      />

      {ToastElement}
    </div>
  );
}
