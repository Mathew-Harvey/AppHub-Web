import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About AppHub</h1>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>What is AppHub?</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
          AppHub is a team portal for sharing internal tools, calculators, dashboards, and utilities —
          all built as simple HTML apps. Build something useful with any AI tool (Claude, ChatGPT, Cursor, etc.),
          then upload the HTML file to share it instantly with your team.
        </p>
        <h3 style={{ marginBottom: 12 }}>How it works</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <p><strong>1. Build</strong> — Use any AI tool to create a single-file HTML app (calculator, form, dashboard, etc.)</p>
          <p><strong>2. Upload</strong> — Drag and drop your HTML file, or paste code directly. Non-HTML files are auto-converted for Pro users.</p>
          <p><strong>3. Share</strong> — Your team can access the app instantly. Organize with folders, control visibility per app.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Supported file types</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
          Upload directly: <strong>.html</strong>
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          Auto-convert (Pro): <strong>.jsx, .tsx, .vue, .svelte, .js, .ts, .css, .py, .json, .md, .zip</strong>
        </p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Keyboard shortcuts</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
          <p><kbd style={{ background: 'var(--surface-solid)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)', fontSize: 12 }}>Ctrl+V</kbd> — Paste code directly into the upload zone</p>
          <p><kbd style={{ background: 'var(--surface-solid)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)', fontSize: 12 }}>Long press</kbd> — Enter edit mode to rearrange or delete apps</p>
        </div>
      </div>
    </div>
  );
}
