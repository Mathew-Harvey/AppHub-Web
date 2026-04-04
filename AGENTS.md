# AGENTS.md - AppHub Web (AI Agent Reference)

## Overview
AppHub-Web is a React 18 SPA (Single Page Application) for a team portal where users upload, share, and manage single-file HTML tools. Built with Vite, React Router 6, and custom CSS.

## Tech Stack
- **Framework**: React 18.3.1
- **Router**: React Router 6.26.2
- **Build**: Vite 5.4.8
- **Styling**: Custom CSS with CSS variables (no component library)
- **Language**: JavaScript/JSX (ES modules)

## Project Structure
```
src/
  App.jsx              - Router config, ErrorBoundary, ProtectedRoute/GuestRoute
  main.jsx             - React DOM entry point
  components/
    Layout.jsx         - Main layout wrapper (topbar, nav, footer, modals)
    Toast.jsx          - Toast notification system
    EasterEgg.jsx      - Hidden easter egg
    InviteModal.jsx    - Invite team members modal
    EditAppModal.jsx   - Edit app metadata modal
    PublishModal.jsx   - Publish AI-generated apps
    UpgradeModal.jsx   - Upgrade CTA with pricing
    OnboardingOverlay.jsx - First-time user tutorial
    EUAModal.jsx       - End User Agreement
    CodeErrorsModal.jsx - Display code errors
    IconPicker.jsx     - Emoji/icon picker
    TokenUsageMeter.jsx - AI token usage display
  contexts/
    AuthContext.jsx    - JWT auth state, user management
    BuilderContext.jsx - AI builder job polling
    ThemeContext.jsx   - Dark/light mode toggle
  hooks/
    usePlan.js         - Plan/subscription checks (isPaid, maxApps, hasAppBuilder, etc.)
  pages/
    DashboardPage.jsx  - Main app grid, folders, search, drag-and-drop
    UploadPage.jsx     - File upload, paste detection, AI conversion
    AppViewerPage.jsx  - Full-screen app viewer in sandboxed iframe
    AboutPage.jsx      - Info page about AppHub features
    HelpPage.jsx       - Comprehensive help documentation
    AdminPage.jsx      - Workspace settings, members, billing (also /settings route)
    BuilderSessionsPage.jsx - AI Builder sessions list
    BuilderNewPage.jsx - Multi-step AI app creation form
    BuilderWorkspacePage.jsx - Builder with live preview, revisions
    BuilderUpgradePage.jsx - Upgrade CTA for non-Pro users
    LoginPage.jsx      - Email-first login flow
    RegisterPage.jsx   - Account/workspace creation
    ForgotPasswordPage.jsx - Password reset request
    ResetPasswordPage.jsx  - Password reset with token
    EUAPage.jsx        - End User License Agreement
  styles/
    global.css         - All application styles (single file)
  utils/
    api.js             - Centralized API client (all endpoints)
    clipboard.js       - Copy to clipboard utility
    timeAgo.js         - Relative date formatting
    emojiData.js       - Emoji list for icon picker
```

## Routes
| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| / | DashboardPage | Yes | Main app grid with folders |
| /login | LoginPage | Guest | Login flow |
| /register | RegisterPage | Guest | Account creation |
| /forgot-password | ForgotPasswordPage | Guest | Request password reset |
| /reset-password | ResetPasswordPage | Guest | Reset with token |
| /upload | UploadPage | Yes | Upload/paste HTML apps |
| /app/:id | AppViewerPage | Yes | View app in iframe |
| /about | AboutPage | Yes | About AppHub |
| /help | HelpPage | Yes | Help documentation |
| /builder | BuilderSessionsPage | Yes | AI Builder sessions |
| /builder/new | BuilderNewPage | Yes | Create new AI app |
| /builder/:sessionId | BuilderWorkspacePage | Yes | Builder workspace |
| /builder/upgrade | BuilderUpgradePage | Yes | Upgrade CTA |
| /admin or /settings | AdminPage | Yes | Workspace settings |
| /eua | EUAPage | Yes | License agreement |
| /converter | Redirect to /upload | Yes | Legacy redirect |

## API Client (src/utils/api.js)
All API calls go through a centralized `api` object. Base URL is `{VITE_API_URL}/api`.

### Auth
- `api.register(body)` - POST /auth/register
- `api.login(body)` - POST /auth/login
- `api.logout()` - POST /auth/logout
- `api.me()` - GET /auth/me
- `api.checkEmail(email)` - POST /auth/check-email
- `api.acceptInvite(body)` - POST /auth/accept-invite
- `api.changePassword(body)` - POST /auth/change-password
- `api.requestReset(email)` - POST /auth/request-reset
- `api.resetPassword(token, newPassword)` - POST /auth/reset-password

### Apps
- `api.listApps()` - GET /apps
- `api.getApp(id)` - GET /apps/:id
- `api.uploadApp(formData)` - POST /apps/upload (FormData with 'file')
- `api.updateApp(id, body)` - PUT /apps/:id
- `api.updateAppFile(id, formData)` - PUT /apps/:id/file
- `api.deleteApp(id)` - DELETE /apps/:id
- `api.reorderApps(appIds)` - PUT /apps/reorder
- `api.downloadSource(id)` - GET /apps/:id/source (returns { html, filename })
- `api.startConvert(formData)` - POST /apps/convert
- `api.pollConvert(jobId)` - GET /apps/convert/:jobId
- `api.checkFile(filename)` - POST /apps/check
- `api.getStats()` - GET /apps/stats

### Folders
- `api.listFolders()` - GET /folders
- `api.createFolder(body)` - POST /folders
- `api.updateFolder(id, body)` - PUT /folders/:id
- `api.deleteFolder(id)` - DELETE /folders/:id
- `api.addAppToFolder(folderId, appId)` - POST /folders/:id/apps
- `api.removeAppFromFolder(folderId, appId)` - DELETE /folders/:id/apps/:appId
- `api.saveFolderLayout(folders)` - PUT /folders/layout

### Workspace
- `api.getWorkspace()` - GET /workspace
- `api.updateWorkspace(body)` - PUT /workspace
- `api.uploadLogo(formData)` - POST /workspace/logo
- `api.getMembers()` - GET /workspace/members
- `api.invite(email)` - POST /workspace/invite
- `api.getInvitations()` - GET /workspace/invitations
- `api.revokeInvite(id)` - DELETE /workspace/invite/:id

### Subscription
- `api.getSubscriptionStatus()` - GET /subscription/status
- `api.createCheckout()` - POST /subscription/checkout
- `api.createPortal()` - POST /subscription/portal

### AI Builder
- `api.builderUsage()` - GET /builder/usage
- `api.builderSessions()` - GET /builder/sessions
- `api.builderCreateSession(body)` - POST /builder/sessions
- `api.builderGetSession(id)` - GET /builder/sessions/:id
- `api.builderGenerate(id)` - POST /builder/sessions/:id/generate
- `api.builderRevise(id, feedback)` - POST /builder/sessions/:id/revise
- `api.builderPollJob(sessionId, jobId)` - GET /builder/sessions/:id/jobs/:jobId
- `api.builderPublish(id, body)` - POST /builder/sessions/:id/publish
- `api.builderDeleteSession(id)` - DELETE /builder/sessions/:id

## State Management
- **AuthContext**: User session, login/logout, workspace data
- **ThemeContext**: Dark/light mode (persisted in localStorage)
- **BuilderContext**: Background polling for AI builder jobs, completion notifications

## Key Patterns
1. **Authentication**: JWT in httpOnly cookies. All fetch calls use `credentials: 'include'`.
2. **Protected Routes**: ProtectedRoute component redirects to /login if not authenticated.
3. **Plan Gating**: `usePlan()` hook returns { isPaid, maxApps, hasAppBuilder, isInvitedMember, workspaceHasPaidPlan }.
4. **Async Jobs**: Builder and conversion jobs use polling (2-4 second intervals).
5. **File Upload**: Uses FormData, detected via `body instanceof FormData` to skip Content-Type header.
6. **Error Handling**: API errors throw with status code and error details attached to the Error object.
7. **Theming**: CSS custom properties on :root, toggled via data-theme attribute on document.

## Environment Variables
- `VITE_API_URL` - API server URL (blank for dev, Vite proxies /api to localhost:3001)

## Development
```bash
npm install
npm run dev     # Starts on localhost:5173, proxies API to :3001
npm run build   # Outputs to dist/
npm run preview # Preview production build
```

## Common Tasks for AI Agents
1. **Adding a new page**: Create in src/pages/, add route in App.jsx, optionally add nav link in Layout.jsx
2. **Adding API endpoint**: Add method to api object in src/utils/api.js
3. **Styling**: All CSS is in src/styles/global.css (no CSS modules or styled-components)
4. **Adding a modal**: Create component in src/components/, render conditionally with useState
5. **Plan-gated feature**: Use `usePlan()` hook to check plan level before showing UI
