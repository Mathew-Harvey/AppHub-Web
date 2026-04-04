import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api, SANDBOX_BASE } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../hooks/usePlan';
import { useToast } from '../components/Toast';
import CodeErrorsModal from '../components/CodeErrorsModal';
import EditAppModal from '../components/EditAppModal';

export default function AppViewerPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan } = usePlan();
  const { showToast, ToastElement } = useToast();
  const iframeRef = useRef(null);

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sandboxToken, setSandboxToken] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateFile, setUpdateFile] = useState(null);
  const [updateDragOver, setUpdateDragOver] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [conversionInfo, setConversionInfo] = useState(null);
  const updateFileRef = useRef(null);

  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showEditApp, setShowEditApp] = useState(false);

  const [showCodeErrors, setShowCodeErrors] = useState(false);
  const [codeErrors, setCodeErrors] = useState([]);
  const [codeErrorsMessage, setCodeErrorsMessage] = useState('');
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => { loadApp(); }, [id]);
  useEffect(() => {
    api.getSandboxToken().then(data => setSandboxToken(data.token)).catch(() => {});
  }, []);
  useEffect(() => {
    if (searchParams.get('update') === 'true' && app) setShowUpdate(true);
  }, [searchParams, app]);

  const handleIframeMessage = useCallback((e) => {
    if (e.data?.type === 'sandbox-error' || e.data?.type === 'app-crash') {
      setIframeError(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [handleIframeMessage]);

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

  async function processUpdateFile(file) {
    setConversionInfo(null);
    try {
      const check = await api.checkFile(file.name);
      if (check.supported) setUpdateFile(file);
      else { setUpdateFile(null); setConversionInfo(check); }
    } catch { showToast('Error checking file', 'error'); }
  }

  async function handleUpdate() {
    if (!updateFile) return;
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('appFile', updateFile);
      const data = await api.updateAppFile(id, formData);
      setApp({ ...app, ...data.app });
      setShowUpdate(false);
      setUpdateFile(null);
      setIframeError(false);

      if (data.autoFixed && data.fixedErrors?.length) {
        showToast(`Fixed ${data.fixedErrors.length} error${data.fixedErrors.length !== 1 ? 's' : ''} in your code with AI`, 'success');
      } else {
        showToast('App updated', 'success');
      }
      if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
    } catch (err) {
      if (err.error === 'code_errors' && err.errors?.length) {
        setCodeErrors(err.errors);
        setCodeErrorsMessage(err.message || '');
        setShowCodeErrors(true);
      } else if (err.conversionPrompt) { setConversionInfo(err); setUpdateFile(null); }
      else showToast(err.error || 'Update failed', 'error');
    } finally { setUpdating(false); }
  }

  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;
  if (!app) return null;

  const canManage = app.uploadedByEmail === user?.email || user?.role === 'admin';

  function openEdit() {
    setEditName(app.name);
    setEditDescription(app.description || '');
    setShowEdit(true);
  }

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const data = await api.updateApp(id, { name: editName.trim(), description: editDescription.trim() });
      setApp({ ...app, ...data.app });
      setShowEdit(false);
      showToast('App details updated', 'success');
    } catch (err) {
      showToast(err.error || 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-viewer">
      <div className="app-viewer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← Back</button>
          <h3><span>{app.icon}</span>{app.name}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="app-viewer-builder">Built by {app.uploadedBy}</span>
          {canManage && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={openEdit}>Edit Details</button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowEditApp(true)}>Edit App</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowUpdate(true)}>Update File</button>
            </>
          )}
        </div>
      </div>

      {showEdit && (
        <div className="app-edit-panel">
          <div className="app-edit-grid">
            <div className="form-group">
              <label className="label">App Name</label>
              <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={100} />
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <input className="input" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Optional" maxLength={500} />
            </div>
          </div>
          <div className="app-edit-actions">
            <button className="btn btn-primary btn-sm" onClick={handleSaveEdit} disabled={saving || !editName.trim()}>
              {saving ? <span className="spinner" /> : 'Save'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowEdit(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
        <iframe
          ref={iframeRef}
          src={sandboxToken ? `${SANDBOX_BASE}/sandbox/${id}?token=${sandboxToken}` : ''}
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          title={app.name}
          style={{ flex: 1, width: '100%', border: 'none', background: 'white' }}
        />
        {iframeError && (
          <div className="iframe-error-overlay">
            <div className="iframe-error-content">
              <div className="iframe-error-icon">&#x26A0;&#xFE0F;</div>
              <h3>This app encountered an error</h3>
              <p>Something went wrong while running the app.</p>
              <button className="btn btn-secondary btn-sm" onClick={() => {
                setIframeError(false);
                if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
              }}>
                Reload App
              </button>
            </div>
          </div>
        )}
      </div>

      {showUpdate && (
        <div className="modal-overlay" onClick={() => { setShowUpdate(false); setUpdateFile(null); setConversionInfo(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>{app.icon}</span>
              <h3 style={{ fontSize: 16 }}>Update {app.name}</h3>
            </div>

            {conversionInfo && (
              <div className="conversion-prompt" style={{ margin: '0 0 16px' }}>
                <h3>&#x26A0;&#xFE0F; {conversionInfo.detected}</h3>
                <p>AppHub needs a single <strong>.html</strong> file.</p>
                <pre>{conversionInfo.conversionPrompt}</pre>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => setConversionInfo(null)}>Try another file</button>
              </div>
            )}

            {!updateFile && !conversionInfo && (
              <div
                className={`upload-zone${updateDragOver ? ' dragover' : ''}`}
                style={{ marginBottom: 0 }}
                onDragOver={(e) => { e.preventDefault(); setUpdateDragOver(true); }}
                onDragLeave={() => setUpdateDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setUpdateDragOver(false); if (e.dataTransfer.files[0]) processUpdateFile(e.dataTransfer.files[0]); }}
                onClick={() => updateFileRef.current?.click()}
              >
                <div className="upload-zone-icon">📄</div>
                <h3>Drop an updated HTML file</h3>
                <p>to replace the current version</p>
                <input ref={updateFileRef} type="file" accept=".html,.htm" onChange={(e) => { if (e.target.files[0]) processUpdateFile(e.target.files[0]); }} style={{ display: 'none' }} />
              </div>
            )}

            {updateFile && (
              <div style={{ padding: 16, background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: 16 }}>
                <div style={{ fontSize: 14 }}>📄 {updateFile.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{(updateFile.size / 1024).toFixed(1)} KB</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowUpdate(false); setUpdateFile(null); setConversionInfo(null); }}>Cancel</button>
              {updateFile && (
                <button className="btn btn-primary btn-sm" onClick={handleUpdate} disabled={updating}>
                  {updating ? <span className="spinner" /> : 'Update'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showCodeErrors && (
        <CodeErrorsModal
          errors={codeErrors}
          message={codeErrorsMessage}
          onClose={() => setShowCodeErrors(false)}
        />
      )}

      {showEditApp && (
        <EditAppModal
          app={app}
          plan={plan}
          onClose={() => setShowEditApp(false)}
          onUpdated={(updatedApp) => {
            setApp({ ...app, ...updatedApp });
            setShowEditApp(false);
            setIframeError(false);
            if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
            showToast('App updated', 'success');
          }}
        />
      )}

      {ToastElement}
    </div>
  );
}
