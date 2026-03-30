import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

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
  return `${Math.floor(days / 30)}mo ago`;
}

function isNewApp(createdAt) {
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast, ToastElement } = useToast();
  const navigate = useNavigate();

  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Context menu state
  const [ctxMenu, setCtxMenu] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Drag state
  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Touch drag state
  const touchState = useRef({ startX: 0, startY: 0, dragging: false, idx: null, el: null, clone: null, scrollInterval: null });

  useEffect(() => {
    loadData();
  }, []);

  // Close context menu on any click outside
  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [ctxMenu]);

  async function loadData() {
    try {
      const [appsData, statsData] = await Promise.all([api.listApps(), api.getStats()]);
      setApps(appsData.apps);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.error || 'Failed to load apps. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function canManageApp(app) {
    return app.uploadedByEmail === user?.email || user?.role === 'admin';
  }

  // ── Context menu ──────────────────────────────────────────────────────────
  function handleContextMenu(e, app) {
    if (!canManageApp(app)) return;
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, app });
    setConfirmDeleteId(null);
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(appToDelete) {
    const prev = [...apps];
    setApps(apps.filter(a => a.id !== appToDelete.id));
    setCtxMenu(null);
    setConfirmDeleteId(null);

    try {
      await api.deleteApp(appToDelete.id);
      showToast(`${appToDelete.name} deleted`, 'success');
    } catch (err) {
      setApps(prev);
      showToast(err.error || 'Delete failed', 'error');
    }
  }

  // ── Drag (desktop) ───────────────────────────────────────────────────────
  function onDragStart(e, idx) {
    if (!editMode) { e.preventDefault(); return; }
    dragIdx.current = idx;
    setDraggingIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  }

  function onDragOver(e, idx) {
    e.preventDefault();
    dragOverIdx.current = idx;
    setDragOverIndex(idx);
  }

  function onDragEnd() {
    if (dragIdx.current !== null && dragOverIdx.current !== null && dragIdx.current !== dragOverIdx.current) {
      reorderApps(dragIdx.current, dragOverIdx.current);
    }
    dragIdx.current = null;
    dragOverIdx.current = null;
    setDraggingIdx(null);
    setDragOverIndex(null);
  }

  // ── Touch drag (mobile) ───────────────────────────────────────────────────
  function onTouchStart(e, idx) {
    if (!editMode) return;
    const touch = e.touches[0];
    touchState.current = { startX: touch.clientX, startY: touch.clientY, dragging: false, idx, el: e.currentTarget, clone: null, scrollInterval: null };
  }

  function onTouchMove(e) {
    const ts = touchState.current;
    if (ts.idx === null) return;
    const touch = e.touches[0];
    const dx = touch.clientX - ts.startX;
    const dy = touch.clientY - ts.startY;

    if (!ts.dragging && Math.sqrt(dx * dx + dy * dy) < 10) return;

    if (!ts.dragging) {
      ts.dragging = true;
      setDraggingIdx(ts.idx);
      // Create visual clone
      const clone = ts.el.cloneNode(true);
      clone.className = 'app-tile drag-clone';
      const rect = ts.el.getBoundingClientRect();
      clone.style.width = rect.width + 'px';
      clone.style.position = 'fixed';
      clone.style.zIndex = '300';
      clone.style.pointerEvents = 'none';
      document.body.appendChild(clone);
      ts.clone = clone;
    }

    e.preventDefault();
    if (ts.clone) {
      const rect = ts.el.getBoundingClientRect();
      ts.clone.style.left = (touch.clientX - rect.width / 2) + 'px';
      ts.clone.style.top = (touch.clientY - rect.height / 2) + 'px';
    }

    // Auto-scroll near edges
    clearInterval(ts.scrollInterval);
    if (touch.clientY < 60) {
      ts.scrollInterval = setInterval(() => window.scrollBy(0, -8), 16);
    } else if (touch.clientY > window.innerHeight - 60) {
      ts.scrollInterval = setInterval(() => window.scrollBy(0, 8), 16);
    }

    // Determine drop target
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
      const tile = target.closest('.app-tile');
      if (tile) {
        const targetIdx = parseInt(tile.dataset.idx);
        if (!isNaN(targetIdx)) setDragOverIndex(targetIdx);
      }
    }
  }

  function onTouchEnd() {
    const ts = touchState.current;
    clearInterval(ts.scrollInterval);
    if (ts.clone) {
      ts.clone.remove();
    }
    if (ts.dragging && ts.idx !== null && dragOverIndex !== null && ts.idx !== dragOverIndex) {
      reorderApps(ts.idx, dragOverIndex);
    }
    touchState.current = { startX: 0, startY: 0, dragging: false, idx: null, el: null, clone: null, scrollInterval: null };
    setDraggingIdx(null);
    setDragOverIndex(null);
  }

  // ── Reorder persistence ───────────────────────────────────────────────────
  function reorderApps(fromIdx, toIdx) {
    const updated = [...apps];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setApps(updated);
    api.reorderApps(updated.map(a => a.id)).catch(() => {
      showToast('Failed to save order', 'error');
    });
  }

  // ── Tile click ────────────────────────────────────────────────────────────
  function handleTileClick(app) {
    if (editMode) return;
    navigate(`/app/${app.id}`);
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 64 }}><div className="spinner" /></div>;
  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">&#x26A0;&#xFE0F;</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => { setLoading(true); setError(null); loadData(); }}>Try again</button>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📱</div>
        <h3>No apps yet</h3>
        <p>Upload your first HTML app and it'll appear here. Build something useful with Claude, ChatGPT, or any AI tool — then drag the HTML file here to share it with your team.</p>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>Upload your first app</button>
      </div>
    );
  }

  return (
    <div onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="page-header">
        <h1>Apps</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {editMode ? (
            <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>Done</button>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(true)}>Edit</button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}>+ Upload App</button>
        </div>
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
        {apps.map((app, idx) => (
          <div
            key={app.id}
            data-idx={idx}
            className={`app-tile${editMode ? ' wobble' : ''}${draggingIdx === idx ? ' dragging' : ''}${dragOverIndex === idx && draggingIdx !== idx ? ' drag-over' : ''}`}
            style={editMode ? { animationDelay: `${(idx % 5) * 0.08}s` } : undefined}
            onClick={() => handleTileClick(app)}
            onContextMenu={(e) => handleContextMenu(e, app)}
            draggable={editMode}
            onDragStart={(e) => onDragStart(e, idx)}
            onDragOver={(e) => onDragOver(e, idx)}
            onDragEnd={onDragEnd}
            onTouchStart={(e) => onTouchStart(e, idx)}
            title={!editMode ? (app.description || app.name) : undefined}
          >
            {editMode && canManageApp(app) && (
              <button
                className="app-tile-x"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDeleteId(app.id === confirmDeleteId ? null : app.id);
                }}
              >
                ✕
              </button>
            )}
            {confirmDeleteId === app.id && (
              <div className="tile-confirm-delete" onClick={(e) => e.stopPropagation()}>
                <p>Delete {app.name}?</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>This can't be undone.</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(app)}>Delete</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                </div>
              </div>
            )}
            {!editMode && isNewApp(app.createdAt) && <span className="app-tile-new">New</span>}
            {!editMode && app.visibility !== 'team' && (
              <span className="app-tile-badge">{app.visibility === 'private' ? '🔒' : '👥'}</span>
            )}
            <div className="app-tile-icon">{app.icon}</div>
            <span className="app-tile-name">{app.name}</span>
            <span className="app-tile-author">{app.uploadedBy}</span>
          </div>
        ))}
      </div>

      {/* Right-click context menu */}
      {ctxMenu && (
        <div className="ctx-menu" style={{ left: ctxMenu.x, top: ctxMenu.y }} onClick={(e) => e.stopPropagation()}>
          <button className="ctx-menu-item" onClick={() => { navigate(`/app/${ctxMenu.app.id}?update=true`); setCtxMenu(null); }}>
            Update
          </button>
          <button className="ctx-menu-item ctx-menu-danger" onClick={() => {
            setConfirmDeleteId(ctxMenu.app.id);
            setCtxMenu(null);
          }}>
            Delete
          </button>
        </div>
      )}

      {stats && stats.recentActivity.length > 0 && !editMode && (
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

      {ToastElement}
    </div>
  );
}
