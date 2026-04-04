import { useEffect, useState } from 'react';

const PLAN_INFO = {
  team: {
    name: 'Team',
    price: '$12',
    features: [
      'Up to 50 hosted apps',
      'Up to 15 team members',
      '20 AI conversions per month',
      'Smart AI uploads',
      'Branded workspace',
      'Drag-and-drop HTML uploads',
      'Password-protected portal',
    ],
  },
  business: {
    name: 'Creator',
    price: '$29',
    features: [
      'Unlimited hosted apps',
      'Unlimited team members',
      '100 AI conversions per month',
      'AI app building (500K tokens/mo)',
      'Custom branding',
      'Priority support',
      'Branded workspace',
      'Drag-and-drop HTML uploads',
      'Password-protected portal',
    ],
  },
  power: {
    name: 'Pro',
    price: '$79',
    features: [
      'Unlimited hosted apps',
      'Unlimited team members',
      'Unlimited AI app building',
      'Unlimited iterations',
      'No token limits',
      'Custom branding',
      'Dedicated support channel',
    ],
  },
};

export default function UpgradeSplash({ planKey, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const plan = PLAN_INFO[planKey] || PLAN_INFO.team;

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 250);
  }

  return (
    <div
      className="modal-overlay"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' }}
      onClick={handleClose}
    >
      <div
        className="modal upgrade-splash"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 520,
          textAlign: 'center',
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 8 }}>&#127881;</div>

        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Welcome to {plan.name}!
        </h2>

        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 15 }}>
          Your workspace has been upgraded to the <strong>{plan.name}</strong> plan
          ({plan.price}/month). Here's what you've unlocked:
        </p>

        <div style={{
          textAlign: 'left',
          background: 'var(--bg)',
          borderRadius: 'var(--radius)',
          padding: '16px 20px',
          marginBottom: 24,
        }}>
          {plan.features.map((f) => (
            <div
              key={f}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 0',
                fontSize: 14,
              }}
            >
              <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>&#x2713;</span>
              <span>{f}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-full" onClick={handleClose}>
          Let's go!
        </button>
      </div>
    </div>
  );
}
