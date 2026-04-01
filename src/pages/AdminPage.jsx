import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { useToast } from '../components/Toast';
import UpgradeModal, { isPlanLimitError } from '../components/UpgradeModal';
import { timeAgo } from '../utils/timeAgo';

export default function AdminPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast, ToastElement } = useToast();
  const logoInputRef = useRef(null);

  const isPageAdmin = user?.role === 'admin';

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      showToast('Welcome to Pro! Your workspace has been upgraded.', 'success');
      refreshUser();
      setSearchParams({}, { replace: true });
    } else if (searchParams.get('cancelled') === 'true') {
      setSearchParams({}, { replace: true });
    }
  }, []);

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [lastInviteLink, setLastInviteLink] = useState('');
  const [lastResetLink, setLastResetLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [wsName, setWsName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1a1a2e');
  const [accentColor, setAccentColor] = useState('#e94560');
  const [primaryColorLight, setPrimaryColorLight] = useState('#ffffff');
  const [accentColorLight, setAccentColorLight] = useState('#d63851');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const isAdmin = user?.role === 'admin';
      const [wsData, memData, invData, pendingData, subData] = await Promise.all([
        isAdmin ? api.getWorkspace() : Promise.resolve(null),
        isAdmin ? api.getMembers() : Promise.resolve({ members: [] }),
        isAdmin ? api.getInvitations() : Promise.resolve({ invitations: [] }),
        isAdmin ? api.getPendingDeletions() : Promise.resolve({ apps: [] }),
        isAdmin ? api.getSubscriptionStatus().catch(() => null) : Promise.resolve(null)
      ]);
      if (wsData) {
        setWorkspace(wsData.workspace);
        setWsName(wsData.workspace.name);
        setPrimaryColor(wsData.workspace.primaryColor || '#1a1a2e');
        setAccentColor(wsData.workspace.accentColor || '#e94560');
        setPrimaryColorLight(wsData.workspace.primaryColorLight || '#ffffff');
        setAccentColorLight(wsData.workspace.accentColorLight || '#d63851');
      }
      setMembers(memData.members);
      setInvitations(invData.invitations);
      setPendingDeletions(pendingData.apps);
      if (subData) setSubscription(subData);
    } catch (err) {
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError('Password must be at least 8 characters with one uppercase letter and one number');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    try {
      await api.changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('Password changed successfully', 'success');
    } catch (err) {
      setPasswordError(err.error || 'Failed to change password');
    }
  }

  async function saveBranding(e) {
    e.preventDefault();
    try {
      await api.updateWorkspace({ name: wsName, primaryColor, accentColor, primaryColorLight, accentColorLight });
      await refreshUser();
      showToast('Workspace updated', 'success');
    } catch (err) { showToast(err.error || 'Update failed', 'error'); }
  }

  async function uploadLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    try {
      await api.uploadLogo(formData);
      await refreshUser();
      showToast('Logo updated', 'success');
      loadAll();
    } catch (err) { showToast(err.error || 'Logo upload failed', 'error'); }
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      const data = await api.invite(inviteEmail);
      setLastInviteLink(data.invitation.inviteLink);
      setInviteEmail('');
      showToast(`Invitation created for ${data.invitation.email}`, 'success');
      loadAll();
    } catch (err) {
      if (isPlanLimitError(err)) {
        setUpgradeMessage(err.message);
        setShowUpgradeModal(true);
      } else {
        showToast(err.error || 'Invite failed', 'error');
      }
    }
  }

  async function handleRevokeInvite(id) {
    try { await api.revokeInvite(id); showToast('Invitation revoked', 'success'); loadAll(); }
    catch (err) { showToast(err.error || 'Failed to revoke', 'error'); }
  }

  async function handleRoleChange(memberId, newRole) {
    try { await api.changeRole(memberId, newRole); showToast('Role updated', 'success'); loadAll(); }
    catch (err) { showToast(err.error || 'Failed to change role', 'error'); }
  }

  async function handleRemoveMember(memberId) {
    if (!confirm('Remove this member? They will lose access to the workspace.')) return;
    try { await api.removeMember(memberId); showToast('Member removed', 'success'); loadAll(); }
    catch (err) { showToast(err.error || 'Failed to remove member', 'error'); }
  }

  async function handleResetPassword(memberId) {
    try {
      const data = await api.adminReset(memberId);
      setLastResetLink(data.resetLink);
      showToast(`Reset link generated for ${data.email}`, 'success');
    } catch (err) { showToast(err.error || 'Failed to generate reset link', 'error'); }
  }

  async function copyLink(text) {
    try { await navigator.clipboard.writeText(text); showToast('Copied!', 'success'); }
    catch { showToast('Failed to copy', 'error'); }
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      const { url } = await api.createCheckout();
      window.location.href = url;
    } catch (err) {
      showToast(err.error || 'Failed to start checkout', 'error');
      setCheckoutLoading(false);
    }
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const { url } = await api.createPortal();
      window.location.href = url;
    } catch (err) {
      showToast(err.error || 'Failed to open billing portal', 'error');
      setPortalLoading(false);
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 64 }}><div className="spinner" /></div>;
  }

  const logoSrc = workspace?.logoData || null;
  const activeMembers = members.filter(m => m.isActive);
  const removedMembers = members.filter(m => !m.isActive);
  const pendingInvites = invitations.filter(i => !i.accepted);

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      {/* Subscription */}
      {isPageAdmin && subscription && (
        <div className="admin-section">
          <h3>Subscription</h3>
          <div className="card subscription-card">
            <div className="subscription-header">
              <div>
                <span className={`plan-badge plan-badge-lg ${subscription.plan === 'pro' ? 'plan-badge-pro' : 'plan-badge-free'}`}>
                  {subscription.planName}
                </span>
                {subscription.plan === 'pro' && (
                  <span className="subscription-price-tag">$12/month</span>
                )}
              </div>
            </div>

            <div className="subscription-usage">
              <div className="usage-item">
                <div className="usage-label">
                  <span>Apps</span>
                  <span className="usage-count">
                    {subscription.usage.apps}{subscription.maxApps != null ? ` / ${subscription.maxApps}` : ''}{subscription.maxApps == null && ' \u2014 Unlimited'}
                  </span>
                </div>
                {subscription.maxApps != null && (
                  <div className="usage-bar">
                    <div
                      className={`usage-bar-fill${subscription.usage.apps / subscription.maxApps >= 0.8 ? ' usage-bar-warning' : ''}`}
                      style={{ width: `${Math.min(100, (subscription.usage.apps / subscription.maxApps) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="usage-item">
                <div className="usage-label">
                  <span>Members</span>
                  <span className="usage-count">
                    {subscription.usage.members}{subscription.maxMembers != null ? ` / ${subscription.maxMembers}` : ''}{subscription.maxMembers == null && ' \u2014 Unlimited'}
                  </span>
                </div>
                {subscription.maxMembers != null && (
                  <div className="usage-bar">
                    <div
                      className={`usage-bar-fill${subscription.usage.members / subscription.maxMembers >= 0.8 ? ' usage-bar-warning' : ''}`}
                      style={{ width: `${Math.min(100, (subscription.usage.members / subscription.maxMembers) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {subscription.aiConversions && (
                <div className="usage-item">
                  <div className="usage-label">
                    <span>AI Conversions</span>
                    <span className="usage-count">
                      {subscription.usage.aiConversions} / {subscription.aiConversionsLimit} this month
                    </span>
                  </div>
                  <div className="usage-bar">
                    <div
                      className="usage-bar-fill"
                      style={{ width: `${Math.min(100, (subscription.usage.aiConversions / subscription.aiConversionsLimit) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {subscription.plan === 'free' ? (
              <div className="subscription-upgrade">
                <p className="subscription-upgrade-text">
                  Unlock unlimited apps, unlimited members, and Smart AI uploads.
                </p>
                <button className="btn btn-primary" onClick={handleCheckout} disabled={checkoutLoading}>
                  {checkoutLoading ? <span className="spinner" /> : 'Upgrade to Pro \u2014 $12/mo'}
                </button>
              </div>
            ) : (
              <button className="btn btn-secondary" onClick={handleManageSubscription} disabled={portalLoading} style={{ marginTop: 16 }}>
                {portalLoading ? <span className="spinner" /> : 'Manage Subscription'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pending Deletions */}
      {isPageAdmin && pendingDeletions.length > 0 && (
        <div className="admin-section">
          <h3>Pending Deletions ({pendingDeletions.length})</h3>
          {pendingDeletions.map((app) => (
            <div key={app.id} className="member-row">
              <div className="member-info">
                <span className="member-name">{app.icon} {app.name}</span>
                <span className="member-email">
                  Uploaded by {app.uploadedBy}{app.requestedBy ? ` \u00b7 Requested by ${app.requestedBy}` : ''}
                </span>
              </div>
              <div className="member-actions">
                <button className="btn btn-danger btn-sm" onClick={async () => {
                  try { await api.approveDeletion(app.id); setPendingDeletions(pendingDeletions.filter(a => a.id !== app.id)); showToast(`${app.name} deleted`, 'success'); }
                  catch (err) { showToast(err.error || 'Failed', 'error'); }
                }}>Approve</button>
                <button className="btn btn-ghost btn-sm" onClick={async () => {
                  try { await api.rejectDeletion(app.id); setPendingDeletions(pendingDeletions.filter(a => a.id !== app.id)); showToast(`Kept ${app.name}`, 'info'); }
                  catch (err) { showToast(err.error || 'Failed', 'error'); }
                }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Change Password */}
      <div className="admin-section">
        <h3>Change Password</h3>
        <div className="card">
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="label">Current Password</label>
              <input className="input" type="password" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(''); setPasswordSuccess(false); }} required />
            </div>
            <div className="form-group">
              <label className="label">New Password</label>
              <input className="input" type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); setPasswordSuccess(false); }} placeholder="Min 8 chars, one uppercase, one number" required />
            </div>
            <div className="form-group">
              <label className="label">Confirm New Password</label>
              <input className="input" type="password" value={confirmNewPassword} onChange={(e) => { setConfirmNewPassword(e.target.value); setPasswordError(''); setPasswordSuccess(false); }} required />
            </div>
            {passwordError && <p className="error-text">{passwordError}</p>}
            {passwordSuccess && <p style={{ color: 'var(--success)', fontSize: 13, marginTop: 6 }}>Password changed successfully.</p>}
            <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>Change Password</button>
          </form>
        </div>
      </div>

      {/* Whitelist \u2014 the complete picture of who has access */}
      {isPageAdmin && (<div className="admin-section">
        <h3>Whitelist ({activeMembers.length} active{pendingInvites.length > 0 ? `, ${pendingInvites.length} pending` : ''})</h3>

        {/* Invite */}
        <div className="card" style={{ marginBottom: 16 }}>
          <form className="invite-form" onSubmit={handleInvite}>
            <input className="input" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" required />
            <button type="submit" className="btn btn-primary">Invite</button>
          </form>
          {lastInviteLink && (
            <div className="invite-link">
              <span style={{ flex: 1, fontSize: 12 }}>{lastInviteLink}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => copyLink(lastInviteLink)}>Copy</button>
            </div>
          )}
        </div>

        {/* Active members */}
        {activeMembers.map((member) => (
          <div key={member.id} className="member-row">
            <div className="member-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="member-name">{member.displayName}</span>
                <span className={`role-badge ${member.role}`}>{member.role}</span>
              </div>
              <span className="member-email">{member.email}</span>
              <span className="member-meta">
                Last login: {timeAgo(member.lastLoginAt)} \u00b7 Joined {timeAgo(member.createdAt)}
              </span>
            </div>
            <div className="member-actions">
              {member.id !== user.id && (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleResetPassword(member.id)}>
                    Reset password
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleRoleChange(member.id, member.role === 'admin' ? 'member' : 'admin')}>
                    {member.role === 'admin' ? 'Remove admin' : 'Make admin'}
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveMember(member.id)}>
                    Remove
                  </button>
                </>
              )}
              {member.id === user.id && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>You</span>
              )}
            </div>
          </div>
        ))}

        {/* Reset link display */}
        {lastResetLink && (
          <div className="invite-link" style={{ marginTop: 8 }}>
            <span style={{ flex: 1, fontSize: 12 }}>{lastResetLink}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => copyLink(lastResetLink)}>Copy</button>
          </div>
        )}

        {/* Pending invitations */}
        {pendingInvites.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <label className="label">Pending invitations</label>
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="member-row" style={{ opacity: 0.7 }}>
                <div className="member-info">
                  <span className="member-email">{inv.email}</span>
                  <span className="member-meta">Invited {timeAgo(inv.createdAt)}</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => handleRevokeInvite(inv.id)}>Revoke</button>
              </div>
            ))}
          </div>
        )}

        {/* Removed members */}
        {removedMembers.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <label className="label">Removed</label>
            {removedMembers.map((member) => (
              <div key={member.id} className="member-row" style={{ opacity: 0.5 }}>
                <div className="member-info">
                  <span className="member-name" style={{ textDecoration: 'line-through' }}>{member.displayName}</span>
                  <span className="member-email">{member.email}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Deactivated</span>
              </div>
            ))}
          </div>
        )}
      </div>)}

      {/* Branding */}
      {isPageAdmin && (<div className="admin-section">
        <h3>Branding</h3>
        <div className="card">
          <form onSubmit={saveBranding}>
            <div className="form-group">
              <label className="label">Workspace Name</label>
              <input className="input" value={wsName} onChange={(e) => setWsName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="label">Logo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {logoSrc && <img src={logoSrc} alt="Logo" style={{ height: 40, borderRadius: 4 }} />}
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => logoInputRef.current?.click()}>
                  {logoSrc ? 'Change logo' : 'Upload logo'}
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={uploadLogo} style={{ display: 'none' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Primary Color</label>
              <div className="color-row">
                <input type="color" className="color-swatch" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                <input className="input" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ maxWidth: 120 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Accent Color</label>
              <div className="color-row">
                <input type="color" className="color-swatch" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                <input className="input" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ maxWidth: 120 }} />
              </div>
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <label className="label" style={{ marginBottom: 12 }}>Light mode colors</label>
              <div className="form-group">
                <label className="label">Primary Color (light)</label>
                <div className="color-row">
                  <input type="color" className="color-swatch" value={primaryColorLight} onChange={(e) => setPrimaryColorLight(e.target.value)} />
                  <input className="input" value={primaryColorLight} onChange={(e) => setPrimaryColorLight(e.target.value)} style={{ maxWidth: 120 }} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Accent Color (light)</label>
                <div className="color-row">
                  <input type="color" className="color-swatch" value={accentColorLight} onChange={(e) => setAccentColorLight(e.target.value)} />
                  <input className="input" value={accentColorLight} onChange={(e) => setAccentColorLight(e.target.value)} style={{ maxWidth: 120 }} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">Save branding</button>
          </form>
        </div>
      </div>)}

      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          limitMessage={upgradeMessage}
        />
      )}
      {ToastElement}
    </div>
  );
}
