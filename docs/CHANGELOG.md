# Changelog: Milestone 1

All notable changes made to the PlayMate project in Milestone 1 are logged here.

## [1.0.0] - 2026-07-03

### Added
- Created backend service directory using **ES Modules** and TypeScript.
- Set up **Prisma ORM** with Neon Cloud PostgreSQL connection configuration.
- Created `User` Prisma model with `cuid()` identifier and `Role` enum (`PLAYER`, `PROVIDER`).
- Implemented **Firebase Admin SDK** token verification middleware.
- Implemented backend routing and controllers for:
  - `POST /api/auth/register` (user signup/synchronization)
  - `POST /api/auth/login` (user login/synchronization)
  - `POST /api/auth/google` (Google authentication and registration)
  - `GET /api/users/me` (authenticated user profile retrieval)
  - `GET /api/health` (health check)
- Created client-side **Firebase Client SDK** initialization module.
- Added frontend Axios client configured with automatic authorization token injection and centralized 401 unauth redirect interceptors.
- Added dedicated `AuthContext` to manage Firebase session listening and database synchronization.
- Documented configuration requirements in `backend/.env.example` and `.env.example`.

### Modified
- Updated `src/contexts/RoleContext.tsx` to handle UI roles while delegating authentication states to `AuthContext`.
- Refactored `src/pages/Login.tsx` to use Firebase auth provider methods (email/password login, email/password registration, Google authentication popup login).
- Updated `src/components/layout/AppLayout.tsx` to enforce route protection.
- Registered `AuthProvider` inside `src/App.tsx`.
