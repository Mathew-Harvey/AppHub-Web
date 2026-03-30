// In dev: Vite proxy handles /api → localhost:3001, so no base URL needed.
// In production: VITE_API_URL points to the API service (e.g. https://apphub-api.onrender.com)
const API_HOST = import.meta.env.VITE_API_URL || '';
const API_BASE = `${API_HOST}/api`;

// Sandbox base for iframe src URLs
export const SANDBOX_BASE = API_HOST;

// Resolve asset URLs from the API (e.g. logo paths stored as /api/workspace/logo/:id)
export function resolveApiUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_HOST}${path}`;
}

async function request(url, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  };

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const res = await fetch(`${API_BASE}${url}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw { status: res.status, ...data };
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  // Apps
  listApps: () => request('/apps'),
  getApp: (id) => request(`/apps/${id}`),
  checkFile: (filename) => request('/apps/check', { method: 'POST', body: JSON.stringify({ filename }) }),
  uploadApp: (formData) => request('/apps/upload', { method: 'POST', body: formData }),
  updateApp: (id, body) => request(`/apps/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteApp: (id) => request(`/apps/${id}`, { method: 'DELETE' }),

  // Workspace
  getWorkspace: () => request('/workspace'),
  updateWorkspace: (body) => request('/workspace', { method: 'PUT', body: JSON.stringify(body) }),
  uploadLogo: (formData) => request('/workspace/logo', { method: 'POST', body: formData }),
  getMembers: () => request('/workspace/members'),
  invite: (email) => request('/workspace/invite', { method: 'POST', body: JSON.stringify({ email }) }),
  getInvitations: () => request('/workspace/invitations'),
  revokeInvite: (id) => request(`/workspace/invite/${id}`, { method: 'DELETE' }),
  changeRole: (id, role) => request(`/workspace/members/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  removeMember: (id) => request(`/workspace/members/${id}`, { method: 'DELETE' }),
};
