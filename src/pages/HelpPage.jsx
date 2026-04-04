import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const tabs = [
  { id: 'started', label: 'Getting Started', icon: '\u{1F4D6}' },
  { id: 'developer', label: 'Developer Guide', icon: '\u{1F6E0}\uFE0F' },
  { id: 'agent', label: 'AI Agent Guide', icon: '\u{1F916}' },
];

const quickSteps = [
  { num: '1', title: 'Create Your Tool', desc: 'Use any AI like ChatGPT, Claude, or Cursor. Ask it to "build me a single-file HTML calculator" or whatever you need.' },
  { num: '2', title: 'Upload It', desc: 'Go to the Upload page. Drag and drop your .html file, or paste code directly with Ctrl+V.' },
  { num: '3', title: 'Share with Team', desc: 'Your app appears on the dashboard instantly. Team members can open it right away.' },
];

const managingApps = [
  { title: 'Organizing', icon: '\u{1F4C1}', desc: 'Drag one app onto another to create a folder. Rename folders by clicking the folder title.' },
  { title: 'Searching', icon: '\u{1F50D}', desc: 'Use the search bar on the dashboard to find apps quickly.' },
  { title: 'Editing', icon: '\u270F\uFE0F', desc: 'Click any app to open it. Use the edit button to change its name, description, or icon.' },
  { title: 'Deleting', icon: '\u{1F5D1}\uFE0F', desc: 'Long-press (or right-click) an app to enter edit mode, then tap the X to delete.' },
  { title: 'Visibility', icon: '\u{1F441}\uFE0F', desc: 'Set apps to "Team" (everyone sees it), "Private" (only you), or "Specific people".' },
];

const settingsItems = [
  { title: 'Theme', icon: '\u{1F3A8}', desc: 'Toggle dark/light mode with the sun/moon button in the top bar.' },
  { title: 'Workspace', icon: '\u{1F3E2}', desc: 'Admins can customize workspace name, colors, and logo in Settings.' },
  { title: 'Team', icon: '\u{1F465}', desc: 'Invite members with the Invite button. Manage roles in Settings.' },
  { title: 'Password', icon: '\u{1F511}', desc: 'Change your password in Settings.' },
  { title: 'Billing', icon: '\u{1F4B3}', desc: 'View and manage your subscription in Settings.' },
];

const shortcuts = [
  { keys: ['Ctrl', 'V'], desc: 'Paste code directly into the upload zone' },
  { keys: ['Long press'], desc: 'Enter edit mode for rearranging or deleting apps' },
  { keys: ['Drag'], desc: 'Reorder apps or drag one onto another to create a folder' },
  { keys: ['Escape'], desc: 'Close any modal or overlay' },
];

const plans = [
  { name: 'Free', price: '$0', apps: '5', members: '3', ai: 'No', builder: 'No' },
  { name: 'Team', price: '$12/mo', apps: '50', members: '15', ai: '20/mo', builder: 'No' },
  { name: 'Creator', price: '$29/mo', apps: 'Unlimited', members: 'Unlimited', ai: 'Unlimited', builder: '500K tokens/mo' },
  { name: 'Pro', price: '$79/mo', apps: 'Unlimited', members: 'Unlimited', ai: 'Unlimited', builder: 'Unlimited' },
];

const faqs = [
  { q: 'What kind of apps can I upload?', a: 'Any single-file HTML app. Calculators, dashboards, forms, games, trackers, note apps, and more.' },
  { q: 'Do I need to know how to code?', a: 'No! Use any AI assistant to generate the HTML for you. Just describe what you want.' },
  { q: 'Is my data secure?', a: 'Apps run in sandboxed iframes. Your data stays in your workspace. Only team members can access shared apps.' },
  { q: 'Can I download my apps?', a: 'Yes! Open any app and click the download button to get the source HTML file.' },
  { q: 'What if my uploaded file has errors?', a: 'Paid plans include AI-powered auto-fix. We detect JavaScript errors and offer to fix them automatically.' },
];

const archItems = [
  { label: 'Frontend', value: 'React 18 SPA with Vite, React Router 6, custom CSS' },
  { label: 'Backend', value: 'Express.js REST API, PostgreSQL database' },
  { label: 'Auth', value: 'JWT tokens in httpOnly cookies, 7-day expiry' },
  { label: 'AI', value: 'Anthropic Claude + Google Gemini for conversions & generation' },
  { label: 'Payments', value: 'Stripe for subscriptions' },
  { label: 'Email', value: 'Resend for transactional emails' },
  { label: 'Hosting', value: 'Render.com (static site + web service)' },
];

const envVars = [
  { cat: 'Required', vars: 'DATABASE_URL, JWT_SECRET, CLIENT_URL' },
  { cat: 'AI Features', vars: 'ANTHROPIC_API_KEY, TIER1_API_KEY, TIER1_PROVIDER, TIER1_MODEL' },
  { cat: 'Email', vars: 'RESEND_API_KEY, EMAIL_FROM' },
  { cat: 'Payments', vars: 'STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_*' },
  { cat: 'Dev', vars: 'DEV_BYPASS_PLAN (treats user as Power plan)' },
];

const apiEndpoints = [
  { method: 'POST', path: '/auth/login', desc: 'Authenticate user', auth: false },
  { method: 'GET', path: '/auth/me', desc: 'Current user + workspace', auth: true },
  { method: 'GET', path: '/apps', desc: 'List visible apps', auth: true },
  { method: 'POST', path: '/apps/upload', desc: 'Upload HTML app (FormData)', auth: true },
  { method: 'PUT', path: '/apps/:id', desc: 'Update app metadata', auth: true },
  { method: 'DELETE', path: '/apps/:id', desc: 'Delete app', auth: true },
  { method: 'GET', path: '/folders', desc: 'List folders with apps', auth: true },
  { method: 'POST', path: '/folders', desc: 'Create folder', auth: true },
  { method: 'GET', path: '/workspace', desc: 'Workspace details', auth: true },
  { method: 'POST', path: '/workspace/invite', desc: 'Invite member (admin)', auth: true },
  { method: 'GET', path: '/subscription/status', desc: 'Plan and usage info', auth: true },
  { method: 'POST', path: '/builder/sessions', desc: 'Create builder session', auth: true },
  { method: 'POST', path: '/builder/sessions/:id/generate', desc: 'Start AI generation', auth: true },
  { method: 'POST', path: '/builder/sessions/:id/revise', desc: 'Revise with feedback', auth: true },
  { method: 'POST', path: '/builder/sessions/:id/publish', desc: 'Publish as app', auth: true },
];

const securityItems = [
  { title: 'Workspace Isolation', desc: 'All data scoped to workspace. Users only see their own workspace data.' },
  { title: 'Role-Based Access', desc: 'Admin vs member roles. Admins manage settings, members use apps.' },
  { title: 'App Sandboxing', desc: 'Apps run in iframes with Content Security Policy headers.' },
  { title: 'Rate Limiting', desc: 'Auth: 30/15min, API: 200/15min, Upload: 50/hr.' },
  { title: 'Input Validation', desc: 'UUID format checks, string length limits, file size limits (5MB max).' },
];
const agentAuthSteps = [
  'POST /api/auth/check-email with { email } to determine user status',
  'If existing user: POST /api/auth/login with { email, password }',
  'If invited: POST /api/auth/accept-invite with { email, password, displayName, invitationId }',
  'Session maintained via httpOnly cookie (automatic with credentials: include)',
  'Verify session: GET /api/auth/me returns user object with workspace',
];

const agentOps = [
  { op: 'Upload app', call: 'POST /api/apps/upload', detail: 'FormData with field name "file"' },
  { op: 'List apps', call: 'GET /api/apps', detail: 'Returns { apps: [...] }' },
  { op: 'Get app', call: 'GET /api/apps/:id', detail: 'Returns app object with metadata' },
  { op: 'Update app', call: 'PUT /api/apps/:id', detail: '{ name, description, icon, visibility }' },
  { op: 'Delete app', call: 'DELETE /api/apps/:id', detail: 'Creates pending deletion for admin approval' },
  { op: 'Create folder', call: 'POST /api/folders', detail: '{ name, icon, appIds: [id1, id2] }' },
  { op: 'Invite member', call: 'POST /api/workspace/invite', detail: '{ email } (admin only)' },
];

const agentBuilderOps = [
  { op: 'Create session', call: 'POST /api/builder/sessions', detail: '{ name, appType, description, features, stylePreferences, complexity, targetAudience }' },
  { op: 'Generate', call: 'POST /api/builder/sessions/:id/generate', detail: 'Returns { jobId }, poll until done' },
  { op: 'Poll job', call: 'GET /api/builder/sessions/:id/jobs/:jobId', detail: 'Poll every 2-4s until status is "done"' },
  { op: 'Revise', call: 'POST /api/builder/sessions/:id/revise', detail: '{ feedback } - returns { jobId }' },
  { op: 'Publish', call: 'POST /api/builder/sessions/:id/publish', detail: '{ name, icon, description, visibility }' },
];

const agentErrors = [
  { code: '400', meaning: 'Bad request / validation error' },
  { code: '401', meaning: 'Not authenticated - need to login' },
  { code: '403', meaning: 'Forbidden - wrong role or plan' },
  { code: '404', meaning: 'Resource not found' },
  { code: '409', meaning: 'Conflict - generation already in progress' },
  { code: '413', meaning: 'File too large (max 5MB)' },
  { code: '422', meaning: 'Code errors in HTML (includes error details)' },
  { code: '429', meaning: 'Rate limited or plan limit reached' },
];

const agentModels = [
  { name: 'App', fields: ['id', 'name', 'description', 'icon', 'visibility', 'fileSize', 'createdAt'] },
  { name: 'Folder', fields: ['id', 'name', 'icon', 'apps[]'] },
  { name: 'User', fields: ['id', 'email', 'displayName', 'role', 'workspace'] },
  { name: 'Workspace', fields: ['id', 'name', 'plan', 'slug'] },
  { name: 'BuilderSession', fields: ['id', 'name', 'status', 'currentHtml', 'revisionCount'] },
];

const agentRateLimits = [
  { scope: 'Auth endpoints', limit: '30 requests', window: '15 minutes' },
  { scope: 'General API', limit: '200 requests', window: '15 minutes' },
  { scope: 'File upload', limit: '50 uploads', window: '1 hour' },
  { scope: 'Builder ops', limit: '10 requests', window: '1 hour' },
];

function Section({ title, children, searchRef }) {
  return (
    <section className="help-section" data-help-section>
      <h3 className="help-section-title">{title}</h3>
      {children}
    </section>
  );
}

export default function HelpPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('started');
  const [search, setSearch] = useState('');
  const contentRef = useRef(null);

  const filterSections = (searchTerm) => {
    if (!contentRef.current) return;
    const sections = contentRef.current.querySelectorAll('[data-help-section]');
    let anyVisible = false;
    sections.forEach(section => {
      const text = section.textContent.toLowerCase();
      const match = !searchTerm || text.includes(searchTerm.toLowerCase());
      section.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });
    const noResults = contentRef.current.querySelector('.help-no-results');
    if (noResults) noResults.style.display = anyVisible ? 'none' : '';
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setTimeout(() => filterSections(e.target.value), 0);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearch('');
    setTimeout(() => filterSections(''), 0);
  };

  return (
    <div className="help-page">
      <div className="page-header">
        <h1>Help Center</h1>
      </div>

      <div className="help-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`help-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => handleTabChange(t.id)}
          >
            <span className="help-tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="help-search-wrap">
        <span className="help-search-icon">{'\u{1F50D}'}</span>
        <input
          className="help-search"
          type="text"
          placeholder="Search help topics..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      <div ref={contentRef}>
        {/* ═══ TAB 1: GETTING STARTED ═══ */}
        {activeTab === 'started' && (
          <>
            <div className="help-hero card">
              <h2 className="help-hero-title">Need help? You're in the right place.</h2>
              <p className="help-hero-desc">
                Learn how to build, upload, and share tools with your team.
              </p>
            </div>

            <Section title="What is AppHub?">
              <div className="help-card card">
                <p>
                  AppHub is your team's portal for sharing lightweight HTML tools &mdash; calculators,
                  dashboards, forms, trackers, and more. No coding experience needed &mdash; just use
                  any AI assistant to create a tool, upload it, and share with your team.
                </p>
              </div>
            </Section>

            <Section title="Quick Start Guide">
              <div className="help-steps">
                {quickSteps.map(s => (
                  <div key={s.num} className="help-step card">
                    <span className="help-step-num">{s.num}</span>
                    <div className="help-step-content">
                      <h4>{s.title}</h4>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Managing Your Apps">
              <div className="help-grid">
                {managingApps.map(item => (
                  <div key={item.title} className="help-grid-item card">
                    <h4><span className="help-grid-icon">{item.icon}</span> {item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="AI App Builder (Paid Plans)">
              <div className="help-card card">
                <h4>{'\u2728'} Build apps with AI</h4>
                <p>With a Creator or Pro plan, you can generate entire apps from a description:</p>
                <ul>
                  <li>Describe what you want in plain English</li>
                  <li>Choose colors, layout, and style</li>
                  <li>Preview live in the browser</li>
                  <li>Request revisions with feedback</li>
                  <li>Publish directly to your dashboard</li>
                </ul>
                <div className="help-notice">
                  <strong>Tip:</strong> Navigate to <strong>AI Builder</strong> in the top menu to get started.
                </div>
              </div>
            </Section>

            <Section title="Auto-Convert Files (Paid Plans)">
              <div className="help-card card">
                <h4>{'\u{1F504}'} Automatic file conversion</h4>
                <p>Team plans and above can upload non-HTML files that get auto-converted:</p>
                <ul>
                  <li>Supported: .jsx, .tsx, .vue, .svelte, .py, .md, .json, .css, .zip</li>
                  <li>AI automatically converts them to working HTML apps</li>
                  <li>JavaScript errors are detected and auto-fixed</li>
                </ul>
              </div>
            </Section>

            <Section title="Keyboard Shortcuts">
              <div className="card help-shortcuts" style={{ padding: '8px 20px' }}>
                {shortcuts.map((s, i) => (
                  <div key={i} className="help-shortcut-row">
                    <div className="help-shortcut-keys">
                      {s.keys.map(k => <kbd key={k} className="help-kbd">{k}</kbd>)}
                    </div>
                    <span className="help-shortcut-desc">{s.desc}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Account & Settings">
              <div className="help-grid">
                {settingsItems.map(item => (
                  <div key={item.title} className="help-grid-item card">
                    <h4><span className="help-grid-icon">{item.icon}</span> {item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Plans & Pricing">
              <div className="card help-table-wrap" style={{ padding: 0 }}>
                <table className="help-table">
                  <thead>
                    <tr>
                      <th>Plan</th><th>Price</th><th>Apps</th><th>Members</th><th>AI Convert</th><th>AI Builder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map(p => (
                      <tr key={p.name}>
                        <td className="plan-highlight">{p.name}</td>
                        <td>{p.price}</td><td>{p.apps}</td><td>{p.members}</td><td>{p.ai}</td><td>{p.builder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Frequently Asked Questions">
              <div className="card help-faq" style={{ padding: 0 }}>
                {faqs.map((f, i) => (
                  <div key={i} className="help-faq-item">
                    <div className="help-faq-q">{f.q}</div>
                    <div className="help-faq-a">{f.a}</div>
                  </div>
                ))}
              </div>
            </Section>

            <div className="help-cta">
              <p className="help-cta-text">Ready to get started?</p>
              <button className="btn btn-primary" onClick={() => navigate('/upload')}>
                Upload Your First App
              </button>
            </div>
          </>
        )}
        {/* ═══ TAB 2: DEVELOPER GUIDE ═══ */}
        {activeTab === 'developer' && (
          <>
            <div className="help-hero card">
              <h2 className="help-hero-title">Build and integrate with AppHub</h2>
              <p className="help-hero-desc">
                Technical documentation for developers building apps or integrating with the AppHub API.
              </p>
            </div>

            <Section title="Architecture Overview">
              <div className="card" style={{ padding: '16px 20px' }}>
                {archItems.map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <strong style={{ minWidth: 90, fontSize: 13, color: 'var(--text)' }}>{item.label}</strong>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Local Development Setup">
              <div className="help-card card">
                <pre className="help-code">{`# Clone repositories
git clone <web-repo-url> apphub-web
git clone <api-repo-url> apphub-api

# API setup
cd apphub-api
npm install
cp .env.example .env    # Fill in your values
node config/migrate.js  # Create database tables
npm run dev             # Starts on localhost:3001

# Web setup (in another terminal)
cd apphub-web
npm install
npm run dev             # Starts on localhost:5173
                        # Proxies /api to localhost:3001`}</pre>
              </div>
            </Section>

            <Section title="Environment Variables">
              <div className="card help-table-wrap" style={{ padding: 0 }}>
                <table className="help-table">
                  <thead><tr><th>Category</th><th>Variables</th></tr></thead>
                  <tbody>
                    {envVars.map(e => (
                      <tr key={e.cat}>
                        <td className="plan-highlight">{e.cat}</td>
                        <td style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 12 }}>{e.vars}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="API Endpoints">
              <div className="card" style={{ padding: '8px 20px' }}>
                {apiEndpoints.map((ep, i) => (
                  <div key={i} className="help-endpoint">
                    <span className={`help-badge help-badge-method help-badge-${ep.method.toLowerCase()}`}>
                      {ep.method}
                    </span>
                    <span className="help-endpoint-path">/api{ep.path}</span>
                    {ep.auth && <span className="help-endpoint-auth">AUTH</span>}
                    <span className="help-endpoint-desc">{ep.desc}</span>
                  </div>
                ))}
                <div className="help-notice" style={{ margin: '14px 0 6px' }}>
                  Full API reference available in the <strong>docs/API_REFERENCE.md</strong> file in the API repository.
                </div>
              </div>
            </Section>

            <Section title="Building Apps for AppHub">
              <div className="help-card card">
                <h4>Best Practices</h4>
                <ul>
                  <li><strong>Single-file HTML:</strong> Everything in one .html file (CSS in {'<style>'}, JS in {'<script>'})</li>
                  <li><strong>CDN libraries:</strong> Link to CDN versions of frameworks (Tailwind, Chart.js, etc.)</li>
                  <li><strong>Responsive design:</strong> Apps render in iframes, design for flexible widths</li>
                  <li><strong>No server needed:</strong> Apps are purely client-side</li>
                  <li><strong>localStorage works:</strong> Each app gets its own sandboxed storage</li>
                </ul>
                <h4 style={{ marginTop: 16 }}>Minimal App Template</h4>
                <pre className="help-code">{`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; }
  </style>
</head>
<body>
  <h1>My App</h1>
  <div id="app"></div>
  <script>
    // Your app logic here
  </script>
</body>
</html>`}</pre>
              </div>
            </Section>

            <Section title="Security Model">
              <div className="help-grid">
                {securityItems.map(item => (
                  <div key={item.title} className="help-grid-item card">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}
        {/* ═══ TAB 3: AI AGENT GUIDE ═══ */}
        {activeTab === 'agent' && (
          <>
            <div className="help-hero card">
              <h2 className="help-hero-title">AI Agent Integration Guide</h2>
              <p className="help-hero-desc">
                Structured reference for LLMs and AI agents interacting with AppHub.
              </p>
            </div>

            <Section title="System Overview">
              <div className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <strong style={{ minWidth: 110, fontSize: 13 }}>Purpose</strong>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Team portal for sharing single-file HTML tools</span>
                </div>
                <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <strong style={{ minWidth: 110, fontSize: 13 }}>Base URL</strong>
                  <code style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{'{API_HOST}'}/api</code>
                </div>
                <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <strong style={{ minWidth: 110, fontSize: 13 }}>Auth</strong>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>JWT in httpOnly cookies. Include <code>credentials: 'include'</code> in all requests.</span>
                </div>
                <div style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
                  <strong style={{ minWidth: 110, fontSize: 13 }}>Content-Type</strong>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>application/json (except file uploads: multipart/form-data)</span>
                </div>
              </div>
            </Section>

            <Section title="Authentication Flow">
              <div className="help-steps">
                {agentAuthSteps.map((step, i) => (
                  <div key={i} className="help-step card">
                    <span className="help-step-num">{i + 1}</span>
                    <div className="help-step-content">
                      <p style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 12 }}>{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Core Operations">
              <div className="card" style={{ padding: '8px 20px' }}>
                {agentOps.map((op, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <strong style={{ fontSize: 13 }}>{op.op}</strong>
                      <code style={{ fontSize: 11, color: 'var(--accent)', fontFamily: "'SF Mono', monospace" }}>{op.call}</code>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{op.detail}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="AI Builder Operations (Business+ Plans)">
              <div className="card" style={{ padding: '8px 20px' }}>
                {agentBuilderOps.map((op, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <strong style={{ fontSize: 13 }}>{op.op}</strong>
                      <code style={{ fontSize: 11, color: 'var(--accent)', fontFamily: "'SF Mono', monospace" }}>{op.call}</code>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{op.detail}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Error Codes">
              <div className="card help-table-wrap" style={{ padding: 0 }}>
                <table className="help-table">
                  <thead><tr><th>Status</th><th>Meaning</th></tr></thead>
                  <tbody>
                    {agentErrors.map(e => (
                      <tr key={e.code}>
                        <td className="plan-highlight" style={{ fontFamily: "'SF Mono', monospace" }}>{e.code}</td>
                        <td>{e.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="help-notice" style={{ marginTop: 12 }}>
                <strong>Special error fields:</strong> <code>plan_limit</code> (app/member count exceeded),
                <code> upgrade_required</code> (feature needs higher plan),
                <code> token_budget_exceeded</code> (monthly AI tokens used up).
              </div>
            </Section>

            <Section title="Data Models">
              <div className="card" style={{ padding: 0 }}>
                {agentModels.map(m => (
                  <div key={m.name} className="help-model">
                    <div className="help-model-name">{m.name}</div>
                    <div className="help-model-fields">
                      {m.fields.map(f => <span key={f} className="help-model-field">{f}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Rate Limits">
              <div className="card help-table-wrap" style={{ padding: 0 }}>
                <table className="help-table">
                  <thead><tr><th>Scope</th><th>Limit</th><th>Window</th></tr></thead>
                  <tbody>
                    {agentRateLimits.map(r => (
                      <tr key={r.scope}>
                        <td className="plan-highlight">{r.scope}</td>
                        <td>{r.limit}</td>
                        <td>{r.window}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Best Practices for AI Agents">
              <div className="help-card card">
                <ul>
                  <li>Always check plan limits before attempting restricted operations</li>
                  <li>Poll async jobs (conversion, generation) every 2&ndash;4 seconds</li>
                  <li>Use <code>GET /api/subscription/status</code> to check current plan and usage</li>
                  <li>File uploads must use <code>multipart/form-data</code> with field name <code>file</code></li>
                  <li>All timestamps are ISO 8601 format</li>
                  <li>UUIDs are used for all entity IDs</li>
                  <li>Respect rate limits: implement exponential backoff on 429 responses</li>
                  <li>Sandbox tokens expire after 1 hour &mdash; request a fresh one before loading apps</li>
                </ul>
              </div>
            </Section>
          </>
        )}

        <div className="help-no-results" style={{ display: 'none' }}>
          No help topics match your search. Try different keywords.
        </div>
      </div>
    </div>
  );
}
