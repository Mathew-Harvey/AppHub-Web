import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../utils/api';

const BuilderJobsContext = createContext(null);

const STORAGE_KEY = 'apphub-builder-jobs';
const POLL_TIMEOUT = 5 * 60 * 1000;

function loadStoredJobs() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveStoredJobs(jobs) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(jobs)); } catch { /* quota */ }
}

export function BuilderJobsProvider({ children }) {
  const [activeJobs, setActiveJobs] = useState(loadStoredJobs);
  const [completions, setCompletions] = useState({});
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const pollTimers = useRef({});
  const activeRef = useRef(activeJobs);

  useEffect(() => {
    activeRef.current = activeJobs;
    saveStoredJobs(activeJobs);
  }, [activeJobs]);

  useEffect(() => {
    return () => Object.values(pollTimers.current).forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const stored = loadStoredJobs();
    Object.entries(stored).forEach(([sid, job]) => {
      if (!pollTimers.current[sid]) {
        beginPolling(sid, job.jobId, job.startedAt);
      }
    });
  }, []);

  // Fetch usage on mount
  useEffect(() => { refreshUsage(); }, []);

  const refreshUsage = useCallback(async () => {
    try {
      const data = await api.builderUsage();
      setUsage(data);
    } catch {
      // non-critical
    } finally {
      setUsageLoading(false);
    }
  }, []);

  const isOverBudget = usage
    ? !usage.unlimited && computePercentage(usage) >= 100
    : false;

  function beginPolling(sessionId, jobId, startedAt) {
    if (pollTimers.current[sessionId]) clearTimeout(pollTimers.current[sessionId]);

    async function tick() {
      const elapsed = Date.now() - startedAt;
      if (elapsed > POLL_TIMEOUT) {
        completeJob(sessionId, 'failed', 'Generation timed out');
        return;
      }

      try {
        const data = await api.builderPollJob(sessionId, jobId);
        if (data.status === 'done') { completeJob(sessionId, 'done'); return; }
        if (data.status === 'failed') { completeJob(sessionId, 'failed', data.error || 'Generation failed'); return; }

        const delay = elapsed < 30_000 ? 2000 : elapsed < 90_000 ? 4000 : 8000;
        pollTimers.current[sessionId] = setTimeout(tick, delay);
      } catch (err) {
        if (err.status === 409) {
          pollTimers.current[sessionId] = setTimeout(tick, 3000);
        } else {
          completeJob(sessionId, 'failed', err.message || 'Polling failed');
        }
      }
    }

    tick();
  }

  function completeJob(sessionId, status, error) {
    const job = activeRef.current[sessionId];

    setActiveJobs(prev => {
      const next = { ...prev };
      delete next[sessionId];
      return next;
    });

    setCompletions(prev => ({
      ...prev,
      [sessionId]: {
        status,
        error,
        completedAt: Date.now(),
        sessionName: job?.sessionName || 'Build',
        type: job?.type || 'generate',
      },
    }));

    if (pollTimers.current[sessionId]) {
      clearTimeout(pollTimers.current[sessionId]);
      delete pollTimers.current[sessionId];
    }

    // Auto-refresh usage after any job completes
    refreshUsage();
  }

  const startJob = useCallback((sessionId, jobId, type, sessionName) => {
    const job = { jobId, type, sessionName: sessionName || 'Untitled', startedAt: Date.now() };
    setActiveJobs(prev => ({ ...prev, [sessionId]: job }));
    beginPolling(sessionId, jobId, job.startedAt);
  }, []);

  const dismissCompletion = useCallback((sessionId) => {
    setCompletions(prev => {
      if (!prev[sessionId]) return prev;
      const next = { ...prev };
      delete next[sessionId];
      return next;
    });
  }, []);

  return (
    <BuilderJobsContext.Provider value={{
      activeJobs,
      completions,
      hasActiveJobs: Object.keys(activeJobs).length > 0,
      startJob,
      dismissCompletion,
      usage,
      usageLoading,
      refreshUsage,
      isOverBudget,
    }}>
      {children}
    </BuilderJobsContext.Provider>
  );
}

export function useBuilderJobs() {
  const ctx = useContext(BuilderJobsContext);
  if (!ctx) throw new Error('useBuilderJobs must be within BuilderJobsProvider');
  return ctx;
}

/**
 * Computes percentage client-side. Falls back to API value,
 * but handles the case where limit is 0/missing.
 */
export function computePercentage(usage) {
  if (!usage) return 0;
  if (usage.unlimited) return 0;

  // If the API gave a sensible percentage, use it
  if (usage.limit > 0 && typeof usage.percentage === 'number') {
    return usage.percentage;
  }

  // Compute ourselves if limit is available and positive
  if (usage.limit > 0) {
    return (usage.used / usage.limit) * 100;
  }

  // limit is 0 or missing — can't compute a meaningful %
  return 0;
}
