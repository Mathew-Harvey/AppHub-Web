import { useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const PAID_FEATURES = [
  'Up to unlimited hosted apps',
  'Up to unlimited team members',
  'Smart AI uploads',
  'AI conversions included',
  'Priority support',
];

const PLANS = [
  { name: 'Team', price: '$12', detail: '50 apps, 15 members, 20 AI conversions/mo' },
  { name: 'Business', price: '$29', detail: 'Unlimited apps & members, 500K builder tokens' },
  { name: 'Pro', price: '$79', detail: 'Everything unlimited' },
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
        <h2 className="upgrade-modal-title">Upgrade your workspace</h2>

        {limitMessage && (
          <p className="upgrade-modal-limit">{limitMessage}</p>
        )}

        <div className="upgrade-modal-features">
          {PAID_FEATURES.map((f) => (
            <div key={f} className="upgrade-modal-feature">
              <span className="upgrade-modal-check">&#x2713;</span>
              <span>{f}</span>
            </div>
          ))}
        </div>

        <div className="upgrade-modal-plans" style={{ display: 'flex', gap: 12, margin: '16px 0', justifyContent: 'center' }}>
          {PLANS.map((p) => (
            <div key={p.name} style={{
              textAlign: 'center',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              flex: 1,
              minWidth: 0,
            }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{p.price}<span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>/mo</span></div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{p.detail}</div>
            </div>
          ))}
        </div>

        {isAdmin ? (
          <button
            className="btn btn-primary btn-full"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Get Started'}
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

