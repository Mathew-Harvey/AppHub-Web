import { useState, useEffect, useRef, useCallback } from 'react';

const API_HOST = import.meta.env.VITE_API_URL || '';
const API_BASE = `${API_HOST}/api/super-admin`;

function saRequest(url, token, options = {}) {
  return fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Super-Admin-Token': token,
      ...options.headers,
    },
    ...options,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  });
}

// ── Login Screen ────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).then(async (res) => {
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'Login failed');
        return d;
      });
      onLogin(data.token, data.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 12 }}>🛡️</div>
        <h1 style={{ textAlign: 'center' }}>Super Admin</h1>
        <p className="subtitle" style={{ textAlign: 'center' }}>Platform monitoring dashboard</p>
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className="sa-stat-card card">
      <div className="sa-stat-value" style={color ? { color } : {}}>{value}</div>
      <div className="sa-stat-label">{label}</div>
      {sub && <div className="sa-stat-sub">{sub}</div>}
    </div>
  );
}

// ── Plan Badge ──────────────────────────────────────────────────────
function PlanBadge({ plan }) {
  const colors = {
    free: '#6b7a94',
    team: '#3b82f6',
    business: '#8b5cf6',
    power: '#f59e0b',
  };
  return (
    <span className="sa-plan-badge" style={{ background: colors[plan] || '#6b7a94' }}>
      {plan}
    </span>
  );
}

// ── Log Viewer ──────────────────────────────────────────────────────
function LogViewer({ token }) {
  const [logs, setLogs] = useState([]);
  const [level, setLevel] = useState('');
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const logContainerRef = useRef(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (level) params.set('level', level);
      if (search) params.set('search', search);
      params.set('limit', '500');
      const data = await saRequest(`/logs?${params}`, token);
      setLogs(data.logs);
    } catch {
      // silently fail on log fetch
    } finally {
      setLoading(false);
    }
  }, [token, level, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const levelColors = {
    info: 'var(--text-secondary)',
    http: '#3b82f6',
    warn: 'var(--warning)',
    error: 'var(--danger)',
  };

  return (
    <div className="sa-section">
      <h3>Server Logs</h3>
      <div className="sa-log-controls">
        <select className="input sa-log-select" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">All Levels</option>
          <option value="info">Info</option>
          <option value="http">HTTP</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
        </select>
        <input className="input sa-log-search" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <label className="sa-auto-refresh">
          <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
          Auto-refresh
        </label>
        <button className="btn btn-ghost" onClick={fetchLogs} disabled={loading}>
          {loading ? '...' : 'Refresh'}
        </button>
      </div>
      <div className="sa-log-container" ref={logContainerRef}>
        {logs.length === 0 ? (
          <div className="sa-log-empty">No logs found</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="sa-log-entry">
              <span className="sa-log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="sa-log-level" style={{ color: levelColors[log.level] || 'var(--text)' }}>
                [{log.level}]
              </span>
              <span className="sa-log-msg">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────
export default function SuperAdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('sa_token'));
  const [email, setEmail] = useState(() => sessionStorage.getItem('sa_email'));
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [stats, setStats] = useState(null);
  const [usage, setUsage] = useState(null);
  const [costs, setCosts] = useState(null);
  const [income, setIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function handleLogin(newToken, newEmail) {
    setToken(newToken);
    setEmail(newEmail);
    sessionStorage.setItem('sa_token', newToken);
    sessionStorage.setItem('sa_email', newEmail);
  }

  function handleLogout() {
    if (token) {
      fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: { 'X-Super-Admin-Token': token },
      }).catch(() => {});
    }
    setToken(null);
    setEmail(null);
    sessionStorage.removeItem('sa_token');
    sessionStorage.removeItem('sa_email');
  }

  useEffect(() => {
    if (!token) return;
    loadDashboard();
  }, [token]);

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const [statsData, usageData, costsData, incomeData] = await Promise.all([
        saRequest('/stats', token),
        saRequest('/usage', token),
        saRequest('/costs', token),
        saRequest('/income', token),
      ]);
      setStats(statsData);
      setUsage(usageData);
      setCosts(costsData);
      setIncome(incomeData);
    } catch (err) {
      if (err.message.includes('authentication') || err.message.includes('expired')) {
        handleLogout();
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'usage', label: 'API Usage' },
    { id: 'costs', label: 'Costs' },
    { id: 'income', label: 'Income' },
    { id: 'logs', label: 'Logs' },
  ];

  return (
    <div className="sa-dashboard">
      <div className="sa-header">
        <div className="sa-header-left">
          <h1>Super Admin Dashboard</h1>
          <span className="sa-header-email">{email}</span>
        </div>
        <div className="sa-header-right">
          <button className="btn btn-ghost" onClick={loadDashboard}>Reload</button>
          <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="sa-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`sa-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="form-error" style={{ margin: '16px 0' }}>{error}</div>}

      {loading && !stats ? (
        <div className="spinner-page"><div className="spinner" /></div>
      ) : (
        <div className="sa-content">
          {activeTab === 'overview' && stats && income && <OverviewTab stats={stats} income={income} costs={costs} />}
          {activeTab === 'usage' && usage && <UsageTab usage={usage} />}
          {activeTab === 'costs' && costs && <CostsTab costs={costs} />}
          {activeTab === 'income' && income && <IncomeTab income={income} />}
          {activeTab === 'logs' && <LogViewer token={token} />}
        </div>
      )}
    </div>
  );
}

// ── Overview Tab ────────────────────────────────────────────────────
function OverviewTab({ stats, income, costs }) {
  return (
    <>
      <div className="sa-stats-grid">
        <StatCard label="Total Workspaces" value={stats.totalWorkspaces} />
        <StatCard label="Total Members" value={stats.totalMembers} />
        <StatCard label="Total Apps" value={stats.totalApps} />
        <StatCard label="Estimated MRR" value={`$${income.estimatedMRR}`} color="var(--success)" />
        <StatCard label="Estimated ARR" value={`$${income.estimatedARR}`} color="var(--success)" />
        <StatCard label="Total AI Cost" value={`$${costs?.totalEstimatedCost?.toFixed(2) || '0.00'}`} color="var(--warning)" />
      </div>

      <div className="sa-section">
        <h3>Workspace Plan Distribution</h3>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr><th>Plan</th><th>Workspaces</th></tr>
            </thead>
            <tbody>
              {stats.workspacePlanDistribution.map((p) => (
                <tr key={p.plan}>
                  <td><PlanBadge plan={p.plan} /></td>
                  <td>{p.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sa-section">
        <h3>User Plan Distribution</h3>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr><th>Plan</th><th>Users</th></tr>
            </thead>
            <tbody>
              {stats.userPlanDistribution.map((p) => (
                <tr key={p.plan}>
                  <td><PlanBadge plan={p.plan} /></td>
                  <td>{p.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Usage Tab ───────────────────────────────────────────────────────
function UsageTab({ usage }) {
  const [sortField, setSortField] = useState('builderTokensUsed');
  const [sortDir, setSortDir] = useState('desc');

  function handleSort(field) {
    if (sortField === field) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  const sorted = [...usage.users].sort((a, b) => {
    const av = a[sortField] ?? 0;
    const bv = b[sortField] ?? 0;
    return sortDir === 'desc' ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
  });

  function SortHeader({ field, children }) {
    return (
      <th onClick={() => handleSort(field)} style={{ cursor: 'pointer', userSelect: 'none' }}>
        {children} {sortField === field ? (sortDir === 'desc' ? '↓' : '↑') : ''}
      </th>
    );
  }

  return (
    <div className="sa-section">
      <h3>Per-User API Usage</h3>
      <div className="sa-table-wrap">
        <table className="sa-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Workspace</th>
              <th>Plan</th>
              <SortHeader field="builderTokensUsed">Builder Tokens</SortHeader>
              <SortHeader field="aiConversionsUsed">AI Conversions</SortHeader>
              <SortHeader field="lastLoginAt">Last Login</SortHeader>
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="sa-user-cell">
                    <span className="sa-user-name">{u.displayName || 'N/A'}</span>
                    <span className="sa-user-email">{u.email}</span>
                  </div>
                </td>
                <td>{u.workspaceName || '-'}</td>
                <td><PlanBadge plan={u.workspacePlan} /></td>
                <td className="sa-num">{(u.builderTokensUsed || 0).toLocaleString()}</td>
                <td className="sa-num">{u.aiConversionsUsed || 0}</td>
                <td className="sa-date">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Costs Tab ───────────────────────────────────────────────────────
function CostsTab({ costs }) {
  return (
    <>
      <div className="sa-stats-grid">
        <StatCard
          label="Total AI Cost"
          value={`$${costs.totalEstimatedCost.toFixed(2)}`}
          color="var(--warning)"
        />
        <StatCard
          label="Conversion Costs"
          value={`$${costs.conversions.totalCost.toFixed(2)}`}
          sub={`${costs.conversions.totalCalls} calls (${costs.conversions.successfulCalls} ok, ${costs.conversions.failedCalls} failed)`}
        />
        <StatCard
          label="Builder Costs"
          value={`$${costs.builder.estimatedCost.toFixed(2)}`}
          sub={`${costs.builder.totalJobs} jobs`}
        />
      </div>

      <div className="sa-section">
        <h3>Cost by Tier / Model</h3>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr><th>Tier</th><th>Model</th><th>Calls</th><th>Cost</th></tr>
            </thead>
            <tbody>
              {costs.costByTier.map((t, i) => (
                <tr key={i}>
                  <td>Tier {t.tier}</td>
                  <td className="sa-mono">{t.model}</td>
                  <td className="sa-num">{t.count}</td>
                  <td className="sa-num">${t.totalCost.toFixed(4)}</td>
                </tr>
              ))}
              {costs.costByTier.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No conversion data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sa-section">
        <h3>Builder Token Usage</h3>
        <div className="sa-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <StatCard label="Input Tokens" value={costs.builder.totalInputTokens.toLocaleString()} />
          <StatCard label="Output Tokens" value={costs.builder.totalOutputTokens.toLocaleString()} />
          <StatCard label="Cache Read" value={costs.builder.totalCacheReadTokens.toLocaleString()} />
          <StatCard label="Cache Create" value={costs.builder.totalCacheCreationTokens.toLocaleString()} />
        </div>
      </div>

      <div className="sa-section">
        <h3>Daily Costs (Last 30 Days)</h3>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr><th>Date</th><th>Cost</th><th>Calls</th></tr>
            </thead>
            <tbody>
              {costs.dailyCosts.map((d) => (
                <tr key={d.date}>
                  <td>{new Date(d.date).toLocaleDateString()}</td>
                  <td className="sa-num">${d.cost.toFixed(4)}</td>
                  <td className="sa-num">{d.calls}</td>
                </tr>
              ))}
              {costs.dailyCosts.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data for this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Income Tab ──────────────────────────────────────────────────────
function IncomeTab({ income }) {
  return (
    <>
      <div className="sa-stats-grid">
        <StatCard label="Estimated MRR" value={`$${income.estimatedMRR}`} color="var(--success)" />
        <StatCard label="Estimated ARR" value={`$${income.estimatedARR}`} color="var(--success)" />
        <StatCard label="Active Stripe Subs" value={income.activeStripeSubscriptions} />
      </div>

      <div className="sa-section">
        <h3>Revenue by Plan</h3>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr><th>Plan</th><th>Users</th><th>Price/User</th><th>Monthly Revenue</th></tr>
            </thead>
            <tbody>
              {income.planBreakdown.map((p) => (
                <tr key={p.plan}>
                  <td><PlanBadge plan={p.plan} /></td>
                  <td className="sa-num">{p.count}</td>
                  <td className="sa-num">${p.pricePerUser}</td>
                  <td className="sa-num" style={{ color: p.monthlyRevenue > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                    ${p.monthlyRevenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sa-section">
        <h3>Recent Signups (Last 30 Days)</h3>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr><th>Date</th><th>New Users</th></tr>
            </thead>
            <tbody>
              {income.recentSignups.map((d) => (
                <tr key={d.date}>
                  <td>{new Date(d.date).toLocaleDateString()}</td>
                  <td className="sa-num">{d.signups}</td>
                </tr>
              ))}
              {income.recentSignups.length === 0 && (
                <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No signups in this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
