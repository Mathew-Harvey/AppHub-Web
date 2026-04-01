import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const body = { email, password, displayName };
      if (inviteCode) {
        body.inviteCode = inviteCode;
      } else {
        body.workspaceName = workspaceName;
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
              placeholder="At least 8 characters"
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
