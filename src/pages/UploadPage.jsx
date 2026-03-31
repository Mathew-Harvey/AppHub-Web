import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import IconPicker from '../components/IconPicker';

const INSPIRATION = [
  { icon: '💰', name: 'Quote calculator', desc: 'Enter line items, get a total with GST.', prompt: 'Build me an HTML quote calculator where I can add line items with description, quantity, and unit price, then see a subtotal plus GST.' },
  { icon: '📋', name: 'Checklist generator', desc: 'Create printable checklists for any process.', prompt: 'Build me an HTML checklist maker where I type a title and checklist items, then print a clean formatted checklist.' },
  { icon: '⏱️', name: 'Time tracker', desc: 'Log hours, export weekly summary as CSV.', prompt: 'Build me an HTML time tracker where I log project name, date, and hours. Show a weekly summary table and let me export to CSV.' },
  { icon: '🔄', name: 'Unit converter', desc: 'Convert between units your team actually uses.', prompt: 'Build me an HTML unit converter for common measurements: mm/inches, kg/lbs, litres/gallons, celsius/fahrenheit. Clean and fast.' },
];

const AI_SPINNER_LINES = [
  'Hiring an AI developer...',
  'Onboarding the new hire...',
  'AI dev asking where the tests are...',
  'Training the AI on your codebase...',
  'AI dev requesting a standing desk...',
  'Reviewing the AI\'s first draft...',
  'AI dev refactoring for the 3rd time...',
  'Filing a performance review...',
  'AI dev asking for a raise...',
  'Denied. Back to work.',
  'Almost there. Probably.',
  'AI dev submitting final version...',
  'Good work done. Deploying.',
];

function AiSpinner() {
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIdx(i => (i + 1) % AI_SPINNER_LINES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ai-spinner">
      <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      <p className="ai-spinner-line" key={lineIdx}>{AI_SPINNER_LINES[lineIdx]}</p>
    </div>
  );
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, ToastElement } = useToast();
  const fileInputRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [rawFile, setRawFile] = useState(null); // original non-HTML file for AI conversion
  const [conversionInfo, setConversionInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [converting, setConverting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📱');
  const [visibility, setVisibility] = useState('team');
  const [members, setMembers] = useState([]);
  const [sharedWith, setSharedWith] = useState([]);
  const [uploading, setUploading] = useState(false);

  const isPro = user?.workspace?.plan === 'pro';

  useEffect(() => {
    api.getMembers().then(d => setMembers(d.members)).catch(() => {});
  }, []);

  function handleDragOver(e) { e.preventDefault(); setDragOver(true); }
  function handleDragLeave() { setDragOver(false); }
  async function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) await processFile(e.dataTransfer.files[0]);
  }
  function handleFileSelect(e) {
    if (e.target.files[0]) processFile(e.target.files[0]);
  }

  async function processFile(f) {
    setConversionInfo(null);
    setCopied(false);
    setRawFile(null);

    try {
      const check = await api.checkFile(f.name);

      if (check.supported) {
        setFile(f);
        const baseName = f.name.replace(/\.(html|htm)$/i, '').replace(/[-_]/g, ' ');
        if (!name) setName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
      } else {
        setFile(null);
        setRawFile(f);
        setConversionInfo(check);
        // Auto-populate name from filename
        const baseName = f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        if (!name) setName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
      }
    } catch (err) {
      showToast('Error checking file', 'error');
    }
  }

  async function handleAiConvert() {
    if (!rawFile) return;
    setConverting(true);
    try {
      const formData = new FormData();
      formData.append('appFile', rawFile);
      const { jobId } = await api.startConvert(formData);

      // Poll for result
      const poll = async () => {
        const result = await api.pollConvert(jobId);
        if (result.status === 'processing') {
          setTimeout(poll, 2000);
          return;
        }
        if (result.status === 'failed') {
          setConverting(false);
          showToast(result.error || 'Conversion failed', 'error');
          return;
        }
        // Done
        const htmlBlob = new Blob([result.html], { type: 'text/html' });
        const htmlFile = new File([htmlBlob], name.replace(/\s+/g, '-').toLowerCase() + '.html', { type: 'text/html' });
        setFile(htmlFile);
        setConversionInfo(null);
        setRawFile(null);
        setConverting(false);
        showToast('Converted successfully', 'success');
      };
      poll();
    } catch (err) {
      setConverting(false);
      if (err.error === 'upgrade_required') {
        showToast('Pro subscription required for AI conversion', 'error');
      } else if (err.used !== undefined) {
        showToast(`Monthly limit reached (${err.used}/${err.limit} conversions)`, 'error');
      } else {
        showToast(err.error || 'Conversion failed', 'error');
      }
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file || !name) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('appFile', file);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('icon', icon);
      formData.append('visibility', visibility);
      if (visibility === 'specific') {
        formData.append('sharedWith', JSON.stringify(sharedWith));
      }

      await api.uploadApp(formData);
      setUploadSuccess(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      if (err.conversionPrompt) {
        setConversionInfo(err);
        setFile(null);
      } else {
        showToast(err.error || 'Upload failed', 'error');
      }
    } finally {
      setUploading(false);
    }
  }

  async function copyPrompt(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      showToast('Failed to copy — select and copy manually', 'error');
    }
  }

  if (uploadSuccess) {
    return (
      <div className="upload-success">
        <div className="upload-success-icon">{icon}</div>
        <h2>{name}</h2>
        <p>Your app is live. Your team can use it now.</p>
      </div>
    );
  }

  if (converting) {
    return <AiSpinner />;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Upload App</h1>
      </div>

      {/* Conversion prompt (shown when wrong file type) */}
      {conversionInfo && (
        <div className="conversion-prompt">
          <h3>{conversionInfo.detected || 'Unsupported file type'}</h3>
          <p>
            AppHub needs a single <strong>.html</strong> file.
            {isPro
              ? ' We can auto-convert this for you, or copy the prompt below to do it yourself.'
              : ' Copy the prompt below and paste it into your AI tool to convert it.'}
          </p>

          {isPro && (
            <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={handleAiConvert}>
              Auto-convert with AI
            </button>
          )}

          {!isPro && (
            <div className="upgrade-prompt">
              <p className="upgrade-text">
                Want auto-conversion? <strong>AppHub Pro</strong> converts any file to HTML automatically.
              </p>
              <p className="upgrade-price">$9/month per workspace</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin')}>
                Upgrade
              </button>
            </div>
          )}

          <pre>{conversionInfo.conversionPrompt}</pre>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => copyPrompt(conversionInfo.conversionPrompt)}>
              {copied ? 'Copied' : 'Copy prompt'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setConversionInfo(null); setRawFile(null); }}>
              Try another file
            </button>
          </div>
        </div>
      )}

      {/* Drop zone */}
      {!file && !conversionInfo && (
        <>
          <div
            className={`upload-zone ${dragOver ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-zone-icon">📂</div>
            <h3>Drag &amp; drop your HTML file here</h3>
            <p>or click to browse — accepts .html files up to 5MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm,.jsx,.tsx,.vue,.svelte,.js,.ts,.css,.json,.py,.zip,.md"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          <div className="inspiration">
            <h4 className="inspiration-title">Not sure what to build?</h4>
            <div className="inspiration-grid">
              {INSPIRATION.map((item) => (
                <div key={item.name} className="inspiration-card">
                  <div className="inspiration-header">
                    <span className="inspiration-icon">{item.icon}</span>
                    <span className="inspiration-name">{item.name}</span>
                  </div>
                  <p className="inspiration-desc">{item.desc}</p>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); copyPrompt(item.prompt); }}>
                    Copy AI prompt
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Upload form */}
      {file && (
        <form className="upload-form" onSubmit={handleUpload}>
          <div style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--surface-solid)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14 }}>📄 {file.name}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setFile(null); setName(''); }}>
                Change
              </button>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>

          <div className="form-group">
            <label className="label">App Name *</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Quote Calculator" required autoFocus />
          </div>

          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this app do?" rows={2} style={{ resize: 'vertical' }} />
          </div>

          <div className="form-group">
            <label className="label">Icon</label>
            <IconPicker value={icon} onChange={setIcon} appName={name} />
          </div>

          <div className="form-group">
            <label className="label">Who can see this?</label>
            <div className="vis-options">
              <button type="button" className={`vis-option ${visibility === 'team' ? 'selected' : ''}`} onClick={() => setVisibility('team')}>Everyone</button>
              <button type="button" className={`vis-option ${visibility === 'private' ? 'selected' : ''}`} onClick={() => setVisibility('private')}>Just me</button>
              <button type="button" className={`vis-option ${visibility === 'specific' ? 'selected' : ''}`} onClick={() => setVisibility('specific')}>Specific</button>
            </div>
          </div>

          {visibility === 'specific' && (
            <div className="form-group">
              <label className="label">Share with</label>
              {members.map((m) => (
                <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sharedWith.includes(m.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSharedWith([...sharedWith, m.id]);
                      else setSharedWith(sharedWith.filter((id) => id !== m.id));
                    }}
                  />
                  {m.displayName} <span style={{ color: 'var(--text-muted)' }}>({m.email})</span>
                </label>
              ))}
            </div>
          )}

          <button className="btn btn-primary btn-full" type="submit" disabled={uploading}>
            {uploading ? <span className="spinner" /> : 'Upload & Publish'}
          </button>
        </form>
      )}

      {ToastElement}
    </div>
  );
}
