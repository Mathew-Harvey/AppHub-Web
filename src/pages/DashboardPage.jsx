import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function DashboardPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadApps();
  }, []);

  async function loadApps() {
    try {
      const data = await api.listApps();
      setApps(data.apps);
      setError(null);
    } catch (err) {
      console.error('Failed to load apps:', err);
      setError(err.error || 'Failed to load apps. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 64 }}><div className="spinner" /></div>;
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => { setLoading(true); setError(null); loadApps(); }}>
          Try again
        </button>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📱</div>
        <h3>No apps yet</h3>
        <p>
          Upload your first HTML app and it'll appear here.
          Build something useful with Claude, ChatGPT, or any AI tool — then drag the HTML file here to share it with your team.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          Upload your first app
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Apps</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}>
          + Upload App
        </button>
      </div>

      <div className="app-grid">
        {apps.map((app) => (
          <div
            key={app.id}
            className="app-tile"
            onClick={() => navigate(`/app/${app.id}`)}
            title={app.description || app.name}
          >
            {app.visibility !== 'team' && (
              <span className="app-tile-badge">
                {app.visibility === 'private' ? '🔒' : '👥'}
              </span>
            )}
            <div className="app-tile-icon">{app.icon}</div>
            <span className="app-tile-name">{app.name}</span>
            <span className="app-tile-author">{app.uploadedBy}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
