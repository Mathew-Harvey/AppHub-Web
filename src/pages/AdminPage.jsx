import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { useToast } from '../components/Toast';

export default function AdminPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { showToast, ToastElement } = useToast();
  const logoInputRef = useRef(null);

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/');
  }, [user]);

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [lastInviteLink, setLastInviteLink] = useState('');
  const [loading, setLoading] = useState(true);

  const [pendingDeletions, setPendingDeletions] = useState([]);

  const [wsName, setWsName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1a1a2e');
  const [accentColor, setAccentColor] = useState('#e94560');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [wsData, memData, invData, pendingData] = await Promise.all([
        api.getWorkspace(),
        api.getMembers(),
        api.getInvitations(),
        api.getPendingDeletions()
      ]);
      setWorkspace(wsData.workspace);
      setWsName(wsData.workspace.name);
      setPrimaryColor(wsData.workspace.primaryColor || '#1a1a2e');
      setAccentColor(wsData.workspace.accentColor || '#e94560');
      setMembers(memData.members);
      setInvitations(invData.invitations);
      setPendingDeletions(pendingData.apps);
    } catch (err) {
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function saveBranding(e) {
    e.preventDefault();
    try {
      await api.updateWorkspace({ name: wsName, primaryColor, accentColor });
      await refreshUser();
      showToast('Workspace updated', 'success');
    } catch (err) {
      showToast(err.error || 'Update failed', 'error');
    }
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
    } catch (err) {
      showToast(err.error || 'Logo upload failed', 'error');
    }
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
      showToast(err.error || 'Invite failed', 'error');
    }
  }

  async function handleRevokeInvite(id) {
    try {
      await api.revokeInvite(id);
      showToast('Invitation revoked', 'success');
      loadAll();
    } catch (err) {
      showToast(err.error || 'Failed to revoke', 'error');
    }
  }

  async function handleRoleChange(memberId, newRole) {
    try {
      await api.changeRole(memberId, newRole);
      showToast('Role updated', 'success');
      loadAll();
    } catch (err) {
      showToast(err.error || 'Failed to change role', 'error');
    }
  }

  async function handleRemoveMember(memberId) {
    if (!confirm('Remove this member? They will lose access to the workspace.')) return;
    try {
      await api.removeMember(memberId);
      showToast('Member removed', 'success');
      loadAll();
    } catch (err) {
      showToast(err.error || 'Failed to remove member', 'error');
    }
  }

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(lastInviteLink);
      showToast('Invite link copied!', 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 64 }}><div className="spinner" /></div>;
  }

  const logoSrc = workspace?.logoData || null;

  return (
    <div>
      <div className="page-header">
        <h1>Workspace Settings</h1>
      </div>

      {/* Pending Deletions */}
      {pendingDeletions.length > 0 && (
        <div className="admin-section">
          <h3>Pending Deletions ({pendingDeletions.length})</h3>
          {pendingDeletions.map((app) => (
            <div key={app.id} className="member-row">
              <div className="member-info">
                <span className="member-name">{app.icon} {app.name}</span>
                <span className="member-email">
                  Uploaded by {app.uploadedBy}{app.requestedBy ? ` · Deletion requested by ${app.requestedBy}` : ''}
                </span>
              </div>
              <div className="member-actions">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={async () => {
                    try {
                      await api.approveDeletion(app.id);
                      setPendingDeletions(pendingDeletions.filter(a => a.id !== app.id));
                      showToast(`${app.name} deleted`, 'success');
                    } catch (err) { showToast(err.error || 'Failed', 'error'); }
                  }}
                >
                  Approve
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={async () => {
                    try {
                      await api.rejectDeletion(app.id);
                      setPendingDeletions(pendingDeletions.filter(a => a.id !== app.id));
                      showToast(`Deletion of ${app.name} rejected`, 'info');
                    } catch (err) { showToast(err.error || 'Failed', 'error'); }
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Branding */}
      <div className="admin-section">
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
                {logoSrc && (
                  <img src={logoSrc} alt="Logo" style={{ height: 40, borderRadius: 4 }} />
                )}
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

            <button type="submit" className="btn btn-primary">Save branding</button>
          </form>
        </div>
      </div>

      {/* Invite Members */}
      <div className="admin-section">
        <h3>Invite Members</h3>
        <div className="card">
          <form className="invite-form" onSubmit={handleInvite}>
            <input
              className="input"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              required
            />
            <button type="submit" className="btn btn-primary">Invite</button>
          </form>

          {lastInviteLink && (
            <div className="invite-link">
              <span style={{ flex: 1, fontSize: 12 }}>{lastInviteLink}</span>
              <button className="btn btn-secondary btn-sm" onClick={copyInviteLink}>Copy</button>
            </div>
          )}

          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
            Share the invite link with your team member. They'll use it to register and join your workspace.
          </p>

          {invitations.filter(i => !i.accepted).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <label className="label">Pending Invitations</label>
              {invitations.filter(i => !i.accepted).map((inv) => (
                <div key={inv.id} className="member-row">
                  <div className="member-info">
                    <span className="member-email">{inv.email}</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleRevokeInvite(inv.id)}>
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="admin-section">
        <h3>Members ({members.filter(m => m.isActive).length})</h3>
        {members.filter(m => m.isActive).map((member) => (
          <div key={member.id} className="member-row">
            <div className="member-info">
              <span className="member-name">{member.displayName}</span>
              <span className="member-email">{member.email}</span>
            </div>
            <div className="member-actions">
              <span className={`role-badge ${member.role}`}>{member.role}</span>
              {member.id !== user.id && (
                <>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleRoleChange(member.id, member.role === 'admin' ? 'member' : 'admin')}
                  >
                    {member.role === 'admin' ? 'Demote' : 'Make admin'}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {ToastElement}
    </div>
  );
}
