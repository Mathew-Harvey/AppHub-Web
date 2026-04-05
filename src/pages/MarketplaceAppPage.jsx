import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useToast } from '../components/Toast';

function timeAgo(dateString) {
  if (!dateString) return '';
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function MarketplaceAppPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastElement } = useToast();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.getMarketplaceApp(id)
      .then(data => setApp(data.app))
      .catch(err => setError(err.message || 'App not found'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleInstall() {
    setInstalling(true);
    try {
      await api.installMarketplaceApp(id);
      showToast(`"${app.name}" added to your workspace!`, 'success');
      setApp(prev => ({ ...prev, alreadyAdded: true, installCount: prev.installCount + 1 }));
    } catch (err) {
      if (err.status === 409) {
        showToast('App is already in your workspace', 'info');
        setApp(prev => ({ ...prev, alreadyAdded: true }));
      } else {
        showToast(err.message || 'Failed to add app', 'error');
      }
    } finally {
      setInstalling(false);
    }
  }

  if (loading) {
    return <div className="spinner-page"><div className="spinner" /></div>;
  }

  if (error) {
    return (
      <div className="marketplace-detail-page">
        <div className="marketplace-detail-error card">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h2>App not found</h2>
          <p className="text-muted">{error}</p>
          <Link to="/marketplace" className="btn btn-primary" style={{ marginTop: 16 }}>
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-detail-page">
      <div className="marketplace-detail-back">
        <button className="btn btn-ghost" onClick={() => navigate('/marketplace')}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 2L4 8l6 6" />
          </svg>
          Back to Marketplace
        </button>
      </div>

      <div className="marketplace-detail-card card">
        <div className="marketplace-detail-header">
          <div className="marketplace-detail-icon">{app.icon}</div>
          <div className="marketplace-detail-info">
            <h1 className="marketplace-detail-name">{app.name}</h1>
            <div className="marketplace-detail-meta">
              <span className="marketplace-detail-publisher">by {app.publisherName}</span>
              {app.marketplaceCategory && (
                <span className="marketplace-detail-cat-badge">{app.marketplaceCategory}</span>
              )}
            </div>
          </div>
        </div>

        <div className="marketplace-detail-stats">
          <div className="marketplace-detail-stat">
            <span className="marketplace-detail-stat-value">{app.installCount}</span>
            <span className="marketplace-detail-stat-label">installs</span>
          </div>
          <div className="marketplace-detail-stat">
            <span className="marketplace-detail-stat-value">{timeAgo(app.publishedAt)}</span>
            <span className="marketplace-detail-stat-label">published</span>
          </div>
          {app.fileSize && (
            <div className="marketplace-detail-stat">
              <span className="marketplace-detail-stat-value">{(app.fileSize / 1024).toFixed(0)} KB</span>
              <span className="marketplace-detail-stat-label">size</span>
            </div>
          )}
        </div>

        {app.description && (
          <div className="marketplace-detail-desc">
            <h3>About</h3>
            <p>{app.description}</p>
          </div>
        )}

        {app.marketplaceTags && app.marketplaceTags.length > 0 && (
          <div className="marketplace-detail-tags">
            {app.marketplaceTags.map((tag, i) => (
              <span key={i} className="marketplace-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="marketplace-detail-actions">
          {app.alreadyAdded ? (
            <div className="marketplace-already-added">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 8 7 12 13 4" />
              </svg>
              <span>Already in your workspace</span>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
                Go to Dashboard
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary marketplace-install-btn"
              onClick={handleInstall}
              disabled={installing}
            >
              {installing ? (
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M8 2v8M4 7l4 4 4-4" />
                    <line x1="2" y1="14" x2="14" y2="14" />
                  </svg>
                  Add to My Workspace
                </>
              )}
            </button>
          )}
        </div>

        <div className="marketplace-detail-notice">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="8" cy="8" r="7" />
            <line x1="8" y1="7" x2="8" y2="11" />
            <circle cx="8" cy="5" r="0.5" fill="currentColor" />
          </svg>
          <span>A copy of this app will be added to your workspace. The original publisher's data stays private.</span>
        </div>
      </div>
      {ToastElement}
    </div>
  );
}
