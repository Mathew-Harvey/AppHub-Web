import { useState, useEffect, useRef } from 'react';
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
  return Date.now() - new Date(createdAt).getTime() < 48 * 60 * 60 * 1000;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast, ToastElement } = useToast();
  const navigate = useNavigate();

  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Long-press jiggle: tracks the APP ID, not the index
  const [jiggleId, setJiggleId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  // Drag state (indexes, since drag is positional)
  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Touch drag
  const touchState = useRef({ startX: 0, startY: 0, dragging: false, idx: null, el: null, clone: null, scrollInterval: null });

  useEffect(() => { loadData(); }, []);
  useEffect(() => () => clearTimeout(longPressTimer.current), []);

  // Click anywhere to exit jiggle mode
  useEffect(() => {
    if (!jiggleId) return;
    function handleClick(e) {
      if (e.target.closest('.app-tile') || e.target.closest('.tile-confirm-delete')) return;
      setJiggleId(null);
      setConfirmDeleteId(null);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [jiggleId]);

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

  const isAdmin = user?.role === 'admin';
  function canManageApp(app) {
    return app.uploadedByEmail === user?.email || isAdmin;
  }

  // ── Long press to jiggle (stores app ID, not index) ──────────────────────
  function startLongPress(appId) {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setJiggleId(appId);
      setConfirmDeleteId(null);
    }, 500);
  }

  function cancelLongPress() {
    clearTimeout(longPressTimer.current);
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(appToDelete) {
    const prev = [...apps];
    setApps(apps.filter(a => a.id !== appToDelete.id));
    setConfirmDeleteId(null);
    setJiggleId(null);

    try {
      const result = await api.deleteApp(appToDelete.id);
      if (result.pending) {
        showToast('Deletion requested — waiting for admin approval', 'info');
        setApps(prev);
      } else {
        showToast(`${appToDelete.name} deleted`, 'success');
      }
    } catch (err) {
      setApps(prev);
      showToast(err.error || 'Delete failed', 'error');
    }
  }

  // ── Drag (desktop) ───────────────────────────────────────────────────────
  function onDragStart(e, idx) {
    if (!jiggleId) { e.preventDefault(); return; }
    dragIdx.current = idx;
    setDraggingIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  }
  function onDragOver(e, idx) { e.preventDefault(); dragOverIdx.current = idx; setDragOverIndex(idx); }
  function onDragEnd() {
    if (dragIdx.current !== null && dragOverIdx.current !== null && dragIdx.current !== dragOverIdx.current) {
      reorderApps(dragIdx.current, dragOverIdx.current);
    }
    dragIdx.current = null; dragOverIdx.current = null;
    setDraggingIdx(null); setDragOverIndex(null);
  }

  // ── Touch drag ────────────────────────────────────────────────────────────
  function onTouchStart(e, idx, appId) {
    startLongPress(appId);
    if (!jiggleId) return;
    const touch = e.touches[0];
    touchState.current = { startX: touch.clientX, startY: touch.clientY, dragging: false, idx, el: e.currentTarget, clone: null, scrollInterval: null };
  }
  function onTouchMove(e) {
    cancelLongPress();
    const ts = touchState.current;
    if (ts.idx === null || !jiggleId) return;
    const touch = e.touches[0];
    const dx = touch.clientX - ts.startX;
    const dy = touch.clientY - ts.startY;
    if (!ts.dragging && Math.sqrt(dx * dx + dy * dy) < 10) return;
    if (!ts.dragging) {
      ts.dragging = true;
      setDraggingIdx(ts.idx);
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
    clearInterval(ts.scrollInterval);
    if (touch.clientY < 60) ts.scrollInterval = setInterval(() => window.scrollBy(0, -8), 16);
    else if (touch.clientY > window.innerHeight - 60) ts.scrollInterval = setInterval(() => window.scrollBy(0, 8), 16);
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
    cancelLongPress();
    const ts = touchState.current;
    clearInterval(ts.scrollInterval);
    if (ts.clone) ts.clone.remove();
    if (ts.dragging && ts.idx !== null && dragOverIndex !== null && ts.idx !== dragOverIndex) {
      reorderApps(ts.idx, dragOverIndex);
    }
    touchState.current = { startX: 0, startY: 0, dragging: false, idx: null, el: null, clone: null, scrollInterval: null };
    setDraggingIdx(null); setDragOverIndex(null);
  }

  function reorderApps(fromIdx, toIdx) {
    const updated = [...apps];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setApps(updated);
    api.reorderApps(updated.map(a => a.id)).catch(() => showToast('Failed to save order', 'error'));
  }

  function handleTileClick(e, app) {
    if (longPressTriggered.current) return;
    if (jiggleId) return;
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

  const inJiggle = !!jiggleId;

  return (
    <div onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="page-header">
        <h1>Apps</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}>+ Upload App</button>
      </div>

      {stats && (
        <div className="stats-bar">
          <span>{stats.totalApps} {stats.totalApps === 1 ? 'app' : 'apps'}</span>
          <span className="stats-dot" />
          <span>{stats.totalBuilders} {stats.totalBuilders === 1 ? 'builder' : 'builders'}</span>
          <span className="stats-dot" />
          <span>{stats.newThisWeek} new this week</span>
        </div>
      )}

      <div className="app-grid">
        {apps.map((app, idx) => {
          const isJiggling = jiggleId === app.id;
          const showX = isJiggling && canManageApp(app);
          return (
            <div
              key={app.id}
              data-idx={idx}
              className={`app-tile${isJiggling ? ' wobble' : ''}${draggingIdx === idx && !isJiggling ? ' dragging' : ''}${dragOverIndex === idx && draggingIdx !== idx ? ' drag-over' : ''}`}
              style={isJiggling ? { animationDelay: '0s' } : undefined}
              onClick={(e) => handleTileClick(e, app)}
              onMouseDown={() => startLongPress(app.id)}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              onTouchStart={(e) => onTouchStart(e, idx, app.id)}
              draggable={inJiggle}
              onDragStart={(e) => onDragStart(e, idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDragEnd={onDragEnd}
              title={!inJiggle ? (app.description || app.name) : undefined}
            >
              {showX && (
                <button
                  className="app-tile-x"
                  onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(app.id === confirmDeleteId ? null : app.id); }}
                >
                  ✕
                </button>
              )}
              {confirmDeleteId === app.id && (
                <div className="tile-confirm-delete" onClick={(e) => e.stopPropagation()}>
                  <p>Delete {app.name}?</p>
                  <p className="tile-confirm-sub">This can't be undone.</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(app)}>Delete</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                  </div>
                </div>
              )}
              {!inJiggle && isNewApp(app.createdAt) && <span className="app-tile-new">New</span>}
              {!inJiggle && app.visibility !== 'team' && (
                <span className="app-tile-badge">{app.visibility === 'private' ? '🔒' : '👥'}</span>
              )}
              <div className="app-tile-icon">{app.icon}</div>
              <span className="app-tile-name">{app.name}</span>
              <span className="app-tile-author">{app.uploadedBy}</span>
            </div>
          );
        })}
      </div>

      {stats && stats.recentActivity.length > 0 && !inJiggle && (
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
