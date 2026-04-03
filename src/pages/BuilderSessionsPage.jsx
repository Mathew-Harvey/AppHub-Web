import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useToast } from '../components/Toast';
import TokenUsageMeter, { useBuilderUsage } from '../components/TokenUsageMeter';
import { timeAgo } from '../utils/timeAgo';

const APP_TYPE_ICONS = {
  game: '🎮', tool: '🛠️', dashboard: '📊', form: '📝',
  calculator: '🧮', landing: '🌐', other: '✨',
};

const STATUS_CONFIG = {
  draft: { label: 'Draft', className: 'status-draft' },
  generating: { label: 'Generating', className: 'status-generating' },
  done: { label: 'Done', className: 'status-done' },
  published: { label: 'Published', className: 'status-published' },
};

export default function BuilderSessionsPage() {
  const navigate = useNavigate();
  const { showToast, ToastElement } = useToast();
  const { usage } = useBuilderUsage();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { loadSessions(); }, []);

  async function loadSessions() {
    try {
      const data = await api.builderSessions();
      setSessions(data.sessions || []);
    } catch {
      showToast('Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!confirm('Delete this build session? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.builderDeleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      showToast('Session deleted', 'info');
    } catch {
      showToast('Failed to delete session', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="builder-sessions-page">
      <div className="builder-sessions-header">
        <div>
          <h1 className="builder-sessions-title">
            <span className="builder-sparkle">✨</span> AI App Builder
          </h1>
          <p className="builder-sessions-sub">Describe what you want and we'll build it.</p>
        </div>
        <div className="builder-sessions-header-right">
          <TokenUsageMeter usage={usage} compact />
          <Link to="/builder/new" className="btn btn-primary">
            + New Build
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="builder-sessions-loading">
          <div className="spinner" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="builder-sessions-empty card">
          <div className="builder-sessions-empty-icon">🏗️</div>
          <h3>No builds yet</h3>
          <p>Start by describing what you want to build. Our AI will generate a fully working HTML app for you.</p>
          <Link to="/builder/new" className="btn btn-primary" style={{ marginTop: 16 }}>
            Create Your First Build
          </Link>
        </div>
      ) : (
        <div className="builder-sessions-grid">
          {sessions.map(s => {
            const statusCfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.draft;
            return (
              <div
                key={s.id}
                className="builder-session-card card"
                onClick={() => navigate(`/builder/${s.id}`)}
              >
                <div className="builder-session-card-top">
                  <span className="builder-session-card-icon">
                    {APP_TYPE_ICONS[s.appType] || '✨'}
                  </span>
                  <span className={`builder-session-status ${statusCfg.className}`}>
                    {statusCfg.label}
                  </span>
                </div>
                <h3 className="builder-session-card-name">{s.name}</h3>
                <div className="builder-session-card-meta">
                  {s.revisionCount > 0 && (
                    <span>{s.revisionCount} revision{s.revisionCount !== 1 ? 's' : ''}</span>
                  )}
                  <span>{timeAgo(s.updatedAt || s.createdAt)}</span>
                </div>
                <button
                  className="builder-session-delete"
                  onClick={(e) => handleDelete(e, s.id)}
                  disabled={deletingId === s.id}
                  title="Delete session"
                >
                  {deletingId === s.id ? (
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  ) : '✕'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {ToastElement}
    </div>
  );
}
