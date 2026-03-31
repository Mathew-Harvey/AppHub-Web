import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function AboutPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const iframeRef = useRef(null);

  function handleThemeToggle() {
    toggleTheme();
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage({ type: 'apphub-theme-sync' }, '*');
    }, 50);
  }

  return (
    <div className="app-viewer">
      <div className="app-viewer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            ← Back
          </button>
          <h3>About AppHub</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="btn-theme-toggle"
            onClick={handleThemeToggle}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        src="/about.html"
        title="About AppHub"
        style={{ flex: 1, width: '100%', border: 'none', background: 'var(--bg)' }}
      />
    </div>
  );
}
