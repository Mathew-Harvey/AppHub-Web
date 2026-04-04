import { useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const PLANS = [
  {
    key: 'team',
    name: 'Team',
    price: '$12',
    features: [
      'Up to 50 hosted apps',
      'Up to 15 team members',
      '20 AI conversions / month',
      'Smart AI uploads',
    ],
  },
  {
    key: 'business',
    name: 'Creator',
    price: '$29',
    features: [
      'Unlimited apps & members',
      'AI app building (500K tokens)',
      'Custom branding',
      'Priority support',
    ],
  },
  {
    key: 'power',
    name: 'Pro',
    price: '$79',
    features: [
      'Everything unlimited',
      'Unlimited AI building',
      'No token limits',
      'Dedicated support',
    ],
  },
];

export default function UpgradeModal({ onClose, limitMessage, currentPlan }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  async function handleUpgrade(planKey) {
    setLoading(true);
    try {
      const { url } = await api.createCheckout(planKey);
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  const activePlan = currentPlan || user?.workspace?.plan || 'free';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal upgrade-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <button className="upgrade-modal-close" onClick={onClose}>&times;</button>

        <h2 className="upgrade-modal-title">
          {activePlan === 'free' ? 'Upgrade your subscription' : 'Change your plan'}
        </h2>

        {limitMessage && (
          <p className="upgrade-modal-limit">{limitMessage}</p>
        )}

        <div style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
          {PLANS.map((p) => {
            const isCurrent = activePlan === p.key;
            const isSelected = selectedPlan === p.key;

            return (
              <div
                key={p.key}
                onClick={() => !isCurrent && setSelectedPlan(p.key)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '14px 12px',
                  borderRadius: 10,
                  border: isSelected
                    ? '2px solid var(--accent)'
                    : isCurrent
                      ? '2px solid var(--success)'
                      : '1px solid var(--border)',
                  cursor: isCurrent ? 'default' : 'pointer',
                  opacity: isCurrent ? 0.7 : 1,
                  position: 'relative',
                  transition: 'border-color 0.15s, transform 0.15s',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {isCurrent && (
                  <div style={{
                    position: 'absolute',
                    top: -8,
                    right: 8,
                    background: 'var(--success)',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 10,
                    textTransform: 'uppercase',
                  }}>
                    Current
                  </div>
                )}
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  {p.price}<span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>/mo</span>
                </div>
                <div style={{ marginTop: 10 }}>
                  {p.features.map((f) => (
                    <div key={f} style={{ fontSize: 11, color: 'var(--text-muted)', padding: '2px 0', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--success)', flexShrink: 0 }}>&#x2713;</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={() => handleUpgrade(selectedPlan)}
          disabled={loading || !selectedPlan}
          style={{ marginTop: 8 }}
        >
          {loading ? <span className="spinner" /> : selectedPlan ? `Subscribe to ${PLANS.find(p => p.key === selectedPlan)?.name}` : 'Select a plan'}
        </button>

        {activePlan !== 'free' && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
            Your current subscription will be cancelled and replaced with the new plan.
          </p>
        )}
      </div>
    </div>
  );
}
