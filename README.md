# AppHub Web

Frontend for AppHub — a team portal for sharing vibe-coded HTML tools.

Backend: [AppHub-Api](https://github.com/Mathew-Harvey/AppHub-Api)

## Stack

React 18, Vite, React Router 6. No component library — clean CSS with custom properties for workspace theming.

## Local Development

```bash
# 1. Make sure AppHub-Api is running on localhost:3001 first

# 2. Clone and install
git clone https://github.com/Mathew-Harvey/AppHub-Web.git
cd AppHub-Web
npm install

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

Vite proxies `/api` and `/sandbox` to `localhost:3001` automatically in dev.

## Deploy to Render

1. Create a **Static Site** pointing to this repo
2. Build Command: `npm install && npm run build`
3. Publish Directory: `dist`
4. Add environment variable: `VITE_API_URL=https://YOUR-APPHUB-API.onrender.com`
5. Add rewrite rule: `/* → /index.html` (status 200) for SPA routing

### Important: VITE_API_URL

This is a **build-time** variable. Vite bakes it into the JavaScript bundle at build time. If you change it, you need to trigger a redeploy/rebuild of the static site.

- **Local dev:** Leave it blank — Vite proxy handles everything
- **Production:** Set to your AppHub-Api Render URL (no trailing slash, no `/api` suffix)
  - Example: `VITE_API_URL=https://apphub-api.onrender.com`

## Architecture

The app is a standard React SPA. Key patterns:

- `src/utils/api.js` — All API calls go through here. `VITE_API_URL` is resolved once at import time. Every fetch uses `credentials: 'include'` for cross-origin cookies.
- `src/contexts/AuthContext.jsx` — JWT auth state. Checks `/api/auth/me` on mount.
- `src/components/Layout.jsx` — Top bar with workspace branding (logo, name, colors from CSS custom properties).
- `src/pages/DashboardPage.jsx` — Phone-style app grid.
- `src/pages/UploadPage.jsx` — Drag-and-drop upload with file type detection and conversion prompts.
- `src/pages/AppViewerPage.jsx` — Fullscreen sandboxed iframe. The iframe `src` points to `{SANDBOX_BASE}/sandbox/:appId` on the API service.
- `src/pages/AdminPage.jsx` — Workspace branding, member management, invitations.
