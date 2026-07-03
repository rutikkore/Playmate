# PlayMate: Sports Turf & Play Area Booking Platform

PlayMate is a premium, modern sports turf and play area booking platform. It features a stunning glassmorphic design, smooth animations, and a dual-role interface that allows users to experience the platform as either a **Player** (booking slots & joining matches) or a **Provider** (managing venues, slots, and bookings).

This repository is structured as a **Monorepo** using npm workspaces.

---

## 🏗️ Architecture

For complete details on system design, database architecture, and authentication sequence flows, please refer to the documents in the [docs/](file:///Users/rutikmanishkore/Documents/Playmate/docs) directory:
- [System Architecture](file:///Users/rutikmanishkore/Documents/Playmate/docs/ARCHITECTURE.md)
- [Project Overview](file:///Users/rutikmanishkore/Documents/Playmate/docs/PROJECT_OVERVIEW.md)
- [Project Roadmap](file:///Users/rutikmanishkore/Documents/Playmate/docs/PROJECT_ROADMAP.md)

- **Frontend:** React SPA built with Vite, TypeScript, and Tailwind CSS (located in [frontend/](file:///Users/rutikmanishkore/Documents/Playmate/frontend)).
- **Backend:** Node.js/Express API service with TypeScript (located in [backend/](file:///Users/rutikmanishkore/Documents/Playmate/backend)).
- **Database:** PostgreSQL hosted on Neon Cloud, interfaced through Prisma ORM.
- **Authentication:** Firebase Authentication handles identity validations, with verified profile records synchronized in PostgreSQL.

---

## 📁 Repository Structure

```text
Playmate/
├── frontend/             # React SPA (Vite + TS + Tailwind)
│   ├── src/              # Application source code
│   ├── public/           # Static assets
│   ├── .env.example      # Frontend environment template
│   └── package.json      # Frontend package configuration
│
├── backend/              # Express API Server (Node + TS + Prisma)
│   ├── src/              # Backend routes, controllers, and models
│   ├── prisma/           # Database schema and migrations
│   ├── .env.example      # Backend environment template
│   └── package.json      # Backend package configuration
│
├── packages/             # Shared workspaces
│   └── shared/           # Common code, schemas, and helpers
│
├── docs/                 # Documentation and design architecture files
│
├── scripts/              # Infrastructure and build automation scripts
│
├── .github/              # CI/CD workflows and settings
│
├── package.json          # Root workspace configuration
└── README.md             # Monorepo documentation
```

---

## 🚀 Installation & Setup

To run this project locally, ensure you have **Node.js (v18+)** and **npm** installed.

### 1. Install Workspace Dependencies
Run the command below at the root directory to install dependencies and link workspaces:
```bash
npm install
```

### 2. Configure Environment Files

1. Create a `frontend/.env` file from the [frontend/.env.example](file:///Users/rutikmanishkore/Documents/Playmate/frontend/.env.example) template:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   Fill in your Firebase client config parameters.

2. Create a `backend/.env` file from the [backend/.env.example](file:///Users/rutikmanishkore/Documents/Playmate/backend/.env.example) template:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Fill in your PostgreSQL `DATABASE_URL` and Firebase Admin SDK credentials.

### 3. Setup Database Migrations
Run Prisma migrations for the database schema:
```bash
npm run prisma:migrate -w playmate-backend
```

---

## 💻 Available Scripts

You can run workspace commands directly from the monorepo root:

### Development Servers

- **Start Both Frontend and Backend Concurrently:**
  ```bash
  npm run dev
  ```
- **Start Backend Only:**
  ```bash
  npm run dev:backend
  ```
- **Start Frontend Only:**
  ```bash
  npm run dev:frontend
  ```

### Production Build

- **Build Both Workspaces:**
  ```bash
  npm run build
  ```
- **Build Frontend Only:**
  ```bash
  npm run build:frontend
  ```
- **Build Backend Only:**
  ```bash
  npm run build:backend
  ```

### Code Quality & Testing

- **Lint Check Frontend:**
  ```bash
  npm run lint
  ```

---

## 🔒 Security Notes
Environment files (`.env`) must **never** be committed. They are globally ignored via the root `.gitignore`. Always use `.env.example` templates to document new environment configuration keys.
