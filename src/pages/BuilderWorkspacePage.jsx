import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useToast } from '../components/Toast';
import TokenUsageMeter from '../components/TokenUsageMeter';
import PublishModal from '../components/PublishModal';
import { useBuilderJobs } from '../contexts/BuilderContext';

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

const SESSION_POLL_INTERVAL = 5000;

export default function BuilderWorkspacePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastElement } = useToast();
  const { activeJobs, completions, startJob, dismissCompletion, usage, refreshUsage, isOverBudget } = useBuilderJobs();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [genMessage, setGenMessage] = useState('');
  const [genError, setGenError] = useState('');

  const [feedback, setFeedback] = useState('');
  const [revisions, setRevisions] = useState([]);

  const [showPublish, setShowPublish] = useState(false);
  const [showReviewNotes, setShowReviewNotes] = useState(false);

  const iframeRef = useRef(null);
  const msgIntervalRef = useRef(null);
  const sessionPollRef = useRef(null);

  const activeJob = activeJobs[sessionId] || null;
  const completion = completions[sessionId] || null;
  const isWorking = !!activeJob;
  const isGenerating = isWorking && activeJob?.type === 'generate';
  const isRevising = isWorking && activeJob?.type === 'revise';

  useEffect(() => {
    loadSession();
    return () => {
      if (msgIntervalRef.current) clearInterval(msgIntervalRef.current);
      if (sessionPollRef.current) clearTimeout(sessionPollRef.current);
    };
  }, [sessionId]);

  // When we detect an active job on mount (navigated back), start cycling messages
  useEffect(() => {
    if (isWorking) {
      startMessageCycle();
    } else {
      stopMessageCycle();
    }
    return () => stopMessageCycle();
  }, [isWorking]);

  // React to a job completing (possibly while we were away, or while watching)
  useEffect(() => {
    if (!completion) return;

    stopMessageCycle();
    dismissCompletion(sessionId);

    if (completion.status === 'done') {
      loadSession();
      refreshUsage();
    } else {
      setGenError(completion.error || 'Generation failed');
      // Update last revision if it was a revise job
      if (completion.type === 'revise') {
        setRevisions(prev =>
          prev.map((r, i) => i === prev.length - 1 ? { ...r, status: 'failed' } : r)
        );
      }
    }
  }, [completion]);

  // Fallback: if session says "generating" but we have no tracked job,
  // poll the session endpoint directly until status changes.
  useEffect(() => {
    if (!session) return;
    const needsFallbackPoll =
      (session.status === 'generating' || session.status === 'revising') && !activeJob;

    if (needsFallbackPoll) {
      startSessionPoll();
    }

    return () => {
      if (sessionPollRef.current) clearTimeout(sessionPollRef.current);
    };
  }, [session?.status, activeJob]);

  async function loadSession() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.builderGetSession(sessionId);
      const s = data.session || data;
      setSession(s);
      if (s.revisions) setRevisions(s.revisions);
      else if (data.revisions) setRevisions(data.revisions);
    } catch (err) {
      setError(err.status === 404 ? 'Session not found' : (err.message || 'Failed to load session'));
    } finally {
      setLoading(false);
    }
  }

  function startSessionPoll() {
    if (sessionPollRef.current) clearTimeout(sessionPollRef.current);

    async function tick() {
      try {
        const data = await api.builderGetSession(sessionId);
        const s = data.session || data;
        if (s.status !== 'generating' && s.status !== 'revising') {
          setSession(s);
          if (s.revisions) setRevisions(s.revisions);
          refreshUsage();
          return;
        }
      } catch { /* ignore */ }
      sessionPollRef.current = setTimeout(tick, SESSION_POLL_INTERVAL);
    }

    startMessageCycle();
    sessionPollRef.current = setTimeout(tick, SESSION_POLL_INTERVAL);
  }

  function startMessageCycle() {
    if (msgIntervalRef.current) return;
    let idx = 0;
    setGenMessage(LOADING_MESSAGES[0]);
    msgIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setGenMessage(LOADING_MESSAGES[idx]);
    }, 5000);
  }

  function stopMessageCycle() {
    if (msgIntervalRef.current) {
      clearInterval(msgIntervalRef.current);
      msgIntervalRef.current = null;
    }
  }

  async function handleGenerate() {
    setGenError('');
    try {
      const data = await api.builderGenerate(sessionId);
      startJob(sessionId, data.jobId, 'generate', session?.name);
    } catch (err) {
      if (err.status === 429) {
        setGenError('Token budget exceeded. Upgrade for more builds.');
      } else if (err.status === 409) {
        showToast('Generation already in progress', 'info');
      } else {
        setGenError(err.message || 'Failed to start generation');
      }
    }
  }

  async function handleRevise() {
    if (!feedback.trim()) return;
    setGenError('');

    const text = feedback.trim();
    setRevisions(prev => [...prev, { feedback: text, status: 'processing' }]);
    setFeedback('');

    try {
      const data = await api.builderRevise(sessionId, text);
      startJob(sessionId, data.jobId, 'revise', session?.name);
    } catch (err) {
      setRevisions(prev =>
        prev.map((r, i) => i === prev.length - 1 ? { ...r, status: 'failed' } : r)
      );
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
  const showWorkingState = isWorking || session?.status === 'generating' || session?.status === 'revising';

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
          {showWorkingState ? (
            <div className="builder-preview-loading">
              <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
              <p className="builder-loading-msg">{genMessage}</p>
              <p className="builder-loading-sub">This usually takes 30–60 seconds</p>
              {activeJob && (
                <p className="builder-loading-sub" style={{ marginTop: 4 }}>
                  You can navigate away — we'll keep building in the background.
                </p>
              )}
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
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
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
          {!hasHtml && !showWorkingState && (
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
                disabled={isWorking || isOverBudget}
              >
                ✨ Generate My App
              </button>

              {isOverBudget && (
                <p className="builder-over-budget">
                  Token budget exceeded. <a href="/settings">Upgrade to Pro</a> for unlimited builds.
                </p>
              )}
            </>
          )}

          {showWorkingState && (
            <div className="builder-working-info card">
              <div className="builder-working-header">
                <span className="builder-working-dot" />
                <strong>{isRevising ? 'Applying changes...' : 'Generating your app...'}</strong>
              </div>
              <p className="builder-working-hint">
                Feel free to navigate away. Your build will continue in the background
                and you'll be notified when it's done.
              </p>
            </div>
          )}

          {hasHtml && !showWorkingState && (
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
                  disabled={isWorking || isOverBudget}
                />
                <div className="builder-revision-input-footer">
                  <span className="builder-char-count">{feedback.length} / 2000</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleRevise}
                    disabled={isWorking || !feedback.trim() || isOverBudget}
                  >
                    {isRevising ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Revising...</> : 'Send Feedback'}
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
