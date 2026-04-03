import { useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function CodeErrorsModal({ errors, message, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === 'admin';

  async function handleUpgrade() {
    setLoading(true);
    try {
      const { url } = await api.createCheckout();
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal code-errors-modal" onClick={(e) => e.stopPropagation()}>
        <button className="code-errors-modal-close" onClick={onClose}>&times;</button>

        <div className="code-errors-modal-icon">&#x26A0;&#xFE0F;</div>
        <h2 className="code-errors-modal-title">Code Errors Found</h2>
        <p className="code-errors-modal-desc">
          {message || 'Your HTML file contains JavaScript errors.'}
        </p>

        <div className="code-errors-list">
          {errors.map((err, i) => (
            <div key={i} className="code-error-item">
              <span className="code-error-badge">{err.type === 'syntax_error' ? 'Syntax' : 'Error'}</span>
              <div className="code-error-detail">
                <span className="code-error-message">{err.message}</span>
                {err.line != null && (
                  <span className="code-error-line">Line {err.line}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="code-errors-cta">
          <div className="code-errors-cta-header">
            <span className="plan-badge plan-badge-pro plan-badge-sm">PRO</span>
            <span className="code-errors-cta-label">Auto-fix with AI</span>
          </div>
          <p className="code-errors-cta-text">
            Upgrade and we'll automatically fix code errors with AI during upload.
          </p>

          {isAdmin ? (
            <button
              className="btn btn-primary btn-full"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'Get Started'}
            </button>
          ) : (
            <p className="code-errors-cta-non-admin">
              Ask your workspace admin to upgrade.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
