import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const FEATURES = [
  { icon: '📝', text: 'Guided form helps you express your ideas' },
  { icon: '⚡', text: 'AI generates a complete, working HTML app' },
  { icon: '🔄', text: 'Preview and revise until it\'s perfect' },
  { icon: '🚀', text: 'Publish directly to your AppHub workspace' },
];

export default function BuilderUpgradePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === 'admin';

  async function handleUpgrade() {
    setLoading(true);
    try {
      const { url } = await api.createCheckout('business');
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="builder-upgrade-page">
      <div className="builder-upgrade-card card">
        <div className="builder-upgrade-icon">✨</div>
        <h1 className="builder-upgrade-title">AI App Builder</h1>
        <p className="builder-upgrade-sub">
          Describe what you want and we'll build it for you — a fully working app in seconds.
        </p>

        <div className="builder-upgrade-features">
          {FEATURES.map((f, i) => (
            <div key={i} className="builder-upgrade-feature">
              <span className="builder-upgrade-feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        <div className="builder-upgrade-plans">
          <div className="builder-upgrade-plan">
            <strong>Creator</strong>
            <span className="builder-upgrade-plan-price">$29/mo</span>
            <span className="builder-upgrade-plan-detail">500K tokens/month</span>
          </div>
          <div className="builder-upgrade-plan highlighted">
            <strong>Pro</strong>
            <span className="builder-upgrade-plan-price">$79/mo</span>
            <span className="builder-upgrade-plan-detail">Unlimited builds</span>
          </div>
        </div>

        {isAdmin ? (
          <button
            className="btn btn-primary btn-full"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Get Started'}
          </button>
        ) : (
          <div className="builder-upgrade-non-admin">
            <p style={{ fontWeight: 600, marginBottom: 6 }}>Available for workspace admins on Creator or Pro plans</p>
            <p>As an invited member, you have free-tier access. Ask your workspace admin to upgrade for AI App Builder access.</p>
          </div>
        )}

        <Link to="/" className="builder-upgrade-back">&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
