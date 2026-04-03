import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useToast } from '../components/Toast';
import TokenUsageMeter, { useBuilderUsage } from '../components/TokenUsageMeter';
import PublishModal from '../components/PublishModal';

const LOADING_MESSAGES = [
  'Building your app...',
  'Writing the HTML and CSS...',
  'Adding interactivity...',
  'Running quality checks...',
  'Almost there...',
];

const APP_TYPE_ICONS = {
  game: '🎮', tool: '🛠️', dashboard: '📊', form: '📝',
  calculator: '🧮', landing: '🌐', other: '✨',
};

const POLL_TIMEOUT = 5 * 60 * 1000;

export default function BuilderWorkspacePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastElement } = useToast();
  const { usage, refresh: refreshUsage, isOverBudget } = useBuilderUsage();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState('');
  const [genError, setGenError] = useState('');

  const [feedback, setFeedback] = useState('');
  const [revising, setRevising] = useState(false);
  const [revisions, setRevisions] = useState([]);

  const [showPublish, setShowPublish] = useState(false);
  const [showReviewNotes, setShowReviewNotes] = useState(false);

  const iframeRef = useRef(null);
  const pollRef = useRef(null);
  const genStartRef = useRef(null);

  useEffect(() => {
    loadSession();
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, [sessionId]);

  async function loadSession() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.builderGetSession(sessionId);
      setSession(data.session || data);
      if (data.session?.revisions) setRevisions(data.session.revisions);
      else if (data.revisions) setRevisions(data.revisions);
    } catch (err) {
      if (err.status === 404) {
        setError('Session not found');
      } else {
        setError(err.message || 'Failed to load session');
      }
    } finally {
      setLoading(false);
    }
  }

  const pollJob = useCallback(async (jobId, onSuccess, onFail) => {
    const elapsed = Date.now() - genStartRef.current;
    if (elapsed > POLL_TIMEOUT) {
      onFail('Generation timed out. Please try again.');
      return;
    }

    try {
      const data = await api.builderPollJob(sessionId, jobId);
      if (data.status === 'done') {
        onSuccess(data);
        return;
      }
      if (data.status === 'failed') {
        onFail(data.error || 'Generation failed');
        return;
      }

      let delay;
      if (elapsed < 30_000) delay = 2000;
      else if (elapsed < 90_000) delay = 4000;
      else delay = 8000;

      pollRef.current = setTimeout(() => pollJob(jobId, onSuccess, onFail), delay);
    } catch (err) {
      if (err.status === 409) {
        pollRef.current = setTimeout(() => pollJob(jobId, onSuccess, onFail), 3000);
      } else {
        onFail(err.message || 'Polling failed');
      }
    }
  }, [sessionId]);

  function cycleLoadingMessage() {
    let idx = 0;
    setGenMessage(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setGenMessage(LOADING_MESSAGES[idx]);
    }, 5000);
    return interval;
  }

  async function handleGenerate() {
    setGenerating(true);
    setGenError('');
    genStartRef.current = Date.now();
    const msgInterval = cycleLoadingMessage();

    try {
      const data = await api.builderGenerate(sessionId);
      pollJob(
        data.jobId,
        (result) => {
          clearInterval(msgInterval);
          setGenerating(false);
          loadSession();
          refreshUsage();
          if (result.reviewNotes) setShowReviewNotes(true);
        },
        (errMsg) => {
          clearInterval(msgInterval);
          setGenerating(false);
          setGenError(errMsg);
        }
      );
    } catch (err) {
      clearInterval(msgInterval);
      setGenerating(false);
      if (err.status === 429) {
        setGenError('Token budget exceeded. Upgrade for more builds.');
      } else if (err.status === 409) {
        showToast('Generation already in progress', 'info');
        setGenerating(false);
      } else {
        setGenError(err.message || 'Failed to start generation');
      }
    }
  }

  async function handleRevise() {
    if (!feedback.trim()) return;
    setRevising(true);
    setGenError('');
    genStartRef.current = Date.now();
    const msgInterval = cycleLoadingMessage();

    const revisionEntry = { feedback: feedback.trim(), status: 'processing' };
    setRevisions(prev => [...prev, revisionEntry]);
    setFeedback('');

    try {
      const data = await api.builderRevise(sessionId, feedback.trim());
      pollJob(
        data.jobId,
        () => {
          clearInterval(msgInterval);
          setRevising(false);
          setRevisions(prev =>
            prev.map((r, i) => i === prev.length - 1 ? { ...r, status: 'done' } : r)
          );
          loadSession();
          refreshUsage();
        },
        (errMsg) => {
          clearInterval(msgInterval);
          setRevising(false);
          setRevisions(prev =>
            prev.map((r, i) => i === prev.length - 1 ? { ...r, status: 'failed' } : r)
          );
          setGenError(errMsg);
        }
      );
    } catch (err) {
      clearInterval(msgInterval);
      setRevising(false);
      if (err.status === 429) {
        setGenError('Token budget exceeded.');
      } else {
        setGenError(err.message || 'Failed to send revision');
      }
    }
  }

  function handlePublished() {
    setShowPublish(false);
    showToast('Your app has been published!', 'success');
    navigate('/');
  }

  async function handleStartOver() {
    if (!confirm('This will reset the session. Are you sure?')) return;
    try {
      await loadSession();
      showToast('Session reset to draft', 'info');
    } catch {
      showToast('Failed to reset', 'error');
    }
  }

  function refreshPreview() {
    if (iframeRef.current && session?.currentHtml) {
      iframeRef.current.srcdoc = session.currentHtml;
    }
  }

  if (loading) {
    return (
      <div className="builder-workspace">
        <div className="spinner-page"><div className="spinner" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="builder-workspace">
        <div className="builder-error-card card">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/builder" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Builder</Link>
        </div>
      </div>
    );
  }

  const hasHtml = !!session?.currentHtml;
  const totalTokens = session?.totalTokensUsed || 0;
  const revisionCount = session?.revisionCount || revisions.length;

  return (
    <div className="builder-workspace">
      <div className="builder-workspace-header">
        <div className="builder-workspace-header-left">
          <Link to="/builder" className="btn btn-ghost btn-sm">&larr; Sessions</Link>
          <h2 className="builder-workspace-title">
            <span className="builder-workspace-type-icon">
              {APP_TYPE_ICONS[session?.appType] || '✨'}
            </span>
            {session?.name}
          </h2>
          {revisionCount > 0 && (
            <span className="builder-revision-badge">Revision #{revisionCount}</span>
          )}
        </div>
        <TokenUsageMeter usage={usage} compact />
      </div>

      <div className="builder-workspace-body">
        {/* Preview Panel */}
        <div className="builder-preview-panel">
          {generating || revising ? (
            <div className="builder-preview-loading">
              <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
              <p className="builder-loading-msg">{genMessage}</p>
              <p className="builder-loading-sub">This usually takes 30–60 seconds</p>
            </div>
          ) : hasHtml ? (
            <div className="builder-preview-frame-wrap">
              <div className="builder-preview-toolbar">
                <span className="builder-preview-dots">
                  <span /><span /><span />
                </span>
                <span className="builder-preview-url">{session.name}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={refreshPreview}
                  title="Refresh preview"
                >
                  ↻
                </button>
              </div>
              <iframe
                ref={iframeRef}
                className="builder-preview-iframe"
                srcDoc={session.currentHtml}
                sandbox="allow-scripts allow-forms allow-modals"
                title="App preview"
              />
            </div>
          ) : (
            <div className="builder-preview-empty">
              <div className="builder-preview-empty-icon">✨</div>
              <h3>Ready to build</h3>
              <p>Click "Generate My App" to bring your idea to life.</p>
            </div>
          )}

          {genError && (
            <div className="builder-gen-error">
              <p>{genError}</p>
              <button className="btn btn-primary btn-sm" onClick={handleGenerate}>
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="builder-controls-panel">
          {!hasHtml && !generating && (
            <>
              <div className="builder-session-summary card">
                <h3>{session?.name}</h3>
                <p className="builder-summary-desc">{session?.description}</p>
                {session?.features?.length > 0 && (
                  <div className="builder-summary-features">
                    {session.features.map((f, i) => (
                      <span key={i} className="builder-feature-tag">{f}</span>
                    ))}
                  </div>
                )}
                <div className="builder-summary-meta">
                  {session?.stylePreferences?.colorScheme && (
                    <span className="builder-meta-chip">{session.stylePreferences.colorScheme}</span>
                  )}
                  {session?.stylePreferences?.layoutStyle && (
                    <span className="builder-meta-chip">{session.stylePreferences.layoutStyle}</span>
                  )}
                  {session?.complexity && (
                    <span className="builder-meta-chip">{session.complexity}</span>
                  )}
                </div>
              </div>

              <button
                className="btn btn-primary btn-full builder-generate-btn"
                onClick={handleGenerate}
                disabled={generating || isOverBudget}
              >
                ✨ Generate My App
              </button>

              {isOverBudget && (
                <p className="builder-over-budget">
                  Token budget exceeded. <a href="/settings">Upgrade to Power User</a> for unlimited builds.
                </p>
              )}
            </>
          )}

          {hasHtml && !generating && (
            <>
              {session?.reviewNotes && (
                <div className="builder-review-notes">
                  <button
                    type="button"
                    className="builder-review-notes-toggle"
                    onClick={() => setShowReviewNotes(!showReviewNotes)}
                  >
                    <span>Review Notes</span>
                    <span>{showReviewNotes ? '▾' : '▸'}</span>
                  </button>
                  {showReviewNotes && (
                    <div className="builder-review-notes-content">
                      {session.reviewNotes}
                    </div>
                  )}
                </div>
              )}

              <div className="builder-revision-input">
                <label className="label">What would you like to change?</label>
                <textarea
                  className="input"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Describe the changes you want..."
                  disabled={revising || isOverBudget}
                />
                <div className="builder-revision-input-footer">
                  <span className="builder-char-count">{feedback.length} / 2000</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleRevise}
                    disabled={revising || !feedback.trim() || isOverBudget}
                  >
                    {revising ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Revising...</> : 'Send Feedback'}
                  </button>
                </div>
              </div>

              {revisions.length > 0 && (
                <div className="builder-revision-history">
                  <h4>Revision History</h4>
                  {revisions.map((r, i) => (
                    <div key={i} className={`builder-revision-item ${r.status || 'done'}`}>
                      <span className="builder-revision-num">Revision {i + 1}</span>
                      <span className="builder-revision-text">{r.feedback}</span>
                      <span className="builder-revision-status">
                        {r.status === 'processing' ? '⏳' : r.status === 'failed' ? '✗' : '✓'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {totalTokens > 0 && (
                <div className="builder-session-tokens">
                  {totalTokens.toLocaleString()} tokens used this session
                </div>
              )}

              <div className="builder-workspace-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowPublish(true)}
                >
                  Publish to AppHub
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleStartOver}
                >
                  Start Over
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showPublish && session && (
        <PublishModal
          session={session}
          onClose={() => setShowPublish(false)}
          onPublished={handlePublished}
        />
      )}
      {ToastElement}
    </div>
  );
}
