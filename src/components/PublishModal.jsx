import { useState } from 'react';
import { api } from '../utils/api';
import IconPicker from './IconPicker';

const VISIBILITY_OPTIONS = [
  { value: 'team', label: 'Team', desc: 'Everyone in your workspace' },
  { value: 'private', label: 'Private', desc: 'Only you' },
  { value: 'specific', label: 'Specific people', desc: 'Choose who can see it' },
  { value: 'public', label: 'Public', desc: 'Listed in the marketplace for all users' },
];

export default function PublishModal({ session, onClose, onPublished }) {
  const [name, setName] = useState(session.name || '');
  const [description, setDescription] = useState(session.description || '');
  const [icon, setIcon] = useState('🤖');
  const [visibility, setVisibility] = useState('team');
  const [sharedWith, setSharedWith] = useState([]);
  const [members, setMembers] = useState([]);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [marketplaceCategory, setMarketplaceCategory] = useState('');
  const [marketplaceTags, setMarketplaceTags] = useState('');

  async function loadMembers() {
    if (membersLoaded) return;
    try {
      const data = await api.getMembers();
      setMembers(data.members || []);
      setMembersLoaded(true);
    } catch { /* non-critical */ }
  }

  function handleVisChange(val) {
    setVisibility(val);
    if (val === 'specific' && !membersLoaded) loadMembers();
    if (val === 'public' && categories.length === 0) {
      api.getMarketplaceCategories().then(data => setCategories(data.categories)).catch(() => {});
    }
  }

  function toggleMember(id) {
    setSharedWith(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  async function handlePublish() {
    if (!name.trim()) { setError('Name is required'); return; }
    setPublishing(true);
    setError('');
    try {
      const body = { name: name.trim(), description: description.trim(), icon, visibility };
      if (visibility === 'specific') body.sharedWith = sharedWith;
      if (visibility === 'public') {
        if (marketplaceCategory) body.marketplaceCategory = marketplaceCategory;
        if (marketplaceTags.trim()) body.marketplaceTags = marketplaceTags.split(',').map(t => t.trim()).filter(Boolean);
      }
      await api.builderPublish(session.id, body);
      onPublished();
    } catch (err) {
      setError(err.message || 'Failed to publish');
      setPublishing(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal publish-modal" onClick={e => e.stopPropagation()}>
        <h2 className="publish-modal-title">Publish to AppHub</h2>

        <div className="form-group">
          <label className="label">App Name</label>
          <input
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={100}
            placeholder="My Awesome App"
          />
        </div>

        <div className="form-group">
          <label className="label">Description</label>
          <textarea
            className="input"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="What does this app do?"
          />
        </div>

        <div className="form-group">
          <label className="label">Icon</label>
          <div className="publish-icon-row">
            <button
              type="button"
              className="publish-icon-btn"
              onClick={() => setShowIconPicker(!showIconPicker)}
            >
              <span className="publish-icon-preview">{icon}</span>
              <span>Change icon</span>
            </button>
          </div>
          {showIconPicker && (
            <div className="publish-icon-picker-wrap">
              <IconPicker value={icon} onChange={v => { setIcon(v); setShowIconPicker(false); }} appName={name} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="label">Visibility</label>
          <div className="publish-vis-options">
            {VISIBILITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`publish-vis-option ${visibility === opt.value ? 'active' : ''}`}
                onClick={() => handleVisChange(opt.value)}
              >
                <strong>{opt.label}</strong>
                <span>{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {visibility === 'specific' && (
          <div className="form-group">
            <label className="label">Share with</label>
            <div className="publish-members-list">
              {members.length === 0 && <span className="text-muted">Loading members...</span>}
              {members.map(m => (
                <label key={m.id} className="publish-member-row">
                  <input
                    type="checkbox"
                    checked={sharedWith.includes(m.id)}
                    onChange={() => toggleMember(m.id)}
                  />
                  <span>{m.displayName || m.email}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {visibility === 'public' && (
          <>
            <div className="form-group">
              <label className="label">Category</label>
              <select
                className="input"
                value={marketplaceCategory}
                onChange={e => setMarketplaceCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Tags <span className="text-muted">(comma-separated)</span></label>
              <input
                className="input"
                value={marketplaceTags}
                onChange={e => setMarketplaceTags(e.target.value)}
                placeholder="e.g. calculator, finance, tools"
              />
            </div>
            <div className="publish-public-notice">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="8" cy="8" r="7" />
                <line x1="8" y1="7" x2="8" y2="11" />
                <circle cx="8" cy="5" r="0.5" fill="currentColor" />
              </svg>
              <span>Your workspace name will be shown as the publisher. You can unpublish anytime by changing visibility.</span>
            </div>
          </>
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="publish-modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={publishing}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handlePublish} disabled={publishing}>
            {publishing ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
