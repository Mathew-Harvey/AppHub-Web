import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { copyToClipboard } from '../utils/clipboard';
import { useAuth } from '../contexts/AuthContext';
import { isPlanLimitError } from '../hooks/usePlan';
import UpgradeModal from './UpgradeModal';

export default function InviteModal({ onClose }) {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [lastLink, setLastLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [sentEmails, setSentEmails] = useState([]);

  const isAdmin = user?.role === 'admin';
  const workspaceName = user?.workspace?.name || 'your workspace';

  useEffect(() => {
    if (isAdmin) inputRef.current?.focus();
  }, [isAdmin]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || sending) return;
    setError('');
    setSending(true);

    try {
      const data = await api.invite(trimmed);
      setLastLink(data.invitation.inviteLink || '');
      setSentEmails(prev => [trimmed, ...prev]);
      setEmail('');
      setCopied(false);
      inputRef.current?.focus();
    } catch (err) {
      if (isPlanLimitError(err)) {
        setUpgradeMessage(err.message);
        setShowUpgradeModal(true);
      } else {
        setError(err.error || 'Failed to send invitation');
      }
    } finally {
      setSending(false);
    }
  }

  async function handleCopy() {
    try {
      await copyToClipboard(lastLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  }

  if (showUpgradeModal) {
    return (
      <UpgradeModal
        onClose={() => setShowUpgradeModal(false)}
        limitMessage={upgradeMessage}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal invite-modal" onClick={e => e.stopPropagation()}>
        <button className="invite-modal-close" onClick={onClose}>&times;</button>

        <div className="invite-modal-header">
          <div className="invite-modal-icon">👋</div>
          <h2>Invite to {workspaceName}</h2>
          <p>Send an invite link so they can join and start building</p>
        </div>

        {isAdmin ? (
          <>
            <form className="invite-modal-form" onSubmit={handleSubmit}>
              <div className="invite-modal-input-row">
                <input
                  ref={inputRef}
                  className="input invite-modal-input"
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  required
                  autoComplete="email"
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending || !email.trim()}
                >
                  {sending ? <span className="spinner" /> : 'Invite'}
                </button>
              </div>
            </form>

            {error && <p className="error-text" style={{ textAlign: 'center', marginTop: 8 }}>{error}</p>}

            {lastLink && (
              <div className="invite-modal-link-section">
                <div className="invite-modal-success">
                  <span className="invite-modal-check">&#x2713;</span>
                  Invitation sent{sentEmails.length > 1 ? ` (${sentEmails.length} total)` : ''}
                </div>
                <div className="invite-modal-link">
                  <span className="invite-modal-link-url">{lastLink}</span>
                  <button
                    className={`btn btn-sm ${copied ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={handleCopy}
                  >
                    {copied ? '✓ Copied!' : 'Copy link'}
                  </button>
                </div>
                <p className="invite-modal-link-hint">
                  Or share this link directly — no email needed.
                </p>
              </div>
            )}

            {sentEmails.length > 0 && (
              <div className="invite-modal-sent">
                {sentEmails.map((addr, i) => (
                  <div key={i} className="invite-modal-sent-item">
                    <span className="invite-modal-sent-check">✓</span>
                    <span>{addr}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="invite-modal-footer">
              Invite as many people as you like — they&apos;ll each get a unique link.
            </p>
          </>
        ) : (
          <div className="invite-modal-non-admin">
            <p>Only workspace admins can send invitations.</p>
            <p className="invite-modal-non-admin-hint">
              Ask your admin to invite people, or share the workspace name
              so they know where to find you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
