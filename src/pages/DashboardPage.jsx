import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function isNewApp(createdAt) {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(createdAt).getTime() < sevenDaysMs;
}

export default function DashboardPage() {
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [appsData, statsData] = await Promise.all([
        api.listApps(),
        api.getStats()
      ]);
      setApps(appsData.apps);
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
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
        <div className="empty-state-icon">&#x26A0;&#xFE0F;</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => { setLoading(true); setError(null); loadData(); }}>
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

      {stats && (
        <div className="stats-bar">
          <span className="stats-item">{stats.totalApps} {stats.totalApps === 1 ? 'app' : 'apps'}</span>
          <span className="stats-dot" aria-hidden="true" />
          <span className="stats-item">{stats.totalBuilders} {stats.totalBuilders === 1 ? 'builder' : 'builders'}</span>
          <span className="stats-dot" aria-hidden="true" />
          <span className="stats-item">{stats.newThisWeek} new this week</span>
        </div>
      )}

      <div className="app-grid">
        {apps.map((app) => (
          <div
            key={app.id}
            className="app-tile"
            onClick={() => navigate(`/app/${app.id}`)}
            title={app.description || app.name}
          >
            {isNewApp(app.createdAt) && (
              <span className="app-tile-new">New</span>
            )}
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

      {stats && stats.recentActivity.length > 0 && (
        <div className="activity-feed">
          <h3 className="activity-feed-title">Recent activity</h3>
          <div className="activity-list">
            {stats.recentActivity.map((event, i) => (
              <div key={i} className="activity-item">
                <span className="activity-icon">{event.appIcon}</span>
                <span className="activity-text">
                  <strong>{event.uploadedBy}</strong> uploaded {event.appName}
                </span>
                <span className="activity-time">{timeAgo(event.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
