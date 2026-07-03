# System Architecture: PlayMate

This document outlines the technical design, stack, and flows for the PlayMate project.

## 🏗️ Overall Architecture

PlayMate is structured as a decoupled Client-Server architecture. The frontend React application communicates with the Node.js Express backend service via API requests.

```mermaid
graph TD
  A[React Frontend] -->|HTTP Request / API| B[Express Backend]
  A -->|Token Request| C[Firebase Auth Server]
  B -->|Verify Token| C
  B -->|Queries / Mutations| D[Neon PostgreSQL]
```

---

## 💻 Technology Stack

### Frontend
- **Framework:** React (Vite, TypeScript)
- **Styling:** Tailwind CSS
- **State & Data Fetching:** React Query
- **Authentication:** Firebase Client SDK

### Backend
- **Framework:** Node.js, Express, TypeScript (configured for ES Modules)
- **Database:** Neon PostgreSQL (Cloud-based PostgreSQL)
- **ORM:** Prisma
- **Auth Verification:** Firebase Admin SDK

---

## 🔑 Authentication Flow

All authentication state is managed securely. Firebase handles sign-in credential verification, and Neon PostgreSQL serves as the primary application source of truth.

```mermaid
sequenceDiagram
  autonumber
  participant F as React Frontend
  participant FB as Firebase Auth
  participant B as Express Backend
  participant DB as Neon PostgreSQL

  F->>FB: Login / Signup (Email/Google)
  FB-->>F: Return Firebase ID Token
  F->>B: Send ID Token (Auth header / POST body)
  B->>FB: Verify Token using Firebase Admin SDK
  FB-->>B: Return Decoded User Claims (uid, email, name)
  B->>DB: Upsert User profile (using cuid() and Role Enum)
  DB-->>B: User Profile stored
  B-->>F: Return authenticated database profile
  F->>F: Save user state and render dashboards
```

---

## 📁 Directory Structure

```text
Playmate/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Prisma configuration and database models
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts          # Prisma Client setup
│   │   │   └── firebase.ts    # Firebase Admin SDK setup
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts  # Token validation middleware
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── user.service.ts
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── src/                       # Frontend Source Directory
│   ├── config/
│   │   └── firebase.ts        # Firebase Client SDK
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Session & token management
│   │   └── RoleContext.tsx    # Active UI role management
│   ├── services/
│   │   ├── api.ts             # Axios client with interceptors
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   └── App.tsx
```
