import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { copyToClipboard } from '../utils/clipboard';
import { useToast } from '../components/Toast';

const ACCEPTED_TYPES = '.zip,.jsx,.tsx,.vue,.svelte,.html,.htm,.css,.js,.ts,.json,.md,.py';
const ACCEPTED_SET = new Set(ACCEPTED_TYPES.split(','));
const PASTE_EXTENSIONS = ['.jsx', '.tsx', '.vue', '.svelte', '.html', '.css', '.js', '.ts'];
const DEFAULT_PASTE_FILENAME = 'pasted-code.jsx';
const MAX_SIZE = 50 * 1024 * 1024;
const HISTORY_KEY = 'converter-history';
const MAX_HISTORY = 10;
const MAX_HTML_STORE = 5;

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + units[i];
}

function formatMs(ms) {
  return (ms / 1000).toFixed(1) + 's';
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return Math.floor(diff / 86400000) + 'd ago';
}

function loadHistory() {
  try {
    return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(entries) {
  const trimmed = entries.slice(0, MAX_HISTORY).map((e, i) => ({
    ...e,
    html: i < MAX_HTML_STORE ? e.html : null,
  }));
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    const smaller = trimmed.slice(0, 5).map((e, i) => ({
      ...e,
      html: i < 3 ? e.html : null,
    }));
    try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(smaller)); } catch { /* storage full */ }
  }
}

export default function ConverterPage() {
  const { showToast, ToastElement } = useToast();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [converting, setConverting] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showSource, setShowSource] = useState(false);
  const [dismissedWarnings, setDismissedWarnings] = useState(new Set());

  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteCode, setPasteCode] = useState('');
  const [pasteFilename, setPasteFilename] = useState(DEFAULT_PASTE_FILENAME);
  const dropzoneRef = useRef(null);

  const [history, setHistory] = useState(loadHistory);

  const blobUrlRef = useRef(null);
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  function addFiles(newFiles) {
    const valid = Array.from(newFiles).filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      return ACCEPTED_SET.has(ext);
    });
    if (valid.length === 0) {
      showToast('No supported file types selected', 'error');
      return;
    }
    const totalSize = [...files, ...valid].reduce((s, f) => s + f.size, 0);
    if (totalSize > MAX_SIZE) {
      showToast('Total file size exceeds 50 MB limit', 'error');
      return;
    }
    setFiles(prev => [...prev, ...valid]);
  }

  function removeFile(index) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  function handleDragOver(e) { e.preventDefault(); setDragOver(true); }
  function handleDragLeave() { setDragOver(false); }
  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }
  function handleFileSelect(e) {
    if (e.target.files.length) addFiles(e.target.files);
    e.target.value = '';
  }

  function textToFile(text, filename) {
    return new File([new Blob([text], { type: 'text/plain' })], filename);
  }

  const handlePaste = useCallback((e) => {
    const text = e.clipboardData?.getData('text/plain');
    if (!text?.trim()) return;
    e.preventDefault();
    const file = textToFile(text, DEFAULT_PASTE_FILENAME);
    addFiles([file]);
    showToast(`Pasted code added as ${DEFAULT_PASTE_FILENAME}`, 'success');
  }, []);

  useEffect(() => {
    const zone = dropzoneRef.current;
    if (!zone) return;
    zone.addEventListener('paste', handlePaste);
    return () => zone.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  function handlePasteModalSubmit() {
    if (!pasteCode.trim()) return;
    const name = pasteFilename.trim() || DEFAULT_PASTE_FILENAME;
    const file = textToFile(pasteCode, name);
    addFiles([file]);
    showToast(`Pasted code added as ${name}`, 'success');
    setShowPasteModal(false);
    setPasteCode('');
    setPasteFilename(DEFAULT_PASTE_FILENAME);
  }

  function handleExtensionClick(ext) {
    const base = pasteFilename.replace(/\.[^.]+$/, '') || 'pasted-code';
    setPasteFilename(base + ext);
  }

  async function handleConvert() {
    if (files.length === 0 || converting) return;

    setConverting(true);
    setResult(null);
    setError(null);
    setShowSource(false);
    setDismissedWarnings(new Set());

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 150000);

    try {
      const formData = new FormData();
      for (const f of files) formData.append('file', f);

      const data = await api.convertToHtml(formData, controller.signal);

      if (data.success && data.html) {
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = URL.createObjectURL(new Blob([data.html], { type: 'text/html' }));

        setResult({
          html: data.html,
          metadata: data.metadata,
          warnings: data.warnings || [],
          blobUrl: blobUrlRef.current,
        });

        const entry = {
          id: Date.now(),
          timestamp: Date.now(),
          filenames: files.map(f => f.name),
          html: data.html,
          tierUsed: data.metadata?.tier_used,
          outputSize: data.metadata?.output_size_bytes || data.html.length,
        };
        const updated = [entry, ...history].slice(0, MAX_HISTORY);
        setHistory(updated);
        saveHistory(updated);
      } else {
        setError({
          message: data.error || 'Conversion failed.',
          tier1Errors: data.metadata?.tier1_errors,
        });
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError({ message: 'Request timed out after 150 seconds. Try with a smaller project.' });
      } else {
        setError({
          message: err.error || 'Something went wrong. Please try again.',
          tier1Errors: err.tier1_errors || err.metadata?.tier1_errors,
        });
      }
    } finally {
      clearTimeout(timeout);
      setConverting(false);
    }
  }

  function downloadHtml(html, filenames) {
    const name = filenames?.length === 1
      ? filenames[0].replace(/\.[^.]+$/, '') + '-converted.html'
      : 'converted.html';
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyHtml() {
    if (!result?.html) return;
    try {
      await copyToClipboard(result.html);
      showToast('HTML copied to clipboard', 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  }

  function downloadHistoryEntry(entry) {
    if (!entry.html) {
      showToast('HTML no longer stored for this entry', 'info');
      return;
    }
    downloadHtml(entry.html, entry.filenames);
  }

  function resetForNewConversion() {
    setResult(null);
    setError(null);
    setShowSource(false);
    setDismissedWarnings(new Set());
  }

  if (converting) {
    return (
      <div className="converter-loading">
        <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
        <p className="converter-loading-text">Converting... this may take 30–60 seconds for large projects.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>File Converter</h1>
        {(result || error) && (
          <button className="btn btn-secondary btn-sm" onClick={resetForNewConversion}>
            New Conversion
          </button>
        )}
      </div>

      {error && (
        <div className="converter-error">
          <div className="converter-error-icon">⚠️</div>
          <h3>{error.message}</h3>
          {error.tier1Errors?.length > 0 && (
            <ul className="converter-error-list">
              {error.tier1Errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
          <button className="btn btn-primary" onClick={handleConvert} style={{ marginTop: 16 }}>
            Try Again
          </button>
        </div>
      )}

      {result && !error && (
        <div className="converter-result">
          {result.warnings.filter((_, i) => !dismissedWarnings.has(i)).length > 0 && (
            <div className="converter-warnings">
              {result.warnings.map((w, i) =>
                !dismissedWarnings.has(i) && (
                  <div key={i} className="converter-warning">
                    <span>{w}</span>
                    <button
                      onClick={() => setDismissedWarnings(prev => new Set([...prev, i]))}
                      className="converter-warning-close"
                    >
                      ×
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          <div className="converter-meta">
            <span className="converter-meta-item">
              {result.metadata?.tier_used === 1 ? '⚡ Fast' : result.metadata?.tier_used === 2 ? '🧠 Deep' : '—'}
            </span>
            <span className="converter-meta-dot" />
            <span className="converter-meta-item">
              {result.metadata?.input_files} file{result.metadata?.input_files !== 1 ? 's' : ''}
            </span>
            <span className="converter-meta-dot" />
            <span className="converter-meta-item">{formatBytes(result.metadata?.output_size_bytes || 0)}</span>
            <span className="converter-meta-dot" />
            <span className="converter-meta-item">{formatMs(result.metadata?.processing_time_ms || 0)}</span>
            <span className="converter-meta-dot" />
            <span className="converter-meta-item">${(result.metadata?.cost_estimate_usd || 0).toFixed(4)}</span>
          </div>

          <div className="converter-actions">
            <button className="btn btn-primary btn-sm" onClick={() => downloadHtml(result.html, files.map(f => f.name))}>
              Download HTML
            </button>
            <button className="btn btn-secondary btn-sm" onClick={copyHtml}>
              Copy HTML
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowSource(s => !s)}>
              {showSource ? 'Hide Source' : 'View Source'}
            </button>
          </div>

          <div className="converter-preview">
            <iframe
              src={result.blobUrl}
              sandbox="allow-scripts allow-same-origin allow-downloads"
              title="Converted HTML Preview"
            />
          </div>

          {showSource && (
            <div className="converter-source">
              <pre><code>{result.html}</code></pre>
            </div>
          )}
        </div>
      )}

      {!result && !error && (
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
            <div className="upload-zone-icon">🔄</div>
            <h3>Drag &amp; drop your project files here</h3>
            <p>or click to browse — .zip, .jsx, .tsx, .vue, .svelte, .html, .css, .js, .ts, .json, .md, .py (up to 50 MB)</p>
            <p className="upload-zone-hint">You can also paste code (Ctrl+V) while this area is focused</p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileSelect}
              multiple
              style={{ display: 'none' }}
            />
          </div>

          <button
            className="btn btn-ghost btn-full"
            onClick={(e) => { e.stopPropagation(); setShowPasteModal(true); }}
            style={{ marginBottom: files.length > 0 ? 0 : 8 }}
          >
            📋 Paste Code
          </button>

          {files.length > 0 && (
            <div className="converter-chips">
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} className="converter-chip">
                  <span className="converter-chip-name">{f.name}</span>
                  <span className="converter-chip-size">{formatBytes(f.size)}</span>
                  <button className="converter-chip-remove" onClick={(e) => { e.stopPropagation(); removeFile(i); }}>×</button>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn btn-primary btn-full"
            onClick={handleConvert}
            disabled={files.length === 0}
            style={{ marginTop: files.length > 0 ? 16 : 0 }}
          >
            Convert to HTML
          </button>
        </>
      )}

      {history.length > 0 && !result && !error && (
        <div className="converter-history">
          <h4 className="converter-history-title">Recent Conversions</h4>
          {history.map(entry => (
            <div key={entry.id} className="converter-history-item">
              <div className="converter-history-info">
                <span className="converter-history-name">{entry.filenames.join(', ')}</span>
                <span className="converter-history-meta">
                  {formatBytes(entry.outputSize)} · {timeAgo(entry.timestamp)}
                  {entry.tierUsed === 1 ? ' · ⚡ Fast' : entry.tierUsed === 2 ? ' · 🧠 Deep' : ''}
                </span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => downloadHistoryEntry(entry)}
                disabled={!entry.html}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}

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
              Add Code
            </button>
          </div>
        </div>
      )}

      {ToastElement}
    </div>
  );
}
