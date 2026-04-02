import { useNavigate } from 'react-router-dom';

const steps = [
  { num: '1', icon: '🤖', title: 'Build', desc: 'Use any AI tool — Claude, ChatGPT, Cursor, v0 — to create a single-file HTML app.' },
  { num: '2', icon: '📤', title: 'Upload', desc: 'Drag & drop your file, or paste code directly. Pro users get auto-conversion for non-HTML.' },
  { num: '3', icon: '🚀', title: 'Share', desc: 'Your team opens the app instantly. Organize with folders, control visibility per app.' },
];

const features = [
  { icon: '🧠', title: 'AI-Powered', desc: 'Build tools with any AI assistant — no coding experience required.' },
  { icon: '📁', title: 'Folders', desc: 'Drag apps together to create folders. Rename, rearrange, keep things tidy.' },
  { icon: '👥', title: 'Team Sharing', desc: 'Invite your team and share tools instantly. Control who sees what.' },
  { icon: '🔄', title: 'Auto-Convert', desc: 'Pro users can upload .jsx, .vue, .svelte, .py, .md and more — auto-converted to HTML.' },
  { icon: '🎨', title: 'Theming', desc: 'Dark & light mode built in. Workspaces can set custom brand colors.' },
  { icon: '🔒', title: 'Visibility', desc: 'Set apps to team-wide, group-only, or private. You control access.' },
];

const htmlTypes = ['.html'];
const proTypes = ['.jsx', '.tsx', '.vue', '.svelte', '.js', '.ts', '.css', '.py', '.json', '.md', '.zip'];

const shortcuts = [
  { keys: ['Ctrl', 'V'], desc: 'Paste code directly into the upload zone' },
  { keys: ['Long press'], desc: 'Enter edit mode to rearrange or delete apps' },
  { keys: ['Drag'], desc: 'Reorder apps or drag one onto another to create a folder' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About AppHub</h1>
      </div>

      {/* Hero */}
      <div className="about-hero card">
        <h2 className="about-hero-title">Your team's portal for internal tools</h2>
        <p className="about-hero-desc">
          AppHub makes it dead simple to share calculators, dashboards, forms, and utilities
          across your team — all built as lightweight HTML apps with AI.
        </p>
      </div>

      {/* How it works */}
      <section className="about-section">
        <h3 className="about-section-title">How it works</h3>
        <div className="about-steps">
          {steps.map(s => (
            <div key={s.num} className="about-step card">
              <span className="about-step-num">{s.num}</span>
              <span className="about-step-icon">{s.icon}</span>
              <h4 className="about-step-title">{s.title}</h4>
              <p className="about-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="about-section">
        <h3 className="about-section-title">Features</h3>
        <div className="about-features">
          {features.map(f => (
            <div key={f.title} className="about-feature card">
              <span className="about-feature-icon">{f.icon}</span>
              <div>
                <h4 className="about-feature-title">{f.title}</h4>
                <p className="about-feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* File types */}
      <section className="about-section">
        <h3 className="about-section-title">Supported file types</h3>
        <div className="card about-filetypes-card">
          <div className="about-filetypes-group">
            <span className="about-filetypes-label">Upload directly</span>
            <div className="about-filetypes">
              {htmlTypes.map(t => (
                <span key={t} className="about-filetype-badge about-filetype-badge-primary">{t}</span>
              ))}
            </div>
          </div>
          <div className="about-filetypes-group">
            <span className="about-filetypes-label">Auto-convert <span className="about-pro-tag">PRO</span></span>
            <div className="about-filetypes">
              {proTypes.map(t => (
                <span key={t} className="about-filetype-badge">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Keyboard shortcuts */}
      <section className="about-section">
        <h3 className="about-section-title">Keyboard shortcuts</h3>
        <div className="card about-shortcuts">
          {shortcuts.map((s, i) => (
            <div key={i} className="about-shortcut-row">
              <div className="about-shortcut-keys">
                {s.keys.map(k => (
                  <kbd key={k} className="about-kbd">{k}</kbd>
                ))}
              </div>
              <span className="about-shortcut-desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="about-cta">
        <p className="about-cta-text">Ready to share something useful?</p>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          Upload Your First App
        </button>
      </div>
    </div>
  );
}
