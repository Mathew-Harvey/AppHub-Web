const API_HOST = import.meta.env.VITE_API_URL || '';
const API_BASE = `${API_HOST}/api`;

export const SANDBOX_BASE = API_HOST;

async function request(url, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  };

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
  changePassword: (body) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  requestReset: (email) => request('/auth/request-reset', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, newPassword) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),
  adminReset: (userId) => request('/auth/admin-reset', { method: 'POST', body: JSON.stringify({ userId }) }),

  // Apps
  listApps: () => request('/apps'),
  getStats: () => request('/apps/stats'),
  getApp: (id) => request(`/apps/${id}`),
  checkFile: (filename) => request('/apps/check', { method: 'POST', body: JSON.stringify({ filename }) }),
  uploadApp: (formData) => request('/apps/upload', { method: 'POST', body: formData }),
  updateApp: (id, body) => request(`/apps/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  updateAppFile: (id, formData) => request(`/apps/${id}/file`, { method: 'PUT', body: formData }),
  reorderApps: (appIds) => request('/apps/reorder', { method: 'PUT', body: JSON.stringify({ appIds }) }),
  startConvert: (formData) => request('/apps/convert', { method: 'POST', body: formData }),
  pollConvert: (jobId) => request(`/apps/convert/${jobId}`),
  deleteApp: (id) => request(`/apps/${id}`, { method: 'DELETE' }),
  getPendingDeletions: () => request('/apps/pending-deletions'),
  approveDeletion: (id) => request(`/apps/${id}/approve-deletion`, { method: 'POST' }),
  rejectDeletion: (id) => request(`/apps/${id}/reject-deletion`, { method: 'POST' }),
  dismissDemos: () => request('/apps/dismiss-demos', { method: 'POST' }),

  // Folders
  listFolders: () => request('/folders'),
  createFolder: (body) => request('/folders', { method: 'POST', body: JSON.stringify(body) }),
  updateFolder: (id, body) => request(`/folders/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteFolder: (id) => request(`/folders/${id}`, { method: 'DELETE' }),
  addAppToFolder: (folderId, appId) => request(`/folders/${folderId}/apps`, { method: 'POST', body: JSON.stringify({ appId }) }),
  removeAppFromFolder: (folderId, appId) => request(`/folders/${folderId}/apps/${appId}`, { method: 'DELETE' }),
  saveFolderLayout: (folders) => request('/folders/layout', { method: 'PUT', body: JSON.stringify({ folders }) }),

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

  // Subscription
  getSubscriptionStatus: () => request('/subscription/status'),
  createCheckout: () => request('/subscription/checkout', { method: 'POST' }),
  createPortal: () => request('/subscription/portal', { method: 'POST' }),
};
