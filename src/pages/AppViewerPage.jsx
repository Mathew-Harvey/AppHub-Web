import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api, SANDBOX_BASE } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

export default function AppViewerPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, ToastElement } = useToast();
  const iframeRef = useRef(null);

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateFile, setUpdateFile] = useState(null);
  const [updateDragOver, setUpdateDragOver] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [conversionInfo, setConversionInfo] = useState(null);
  const updateFileRef = useRef(null);

  useEffect(() => { loadApp(); }, [id]);
  useEffect(() => {
    if (searchParams.get('update') === 'true' && app) setShowUpdate(true);
  }, [searchParams, app]);

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
      showToast('App updated', 'success');
      if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
    } catch (err) {
      if (err.conversionPrompt) { setConversionInfo(err); setUpdateFile(null); }
      else showToast(err.error || 'Update failed', 'error');
    } finally { setUpdating(false); }
  }

  if (loading) return <div className="spinner-page"><div className="spinner" /></div>;
  if (!app) return null;

  const canManage = app.uploadedByEmail === user?.email || user?.role === 'admin';

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
            <button className="btn btn-ghost btn-sm" onClick={() => setShowUpdate(true)}>Update</button>
          )}
        </div>
      </div>

      <iframe
        ref={iframeRef}
        src={`${SANDBOX_BASE}/sandbox/${id}`}
        sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
        title={app.name}
        style={{ flex: 1, width: '100%', border: 'none', background: 'white' }}
      />

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

      {ToastElement}
    </div>
  );
}
