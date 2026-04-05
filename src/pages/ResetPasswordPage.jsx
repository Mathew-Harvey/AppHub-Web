import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import PasswordInput from '../components/PasswordInput';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card card">
          <h1>Invalid link</h1>
          <p className="subtitle">This reset link is missing or malformed.</p>
          <div className="form-footer"><Link to="/login">Back to sign in</Link></div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card card">
          <h1>Password reset</h1>
          <p className="subtitle">Your password has been changed. You can now sign in.</p>
          <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: 16 }}>
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must be at least 8 characters with one uppercase letter and one number');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1>Set new password</h1>
        <p className="subtitle">Choose a new password for your account.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">New password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, one uppercase, one number"
              required
              minLength={8}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="label">Confirm password</label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              required
              minLength={8}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <span className="spinner" /> : 'Reset password'}
          </button>
        </form>

        <div className="form-footer">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
