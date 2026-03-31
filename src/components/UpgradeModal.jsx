import { useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const PRO_FEATURES = [
  'Unlimited hosted apps',
  'Unlimited team members',
  'Smart AI uploads',
  '50 AI conversions/month',
  'Priority support',
];

export default function UpgradeModal({ onClose, limitMessage }) {
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
      <div className="modal upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <button className="upgrade-modal-close" onClick={onClose}>&times;</button>

        <div className="upgrade-modal-icon">&#x1F680;</div>
        <h2 className="upgrade-modal-title">Upgrade to Pro</h2>

        {limitMessage && (
          <p className="upgrade-modal-limit">{limitMessage}</p>
        )}

        <div className="upgrade-modal-features">
          {PRO_FEATURES.map((f) => (
            <div key={f} className="upgrade-modal-feature">
              <span className="upgrade-modal-check">&#x2713;</span>
              <span>{f}</span>
            </div>
          ))}
        </div>

        <div className="upgrade-modal-price">
          <span className="upgrade-modal-amount">$5</span>
          <span className="upgrade-modal-period">/month per workspace</span>
        </div>

        {isAdmin ? (
          <button
            className="btn btn-primary btn-full"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Upgrade to Pro — $5/mo'}
          </button>
        ) : (
          <p className="upgrade-modal-non-admin">
            Ask your workspace admin to upgrade.
          </p>
        )}
      </div>
    </div>
  );
}

export function isPlanLimitError(err) {
  return err?.error === 'plan_limit' || err?.error === 'upgrade_required';
}
