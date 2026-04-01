import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import UpgradeModal, { isPlanLimitError } from '../components/UpgradeModal';
import InviteModal from '../components/InviteModal';

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

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast, ToastElement } = useToast();
  const navigate = useNavigate();

  const [apps, setApps] = useState([]);
  const [folders, setFolders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAppIds, setNewAppIds] = useState(new Set());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [demoCollapsed, setDemoCollapsed] = useState(false);
  const [demoDismissing, setDemoDismissing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [openFolderId, setOpenFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState(false);
  const [folderNameDraft, setFolderNameDraft] = useState('');
  const [folderDragging, setFolderDragging] = useState(false);
  const [folderDragOutside, setFolderDragOutside] = useState(false);
  const folderDragRef = useRef({ folderId: null, appId: null, outsidePopover: false });
  const folderTouchRef = useRef({ folderId: null, appId: null, el: null, clone: null, dragging: false, startX: 0, startY: 0 });
  const popoverRef = useRef(null);

  // Jiggle / drag mode
  const [jiggleId, setJiggleId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  // Drag state
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [mergeTargetId, setMergeTargetId] = useState(null);

  const dragSourceRef = useRef({ idx: null, type: null, id: null });
  const dragOverRef = useRef(null);
  const mergeTimerRef = useRef(null);
  const hoverItemRef = useRef(null);

  // Touch drag
  const touchState = useRef({
    startX: 0, startY: 0, dragging: false,
    idx: null, el: null, clone: null, scrollInterval: null,
  });

  useEffect(() => { loadData(); }, []);
  useEffect(() => () => clearTimeout(longPressTimer.current), []);

  useEffect(() => {
    if (!jiggleId) return;
    function handleClick(e) {
      if (e.target.closest('.app-tile') || e.target.closest('.folder-tile') ||
          e.target.closest('.tile-confirm-delete') || e.target.closest('.folder-popover')) return;
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
      const [appsData, foldersData, statsData] = await Promise.all([
        api.listApps(),
        api.listFolders().catch(() => ({ folders: [] })),
        api.getStats(),
      ]);
      setApps(appsData.apps);
      setFolders(foldersData.folders);
      setStats(statsData);
      setError(null);

      const currentIds = appsData.apps.map(a => a.id);
      const baseline = new Set(JSON.parse(sessionStorage.getItem('baselineAppIds') || '[]'));
      if (baseline.size > 0) {
        setNewAppIds(new Set(currentIds.filter(id => !baseline.has(id))));
      }
      localStorage.setItem('knownAppIds', JSON.stringify(currentIds));
    } catch (err) {
      setError(err.error || 'Failed to load apps. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Derived data ──────────────────────────────────────────────────────────

  const folderedAppIds = new Set(folders.flatMap(f => f.apps.map(a => a.id)));
  const ungroupedApps = apps.filter(a => !folderedAppIds.has(a.id));
  const ungroupedUserApps = ungroupedApps.filter(a => !a.isDemo);
  const ungroupedDemoApps = ungroupedApps.filter(a => a.isDemo);

  const gridItems = [
    ...folders.map(f => ({ type: 'folder', id: f.id, sortOrder: f.sortOrder, data: f })),
    ...ungroupedUserApps.map(a => ({ type: 'app', id: a.id, sortOrder: a.sortOrder, data: a })),
  ].sort((a, b) => a.sortOrder - b.sortOrder);

  const filteredGridItems = searchQuery.trim()
    ? gridItems.filter(item => {
        const q = searchQuery.toLowerCase();
        if (item.type === 'folder') {
          return item.data.name.toLowerCase().includes(q) ||
            item.data.apps.some(a => a.name.toLowerCase().includes(q));
        }
        return item.data.name.toLowerCase().includes(q) ||
          (item.data.description || '').toLowerCase().includes(q) ||
          (item.data.uploadedBy || '').toLowerCase().includes(q);
      })
    : gridItems;

  const filteredDemoApps = searchQuery.trim()
    ? ungroupedDemoApps.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : ungroupedDemoApps;

  const openFolder = folders.find(f => f.id === openFolderId) || null;
  const isAdmin = user?.role === 'admin';
  const inJiggle = !!jiggleId;
  const userAppCount = stats?.userApps ?? 0;
  const hasOnlyDemos = stats && stats.userApps === 0 && ungroupedDemoApps.length > 0;

  function canManageApp(app) {
    return app.uploadedByEmail === user?.email || isAdmin;
  }

  // ── Long press ────────────────────────────────────────────────────────────

  function startLongPress(itemId) {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setJiggleId(itemId);
      setConfirmDeleteId(null);
    }, 500);
  }

  function cancelLongPress() {
    clearTimeout(longPressTimer.current);
  }

  // ── Folder CRUD ───────────────────────────────────────────────────────────

  async function handleCreateFolder(appId1, appId2) {
    try {
      const result = await api.createFolder({
        name: 'New Folder',
        icon: '📁',
        appIds: [appId1, appId2],
      });
      setFolders(prev => [...prev, result.folder]);
      setJiggleId(null);
      setOpenFolderId(result.folder.id);
      setEditingFolderName(true);
      setFolderNameDraft(result.folder.name);
      showToast('Folder created', 'success');
    } catch (err) {
      showToast(err.error || 'Failed to create folder', 'error');
    }
  }

  async function handleAddToFolder(folderId, appId) {
    try {
      await api.addAppToFolder(folderId, appId);
      const appData = apps.find(a => a.id === appId);
      setFolders(prev =>
        prev.map(f =>
          f.id === folderId
            ? { ...f, apps: [...f.apps, appData].filter(Boolean) }
            : f
        )
      );
      setJiggleId(null);
      showToast('Added to folder', 'success');
    } catch (err) {
      showToast(err.error || 'Failed to add to folder', 'error');
    }
  }

  async function handleRemoveFromFolder(folderId, appId) {
    try {
      const result = await api.removeAppFromFolder(folderId, appId);
      if (result.folderDeleted) {
        setFolders(prev => prev.filter(f => f.id !== folderId));
        setOpenFolderId(null);
        showToast('App removed — folder dissolved', 'info');
      } else {
        setFolders(prev =>
          prev.map(f =>
            f.id === folderId
              ? { ...f, apps: f.apps.filter(a => a.id !== appId) }
              : f
          )
        );
        showToast('Removed from folder', 'success');
      }
    } catch (err) {
      showToast(err.error || 'Failed to remove from folder', 'error');
    }
  }

  async function handleRenameFolder(folderId, newName) {
    if (!newName.trim()) return;
    try {
      await api.updateFolder(folderId, { name: newName.trim() });
      setFolders(prev =>
        prev.map(f => f.id === folderId ? { ...f, name: newName.trim() } : f)
      );
    } catch (err) {
      showToast(err.error || 'Failed to rename folder', 'error');
    }
  }

  async function handleDeleteFolder(folderId) {
    try {
      await api.deleteFolder(folderId);
      setFolders(prev => prev.filter(f => f.id !== folderId));
      setOpenFolderId(null);
      showToast('Folder deleted — apps released to grid', 'success');
    } catch (err) {
      showToast(err.error || 'Failed to delete folder', 'error');
    }
  }

  // ── Delete app ────────────────────────────────────────────────────────────

  async function handleDelete(appToDelete) {
    const prev = [...apps];
    setApps(apps.filter(a => a.id !== appToDelete.id));
    setConfirmDeleteId(null);
    setJiggleId(null);

    try {
      if (appToDelete.isDemo) {
        await api.deleteApp(appToDelete.id);
        showToast(`${appToDelete.name} dismissed`, 'success');
        loadData();
        return;
      }
      const result = await api.deleteApp(appToDelete.id);
      if (result.pending) {
        showToast('Deletion requested — waiting for admin approval', 'info');
        setApps(prev);
      } else {
        showToast(`${appToDelete.name} deleted`, 'success');
        loadData();
      }
    } catch (err) {
      setApps(prev);
      showToast(err.error || 'Delete failed', 'error');
    }
  }

  async function handleDismissDemos() {
    setDemoDismissing(true);
    await new Promise(r => setTimeout(r, 300));

    const prevApps = [...apps];
    setApps(apps.filter(a => !a.isDemo));
    try {
      await api.dismissDemos();
      showToast('Demo apps dismissed', 'success');
      loadData();
    } catch (err) {
      setApps(prevApps);
      setDemoDismissing(false);
      showToast(err.error || 'Failed to dismiss demos', 'error');
    }
  }

  // ── Drag: merge detection ─────────────────────────────────────────────────

  function checkMergeTarget(idx) {
    if (idx === null || idx === dragSourceRef.current.idx) {
      clearMergeTimer();
      return;
    }
    const targetItem = gridItems[idx];
    if (!targetItem) { clearMergeTimer(); return; }

    if (dragSourceRef.current.type !== 'app') {
      clearMergeTimer();
      return;
    }

    const targetKey = `${targetItem.type}-${targetItem.id}`;
    if (hoverItemRef.current === targetKey) return;

    clearMergeTimer();
    hoverItemRef.current = targetKey;

    if (targetItem.type === 'app' || targetItem.type === 'folder') {
      mergeTimerRef.current = setTimeout(() => {
        setMergeTargetId(targetItem.id);
      }, 400);
    }
  }

  function clearMergeTimer() {
    clearTimeout(mergeTimerRef.current);
    hoverItemRef.current = null;
    setMergeTargetId(null);
  }

  // ── Desktop drag ──────────────────────────────────────────────────────────

  function onDragStart(e, idx) {
    if (!inJiggle) { e.preventDefault(); return; }
    const item = gridItems[idx];
    dragSourceRef.current = { idx, type: item.type, id: item.id };
    setDraggingIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  }

  function onDragOver(e, idx) {
    e.preventDefault();
    dragOverRef.current = idx;
    setDragOverIndex(idx);
    checkMergeTarget(idx);
  }

  function onDragEnd() {
    const fromIdx = dragSourceRef.current.idx;
    const toIdx = dragOverRef.current;
    const source = dragSourceRef.current;

    if (fromIdx !== null && toIdx !== null && fromIdx !== toIdx) {
      if (mergeTargetId && source.type === 'app') {
        const targetItem = gridItems[toIdx];
        if (targetItem && targetItem.id === mergeTargetId) {
          if (targetItem.type === 'app') {
            handleCreateFolder(source.id, targetItem.id);
          } else if (targetItem.type === 'folder') {
            handleAddToFolder(targetItem.id, source.id);
          }
        }
      } else {
        reorderGrid(fromIdx, toIdx);
      }
    }

    dragSourceRef.current = { idx: null, type: null, id: null };
    dragOverRef.current = null;
    setDraggingIdx(null);
    setDragOverIndex(null);
    clearMergeTimer();
  }

  // ── Touch drag ────────────────────────────────────────────────────────────

  function onTouchStart(e, idx, itemId) {
    startLongPress(itemId);
    if (!inJiggle) return;
    const touch = e.touches[0];
    const item = gridItems[idx];
    dragSourceRef.current = { idx, type: item.type, id: item.id };
    touchState.current = {
      startX: touch.clientX, startY: touch.clientY,
      dragging: false, idx, el: e.currentTarget, clone: null, scrollInterval: null,
    };
  }

  function onTouchMove(e) {
    cancelLongPress();
    const ts = touchState.current;
    if (ts.idx === null || !inJiggle) return;
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
      const tile = target.closest('[data-grid-idx]');
      if (tile) {
        const targetIdx = parseInt(tile.dataset.gridIdx);
        if (!isNaN(targetIdx)) {
          setDragOverIndex(targetIdx);
          checkMergeTarget(targetIdx);
        }
      }
    }
  }

  function onTouchEnd() {
    cancelLongPress();
    const ts = touchState.current;
    clearInterval(ts.scrollInterval);
    if (ts.clone) ts.clone.remove();
    if (ts.dragging && ts.idx !== null && dragOverIndex !== null && ts.idx !== dragOverIndex) {
      if (mergeTargetId && dragSourceRef.current.type === 'app') {
        const targetItem = gridItems[dragOverIndex];
        if (targetItem && targetItem.id === mergeTargetId) {
          if (targetItem.type === 'app') {
            handleCreateFolder(dragSourceRef.current.id, targetItem.id);
          } else if (targetItem.type === 'folder') {
            handleAddToFolder(targetItem.id, dragSourceRef.current.id);
          }
        }
      } else {
        reorderGrid(ts.idx, dragOverIndex);
      }
    }
    touchState.current = { startX: 0, startY: 0, dragging: false, idx: null, el: null, clone: null, scrollInterval: null };
    dragSourceRef.current = { idx: null, type: null, id: null };
    setDraggingIdx(null);
    setDragOverIndex(null);
    clearMergeTimer();
  }

  // ── Reorder ───────────────────────────────────────────────────────────────

  function reorderGrid(fromIdx, toIdx) {
    const updated = [...gridItems];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);

    const newFolders = folders.map(f => ({ ...f }));
    const newApps = apps.map(a => ({ ...a }));

    updated.forEach((item, newIdx) => {
      if (item.type === 'folder') {
        const f = newFolders.find(fo => fo.id === item.id);
        if (f) f.sortOrder = newIdx;
      } else if (item.type === 'app') {
        const a = newApps.find(ap => ap.id === item.id);
        if (a) a.sortOrder = newIdx;
      }
    });

    setFolders(newFolders);
    setApps(newApps);

    const orderedUserAppIds = updated.filter(i => i.type === 'app').map(i => i.id);
    const demoAppIds = ungroupedDemoApps.map(a => a.id);
    api.reorderApps([...orderedUserAppIds, ...demoAppIds]).catch(() =>
      showToast('Failed to save order', 'error')
    );

    const folderLayout = updated
      .filter(i => i.type === 'folder')
      .map(i => ({ id: i.id, appIds: i.data.apps.map(a => a.id) }));
    if (folderLayout.length > 0) {
      api.saveFolderLayout(folderLayout).catch(() => {});
    }
  }

  // ── Folder popover drag-out ────────────────────────────────────────────────

  function onFolderAppDragStart(e, folderId, appId) {
    folderDragRef.current = { folderId, appId, outsidePopover: false };
    setFolderDragging(true);
    setFolderDragOutside(false);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  }

  function onFolderPopoverDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    folderDragRef.current.outsidePopover = false;
    if (folderDragging) setFolderDragOutside(false);
  }

  function onFolderOverlayDragOver(e) {
    e.preventDefault();
    if (!folderDragRef.current.appId) return;
    folderDragRef.current.outsidePopover = true;
    setFolderDragOutside(true);
  }

  function onFolderAppDragEnd() {
    const { folderId, appId, outsidePopover } = folderDragRef.current;
    if (outsidePopover && folderId && appId) {
      handleRemoveFromFolder(folderId, appId);
    }
    folderDragRef.current = { folderId: null, appId: null, outsidePopover: false };
    setFolderDragging(false);
    setFolderDragOutside(false);
  }

  function onFolderAppTouchStart(e, folderId, appId) {
    const touch = e.touches[0];
    folderTouchRef.current = {
      folderId, appId, el: e.currentTarget, clone: null,
      dragging: false, startX: touch.clientX, startY: touch.clientY,
    };
    folderDragRef.current = { folderId, appId, outsidePopover: false };
  }

  function onFolderTouchMove(e) {
    const ft = folderTouchRef.current;
    if (!ft.appId) return;
    const touch = e.touches[0];
    const dx = touch.clientX - ft.startX;
    const dy = touch.clientY - ft.startY;
    if (!ft.dragging && Math.sqrt(dx * dx + dy * dy) < 10) return;

    if (!ft.dragging) {
      ft.dragging = true;
      setFolderDragging(true);
      const clone = ft.el.cloneNode(true);
      clone.className = 'app-tile drag-clone';
      const rect = ft.el.getBoundingClientRect();
      clone.style.width = rect.width + 'px';
      clone.style.position = 'fixed';
      clone.style.zIndex = '300';
      clone.style.pointerEvents = 'none';
      document.body.appendChild(clone);
      ft.clone = clone;
    }

    e.preventDefault();
    if (ft.clone) {
      const rect = ft.el.getBoundingClientRect();
      ft.clone.style.left = (touch.clientX - rect.width / 2) + 'px';
      ft.clone.style.top = (touch.clientY - rect.height / 2) + 'px';
    }

    if (popoverRef.current) {
      const pr = popoverRef.current.getBoundingClientRect();
      const outside = touch.clientX < pr.left || touch.clientX > pr.right ||
                      touch.clientY < pr.top || touch.clientY > pr.bottom;
      setFolderDragOutside(outside);
      folderDragRef.current.outsidePopover = outside;
    }
  }

  function onFolderTouchEnd() {
    const ft = folderTouchRef.current;
    if (ft.clone) ft.clone.remove();

    if (ft.dragging && folderDragRef.current.outsidePopover && ft.folderId && ft.appId) {
      handleRemoveFromFolder(ft.folderId, ft.appId);
    }

    folderTouchRef.current = { folderId: null, appId: null, el: null, clone: null, dragging: false, startX: 0, startY: 0 };
    folderDragRef.current = { folderId: null, appId: null, outsidePopover: false };
    setFolderDragging(false);
    setFolderDragOutside(false);
  }

  // ── Click handlers ────────────────────────────────────────────────────────

  function handleTileClick(e, item) {
    if (longPressTriggered.current) return;
    if (inJiggle) return;
    if (item.type === 'folder') {
      setOpenFolderId(item.id);
      setEditingFolderName(false);
      setFolderNameDraft(item.data.name);
    } else {
      navigate(`/app/${item.data.id}`);
    }
  }

  function handleFolderNameSave() {
    setEditingFolderName(false);
    if (folderNameDraft.trim() && folderNameDraft.trim() !== openFolder?.name) {
      handleRenameFolder(openFolderId, folderNameDraft);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

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
        <p>Upload your first HTML app and it&apos;ll appear here. Build something useful with Claude, ChatGPT, or any AI tool — then drag the HTML file here to share it with your team.</p>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>Upload your first app</button>
      </div>
    );
  }

  return (
    <div onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {/* Welcome banner for first-time users with only demo apps */}
      {hasOnlyDemos && (
        <div className="welcome-banner">
          <div className="welcome-banner-icon">🚀</div>
          <h2>Welcome to AppHub!</h2>
          <p>We&apos;ve added some demo apps so you can explore. Upload your first app to get started.</p>
          <div className="welcome-banner-actions">
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>Upload Your First App</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowInviteModal(true)}>Invite Your Team</button>
            <button className="btn btn-ghost btn-sm" onClick={handleDismissDemos}>Dismiss demo apps</button>
          </div>
        </div>
      )}

      <div className="page-header">
        <h1>Apps</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}>+ Upload App</button>
      </div>

      {apps.length > 5 && (
        <div className="search-bar">
          <span className="search-bar-icon">🔍</span>
          <input
            className="search-bar-input"
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-bar-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
      )}

      {stats && (
        <div className="stats-bar">
          <span title="Demo apps don't count towards your limit">
            {userAppCount} {userAppCount === 1 ? 'app' : 'apps'}
            {stats.demoApps > 0 && <span className="stats-demo-note"> (+{stats.demoApps} demo)</span>}
          </span>
          <span className="stats-dot" />
          <span>{stats.totalBuilders} {stats.totalBuilders === 1 ? 'builder' : 'builders'}</span>
          <span className="stats-dot" />
          <span>{stats.newThisWeek} new this week</span>
          <span className="stats-dot" />
          <button className="stats-invite-link" onClick={() => setShowInviteModal(true)}>+ Invite</button>
        </div>
      )}

      {(() => {
        const limits = user?.workspace?.planLimits;
        if (!limits || limits.plan === 'pro') return null;
        const nearLimit = limits.maxApps && userAppCount >= limits.maxApps - 2 && userAppCount < limits.maxApps;
        const atLimit = limits.maxApps && userAppCount >= limits.maxApps;
        if (atLimit) return (
          <div className="limit-banner limit-banner-error">
            You&apos;ve reached the free plan limit of {limits.maxApps} apps.{' '}
            <button className="limit-banner-link" onClick={() => { setUpgradeMessage(`Free plan allows up to ${limits.maxApps} apps. Upgrade to Pro for unlimited apps.`); setShowUpgradeModal(true); }}>
              Upgrade to Pro
            </button>
          </div>
        );
        if (nearLimit) return (
          <div className="limit-banner limit-banner-warning">
            You&apos;re approaching your free plan limit ({userAppCount} / {limits.maxApps} apps).{' '}
            <button className="limit-banner-link" onClick={() => { setUpgradeMessage(`Free plan allows up to ${limits.maxApps} apps. Upgrade to Pro for unlimited apps.`); setShowUpgradeModal(true); }}>
              Upgrade to Pro
            </button>
          </div>
        );
        return null;
      })()}

      {/* Main grid: folders interleaved with ungrouped user apps */}
      {filteredGridItems.length > 0 && (
        <div className="app-grid">
          {filteredGridItems.map((item, idx) => {
            if (item.type === 'folder') {
              const folder = item.data;
              const isJiggling = jiggleId === folder.id;
              const isMergeTarget = mergeTargetId === folder.id;
              return (
                <div
                  key={folder.id}
                  data-grid-idx={idx}
                  className={`app-tile folder-tile${isJiggling ? ' wobble' : ''}${draggingIdx === idx ? ' dragging' : ''}${dragOverIndex === idx && draggingIdx !== idx && !isMergeTarget ? ' drag-over' : ''}${isMergeTarget ? ' merge-target' : ''}`}
                  style={isJiggling ? { animationDelay: '0s' } : undefined}
                  onClick={(e) => handleTileClick(e, item)}
                  onMouseDown={() => startLongPress(folder.id)}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                  onTouchStart={(e) => onTouchStart(e, idx, folder.id)}
                  draggable={inJiggle}
                  onDragStart={(e) => onDragStart(e, idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDragEnd={onDragEnd}
                  title={!inJiggle ? `${folder.name} — ${folder.apps.length} apps` : undefined}
                >
                  {isJiggling && (
                    <button
                      className="app-tile-x"
                      onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                    >
                      ✕
                    </button>
                  )}
                  <div className="folder-tile-icon">
                    <div className="folder-preview-grid">
                      {folder.apps.slice(0, 4).map(app => (
                        <span key={app.id} className="folder-preview-item">{app.icon}</span>
                      ))}
                      {folder.apps.length < 4 && Array.from({ length: 4 - Math.min(4, folder.apps.length) }).map((_, i) => (
                        <span key={`empty-${i}`} className="folder-preview-item folder-preview-empty" />
                      ))}
                    </div>
                  </div>
                  <span className="app-tile-name">{folder.name}</span>
                  <span className="app-tile-author">{folder.apps.length} apps</span>
                </div>
              );
            }

            const app = item.data;
            const isJiggling = jiggleId === app.id;
            const showX = isJiggling && canManageApp(app);
            const isMergeTarget = mergeTargetId === app.id;
            return (
              <div
                key={app.id}
                data-grid-idx={idx}
                className={`app-tile${isJiggling ? ' wobble' : ''}${draggingIdx === idx && !isJiggling ? ' dragging' : ''}${dragOverIndex === idx && draggingIdx !== idx && !isMergeTarget ? ' drag-over' : ''}${isMergeTarget ? ' merge-target' : ''}`}
                style={isJiggling ? { animationDelay: '0s' } : undefined}
                onClick={(e) => handleTileClick(e, item)}
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
                    <p className="tile-confirm-sub">{isAdmin ? "This can\u0027t be undone." : 'Admin approval required.'}</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(app)}>Delete</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                    </div>
                  </div>
                )}
                {!inJiggle && newAppIds.has(app.id) && <span className="app-tile-new">New</span>}
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
      )}

      {searchQuery && filteredGridItems.length === 0 && filteredDemoApps.length === 0 && (
        <div className="empty-state" style={{ padding: '40px 0' }}>
          <div className="empty-state-icon">🔍</div>
          <h3>No apps match "{searchQuery}"</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setSearchQuery('')}>Clear search</button>
        </div>
      )}

      {/* Demo apps section */}
      {filteredDemoApps.length > 0 && (
        <div className={`demo-section${demoDismissing ? ' demo-section-dismissing' : ''}`}>
          <div className="demo-section-header" onClick={() => setDemoCollapsed(!demoCollapsed)}>
            <span className="demo-section-title">Demo Apps — explore what&apos;s possible</span>
            <div className="demo-section-actions">
              <button className="demo-dismiss-all" onClick={(e) => { e.stopPropagation(); handleDismissDemos(); }}>
                Dismiss all
              </button>
              <span className="demo-section-toggle">{demoCollapsed ? '▸' : '▾'}</span>
            </div>
          </div>
          {!demoCollapsed && (
            <div className="app-grid demo-grid">
              {filteredDemoApps.map(app => (
                <div
                  key={app.id}
                  className="app-tile demo-app-tile"
                  onClick={() => navigate(`/app/${app.id}`)}
                  title={app.description || app.name}
                >
                  <span className="demo-badge">DEMO</span>
                  <button
                    className="demo-dismiss-btn"
                    onClick={(e) => { e.stopPropagation(); handleDelete(app); }}
                    title="Dismiss demo"
                  >
                    ✕
                  </button>
                  <div className="app-tile-icon">{app.icon}</div>
                  <span className="app-tile-name">{app.name}</span>
                  <span className="app-tile-author">{app.uploadedBy}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity feed */}
      {stats && stats.recentActivity && stats.recentActivity.length > 0 && !inJiggle && (
        <div className="activity-feed">
          <div className="activity-feed-title">Recent</div>
          <div className="activity-list">
            {stats.recentActivity.slice(0, 3).map((event, i) => (
              <div key={i} className="activity-item">
                <span className="activity-icon">{event.appIcon}</span>
                <span className="activity-text">
                  <strong>{event.uploadedBy}</strong> {event.appName}
                </span>
                <span className="activity-time">{timeAgo(event.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Folder popover */}
      {openFolder && (
        <div
          className={`folder-popover-overlay${folderDragOutside ? ' folder-drag-outside' : ''}`}
          onClick={() => { if (!folderDragging) setOpenFolderId(null); }}
          onDragOver={onFolderOverlayDragOver}
          onTouchMove={onFolderTouchMove}
          onTouchEnd={onFolderTouchEnd}
        >
          {folderDragOutside && <div className="folder-drag-outside-hint">Release to remove from folder</div>}
          <div
            className="folder-popover"
            ref={popoverRef}
            onClick={(e) => e.stopPropagation()}
            onDragOver={onFolderPopoverDragOver}
          >
            <div className="folder-popover-header">
              {editingFolderName ? (
                <input
                  className="folder-name-input"
                  value={folderNameDraft}
                  onChange={(e) => setFolderNameDraft(e.target.value)}
                  onBlur={handleFolderNameSave}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleFolderNameSave(); if (e.key === 'Escape') setEditingFolderName(false); }}
                  autoFocus
                />
              ) : (
                <h3
                  className="folder-popover-name"
                  onClick={() => { setEditingFolderName(true); setFolderNameDraft(openFolder.name); }}
                >
                  {openFolder.icon} {openFolder.name}
                  <span className="folder-name-edit-hint">✎</span>
                </h3>
              )}
              <button className="folder-popover-close" onClick={() => setOpenFolderId(null)}>✕</button>
            </div>
            <div className="folder-popover-grid">
              {openFolder.apps.map(app => (
                <div
                  key={app.id}
                  className="app-tile"
                  draggable
                  onDragStart={(e) => onFolderAppDragStart(e, openFolder.id, app.id)}
                  onDragEnd={onFolderAppDragEnd}
                  onTouchStart={(e) => onFolderAppTouchStart(e, openFolder.id, app.id)}
                  onClick={() => { if (!folderDragging) { setOpenFolderId(null); navigate(`/app/${app.id}`); } }}
                  title={app.description || app.name}
                >
                  <button
                    className="folder-app-remove"
                    onClick={(e) => { e.stopPropagation(); handleRemoveFromFolder(openFolder.id, app.id); }}
                    title="Remove from folder"
                  >
                    ✕
                  </button>
                  {app.isDemo && <span className="demo-badge">DEMO</span>}
                  <div className="app-tile-icon">{app.icon}</div>
                  <span className="app-tile-name">{app.name}</span>
                  <span className="app-tile-author">{app.uploadedBy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          limitMessage={upgradeMessage}
        />
      )}
      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      )}
      {ToastElement}
    </div>
  );
}
