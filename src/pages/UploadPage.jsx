import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import IconPicker from '../components/IconPicker';
import UpgradeModal, { isPlanLimitError } from '../components/UpgradeModal';

const PASTE_EXTENSIONS = ['.jsx', '.tsx', '.vue', '.svelte', '.html', '.css', '.js', '.ts'];
const DEFAULT_PASTE_FILENAME = 'pasted-code.jsx';

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

function textToFile(text, filename) {
  return new File([new Blob([text], { type: 'text/plain' })], filename);
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, ToastElement } = useToast();
  const fileInputRef = useRef(null);
  const dropzoneRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [rawFile, setRawFile] = useState(null);
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

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteCode, setPasteCode] = useState('');
  const [pasteFilename, setPasteFilename] = useState(DEFAULT_PASTE_FILENAME);

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
        const baseName = f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        if (!name) setName(baseName.charAt(0).toUpperCase() + baseName.slice(1));

        if (isPro) {
          doAiConvert(f);
        } else {
          setConversionInfo(check);
        }
      }
    } catch (err) {
      showToast('Error checking file', 'error');
    }
  }

  async function doAiConvert(fileToConvert) {
    if (!fileToConvert) return;
    setConverting(true);
    try {
      const formData = new FormData();
      formData.append('appFile', fileToConvert);
      const { jobId } = await api.startConvert(formData);

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
        const htmlBlob = new Blob([result.html], { type: 'text/html' });
        const outputName = fileToConvert.name.replace(/\.[^.]+$/, '') + '.html';
        const htmlFile = new File([htmlBlob], outputName, { type: 'text/html' });
        setFile(htmlFile);
        setConversionInfo(null);
        setRawFile(null);
        setConverting(false);
        showToast('Converted successfully', 'success');
      };
      poll();
    } catch (err) {
      setConverting(false);
      if (isPlanLimitError(err)) {
        setUpgradeMessage(err.message || 'This feature requires a Pro subscription.');
        setShowUpgradeModal(true);
      } else if (err.used !== undefined) {
        showToast(`Monthly limit reached (${err.used}/${err.limit} conversions)`, 'error');
      } else {
        showToast(err.error || 'Conversion failed', 'error');
      }
    }
  }

  function handleAiConvert() {
    if (!rawFile) return;
    doAiConvert(rawFile);
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
    } catch (err) {
      if (isPlanLimitError(err)) {
        setUpgradeMessage(err.message);
        setShowUpgradeModal(true);
      } else if (err.conversionPrompt) {
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

  // Paste: Ctrl+V on drop zone
  const handlePaste = useCallback((e) => {
    const text = e.clipboardData?.getData('text/plain');
    if (!text?.trim()) return;
    e.preventDefault();
    const file = textToFile(text, DEFAULT_PASTE_FILENAME);
    processFile(file);
  }, []);

  useEffect(() => {
    const zone = dropzoneRef.current;
    if (!zone) return;
    zone.addEventListener('paste', handlePaste);
    return () => zone.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // Paste modal
  function handlePasteModalSubmit() {
    if (!pasteCode.trim()) return;
    const filename = pasteFilename.trim() || DEFAULT_PASTE_FILENAME;
    const file = textToFile(pasteCode, filename);
    processFile(file);
    showToast(`Code added as ${filename}`, 'success');
    setShowPasteModal(false);
    setPasteCode('');
    setPasteFilename(DEFAULT_PASTE_FILENAME);
  }

  function handleExtensionClick(ext) {
    const base = pasteFilename.replace(/\.[^.]+$/, '') || 'pasted-code';
    setPasteFilename(base + ext);
  }

  if (uploadSuccess) {
    return (
      <div className="upload-success">
        <div className="upload-success-icon">{icon}</div>
        <h2>{name}</h2>
        <p>Your app is live. Your team can use it now.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: 16 }}>
          Go to Dashboard
        </button>
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

      {/* Conversion prompt (shown for free users when file needs converting) */}
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
            <div className="ai-locked-prompt" onClick={() => { setUpgradeMessage('Smart AI uploads require a Pro subscription.'); setShowUpgradeModal(true); }}>
              <div className="ai-locked-header">
                <span className="ai-locked-icon">&#x1F512;</span>
                <span className="plan-badge plan-badge-pro plan-badge-sm">PRO</span>
              </div>
              <p className="ai-locked-text">
                <strong>Smart AI uploads</strong> can auto-convert any file to HTML.
              </p>
              <span className="btn btn-primary btn-sm">Upgrade to Pro — $12/mo</span>
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
            ref={dropzoneRef}
            tabIndex={0}
            className={`upload-zone ${dragOver ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-zone-icon">📂</div>
            <h3>Drag &amp; drop your file here</h3>
            <p>or click to browse — .html, .jsx, .tsx, .vue, .css, .js, .py, .zip and more</p>
            <p className="upload-zone-hint">You can also paste code (Ctrl+V) while this area is focused</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm,.jsx,.tsx,.vue,.svelte,.js,.ts,.css,.json,.py,.zip,.md"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          <button
            className="btn btn-ghost btn-full"
            onClick={(e) => { e.stopPropagation(); setShowPasteModal(true); }}
            style={{ marginBottom: 8 }}
          >
            📋 Paste Code
          </button>

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

      {/* Paste Code modal */}
      {showPasteModal && (
        <div className="modal-overlay" onClick={() => setShowPasteModal(false)}>
          <div className="modal paste-modal" onClick={e => e.stopPropagation()}>
            <div className="paste-modal-header">
              <h3>Paste Code</h3>
              <button className="paste-modal-close" onClick={() => setShowPasteModal(false)}>×</button>
            </div>

            <label className="label">Filename</label>
            <div className="paste-filename-row">
              <input
                className="input paste-filename-input"
                value={pasteFilename}
                onChange={e => setPasteFilename(e.target.value)}
                placeholder={DEFAULT_PASTE_FILENAME}
              />
            </div>
            <div className="paste-ext-chips">
              {PASTE_EXTENSIONS.map(ext => (
                <button
                  key={ext}
                  className={`paste-ext-chip ${pasteFilename.endsWith(ext) ? 'active' : ''}`}
                  onClick={() => handleExtensionClick(ext)}
                >
                  {ext}
                </button>
              ))}
            </div>

            <label className="label" style={{ marginTop: 16 }}>Code</label>
            <textarea
              className="input paste-textarea"
              value={pasteCode}
              onChange={e => setPasteCode(e.target.value)}
              placeholder="Paste or type your code here..."
              rows={12}
              autoFocus
            />

            <button
              className="btn btn-primary btn-full"
              onClick={handlePasteModalSubmit}
              disabled={!pasteCode.trim()}
              style={{ marginTop: 16 }}
            >
              Upload Code
            </button>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          limitMessage={upgradeMessage}
        />
      )}
      {ToastElement}
    </div>
  );
}
