import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

export default function LoginPage() {
  const { login, acceptInvite } = useAuth();

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invites, setInvites] = useState([]);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const passwordRef = useRef(null);
  const nameRef = useRef(null);

  function resetToEmail() {
    setStep('email');
    setPassword('');
    setDisplayName('');
    setConfirmPassword('');
    setInvites([]);
    setSelectedInvite(null);
    setError('');
  }

  async function handleEmailContinue(e) {
    e.preventDefault();
    if (!email.trim() || checking) return;
    setError('');
    setChecking(true);

    try {
      const data = await api.checkEmail(email.trim());

      if (data.status === 'existing_user') {
        setStep('login');
        setTimeout(() => passwordRef.current?.focus(), 120);
      } else if (data.status === 'pending_invite') {
        setInvites(data.invites);
        if (data.invites.length === 1) {
          setSelectedInvite(data.invites[0]);
          setStep('invite');
          setTimeout(() => nameRef.current?.focus(), 120);
        } else {
          setStep('invite-select');
        }
      } else {
        setStep('unknown');
      }
    } catch (err) {
      setError(err.error || 'Something went wrong. Please try again.');
    } finally {
      setChecking(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!password || submitting) return;
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSelectInvite(invite) {
    setSelectedInvite(invite);
    setStep('invite');
    setTimeout(() => nameRef.current?.focus(), 120);
  }

  async function handleAcceptInvite(e) {
    e.preventDefault();
    if (submitting) return;

    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must be at least 8 characters with one uppercase letter and one number');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await acceptInvite({
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        inviteId: selectedInvite.inviteId,
      });
    } catch (err) {
      setError(err.error || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  }

  const invite = selectedInvite;
  const cardClass = [
    'auth-card card login-step',
    step === 'invite' && 'invite-welcome-card',
    step === 'invite-select' && 'invite-select-card',
  ].filter(Boolean).join(' ');

  return (
    <div className="auth-page">
      <div className={cardClass} key={step}>

        {/* ── Step: Email ──────────────────────────────────────────── */}
        {step === 'email' && (
          <>
            <div className="login-logo">
              <img src="/apphubLogo.png" alt="AppHub" />
            </div>
            <p className="subtitle">Enter your email to get started</p>

            <form onSubmit={handleEmailContinue}>
              <div className="form-group">
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@company.com"
                  required
                  autoFocus
                />
              </div>

              {error && <p className="error-text">{error}</p>}

              <button
                className="btn btn-primary btn-full"
                type="submit"
                disabled={checking}
                style={{ marginTop: 8 }}
              >
                {checking ? <span className="spinner" /> : 'Continue'}
              </button>
            </form>

            <div className="form-footer">
              <Link to="/register">Create a new workspace</Link>
            </div>
          </>
        )}

        {/* ── Step: Login (existing user) ──────────────────────────── */}
        {step === 'login' && (
          <>
            <h1>Welcome back</h1>
            <p className="subtitle">Sign in to your workspace</p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="label">Email</label>
                <div className="email-readonly-row">
                  <span className="email-readonly">{email}</span>
                  <button
                    type="button"
                    className="email-edit-btn"
                    onClick={resetToEmail}
                    title="Change email"
                  >
                    ✎
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Password</label>
                <input
                  ref={passwordRef}
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && <p className="error-text">{error}</p>}

              <button
                className="btn btn-primary btn-full"
                type="submit"
                disabled={submitting}
                style={{ marginTop: 8 }}
              >
                {submitting ? <span className="spinner" /> : 'Sign in'}
              </button>
            </form>

            <div className="form-footer">
              <Link to="/forgot-password">Forgot password?</Link>
              <span style={{ margin: '0 8px', color: 'var(--border)' }}>|</span>
              <Link to="/register">Create workspace</Link>
            </div>
          </>
        )}

        {/* ── Step: Invite select (multiple workspaces) ────────────── */}
        {step === 'invite-select' && (
          <>
            <h1>You&apos;ve been invited!</h1>
            <p className="subtitle">Choose a workspace to join</p>

            <div className="invite-workspace-list">
              {invites.map(inv => (
                <button
                  key={inv.inviteId}
                  className="invite-workspace-option"
                  onClick={() => handleSelectInvite(inv)}
                >
                  {inv.workspaceLogoData ? (
                    <img
                      src={inv.workspaceLogoData}
                      alt=""
                      className="invite-workspace-logo"
                    />
                  ) : (
                    <div className="invite-workspace-logo-placeholder">
                      {inv.workspaceName.charAt(0)}
                    </div>
                  )}
                  <span className="invite-workspace-name">{inv.workspaceName}</span>
                  <span className="invite-workspace-arrow">&rarr;</span>
                </button>
              ))}
            </div>

            <div className="form-footer">
              <button type="button" className="link-btn" onClick={resetToEmail}>
                Use a different email
              </button>
            </div>
          </>
        )}

        {/* ── Step: Invite accept (onboarding form) ────────────────── */}
        {step === 'invite' && invite && (
          <>
            {invite.workspaceLogoData && (
              <div className="invite-welcome-logo">
                <img src={invite.workspaceLogoData} alt={invite.workspaceName} />
              </div>
            )}

            <h1>Welcome to {invite.workspaceName}!</h1>
            <p className="subtitle">Set up your account to get started</p>

            <form onSubmit={handleAcceptInvite}>
              <div className="form-group">
                <label className="label">Email</label>
                <div className="email-readonly-row">
                  <span className="email-readonly">{email}</span>
                  <button
                    type="button"
                    className="email-edit-btn"
                    onClick={resetToEmail}
                    title="Change email"
                  >
                    ✎
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Your Name</label>
                <input
                  ref={nameRef}
                  className="input"
                  type="text"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); setError(''); }}
                  placeholder="How should your team know you?"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Min 8 chars, one uppercase, one number"
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label className="label">Confirm Password</label>
                <input
                  className="input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Type it again"
                  required
                />
              </div>

              {error && <p className="error-text">{error}</p>}

              <button
                className="btn btn-primary btn-full"
                type="submit"
                disabled={submitting}
                style={{ marginTop: 8 }}
              >
                {submitting ? <span className="spinner" /> : 'Get Started'}
              </button>
            </form>

            {invites.length > 1 && (
              <div className="form-footer">
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => { setStep('invite-select'); setError(''); }}
                >
                  Choose a different workspace
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Step: Unknown email ──────────────────────────────────── */}
        {step === 'unknown' && (
          <>
            <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🤔</div>
              <h1>No account found</h1>
              <p className="subtitle" style={{ marginBottom: 16 }}>
                We couldn&apos;t find an account or invitation for <strong>{email}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-primary btn-full" onClick={resetToEmail}>
                Try a different email
              </button>
              <Link
                to="/register"
                className="btn btn-secondary btn-full"
                style={{ textDecoration: 'none' }}
              >
                Create a new workspace
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
