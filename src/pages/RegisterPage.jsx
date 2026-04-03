import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

const PLAN_LABELS = { team: 'Team', business: 'Creator', power: 'Pro', pro: 'Pro' };

export default function RegisterPage() {
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite');
  const stripeSessionId = searchParams.get('stripe_session');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [stripePlan, setStripePlan] = useState(null);
  const [stripeVerifying, setStripeVerifying] = useState(!!stripeSessionId);
  const [stripeWarning, setStripeWarning] = useState('');

  useEffect(() => {
    if (!stripeSessionId) return;
    api.verifyStripeSession(stripeSessionId)
      .then((data) => {
        if (data.valid) {
          setStripePlan(data.plan);
          if (data.email) setEmail(data.email);
        } else {
          setStripeWarning('Payment session could not be verified. You can still register for a free account.');
        }
      })
      .catch(() => {
        setStripeWarning('Payment session could not be verified. You can still register for a free account.');
      })
      .finally(() => setStripeVerifying(false));
  }, [stripeSessionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must be at least 8 characters with one uppercase letter and one number');
      setLoading(false);
      return;
    }

    try {
      const body = { email, password, displayName };
      if (inviteCode) {
        body.inviteCode = inviteCode;
      } else {
        body.workspaceName = workspaceName;
      }
      if (stripeSessionId && stripePlan) {
        body.stripeSessionId = stripeSessionId;
      }
      await register(body);
    } catch (err) {
      setError(err.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="login-logo">
          <img src="/apphubLogo.png" alt="AppHub" />
        </div>
        <h1>{inviteCode ? 'Join your team' : 'Create your workspace'}</h1>
        <p className="subtitle">
          {inviteCode
            ? 'You\'ve been invited to join a workspace on AppHub'
            : 'Set up a branded app portal for your team'
          }
        </p>

        {stripeVerifying && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <span className="spinner" />
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Verifying payment...</p>
          </div>
        )}

        {!stripeVerifying && stripePlan && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--success, #10b981)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
          }}>
            <span style={{ color: 'var(--success, #10b981)', fontSize: 18, flexShrink: 0 }}>&#x2713;</span>
            <span>
              <strong>{PLAN_LABELS[stripePlan] || stripePlan} plan</strong> payment received &mdash; complete registration to activate
            </span>
          </div>
        )}

        {!stripeVerifying && stripeWarning && (
          <div style={{
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid #eab308',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
            fontSize: 13,
            color: '#ca8a04',
          }}>
            {stripeWarning}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!inviteCode && (
            <div className="form-group">
              <label className="label">Workspace Name</label>
              <input
                className="input"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g. Franmarine"
                required
                autoFocus
              />
            </div>
          )}

          <div className="form-group">
            <label className="label">Your Name</label>
            <input
              className="input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Mat Harvey"
              required
              autoFocus={!!inviteCode}
            />
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, one uppercase, one number"
              required
              minLength={8}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <span className="spinner" /> : (inviteCode ? 'Join workspace' : 'Create workspace')}
          </button>
        </form>

        <div className="form-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
