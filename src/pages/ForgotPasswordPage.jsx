import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.requestReset(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <h1>Check your email</h1>
          <p className="subtitle">
            If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your inbox (and spam folder).
          </p>
          <p className="subtitle" style={{ marginTop: 12, fontSize: 13 }}>
            The link expires in 1 hour.
          </p>
          <div className="form-footer">
            <Link to="/login">Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="login-logo">
          <img src="/apphubLogo.png" alt="AppHub" />
        </div>
        <h1>Reset password</h1>
        <p className="subtitle">Enter your email and we'll help you get back in.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoFocus
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <span className="spinner" /> : 'Continue'}
          </button>
        </form>

        <div className="form-footer">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
