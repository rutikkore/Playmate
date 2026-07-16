# PlayMate - Project Context

## Project Vision

PlayMate is a production-grade full-stack sports venue booking platform designed to showcase real-world software engineering skills.

The goal is to build a scalable SaaS application that can eventually be used by real sports turf owners while also serving as my flagship portfolio project for internships, placements, freelance clients, and hackathons.

This project is intentionally being built using professional software engineering practices instead of AI-generated code.

---

# Development Workflow

The project is built using four collaborators.

## Me (Rutik)

Role:
- Product Owner
- QA Tester
- Decision Maker

Responsibilities:
- Test every milestone
- Review every completed feature
- Push code to GitHub
- Manage project direction
- Perform manual testing before milestone approval

---

## ChatGPT

Role:
Technical Lead & Software Architect

Responsibilities:

- Design project architecture
- Review Claude's architecture plans
- Review Antigravity implementations
- Generate implementation prompts
- Help debug problems
- Decide milestone completion
- Maintain software quality
- Prevent technical debt
- Ensure scalability

---

## Claude

Role:
Solution Architect

Responsibilities:

- Inspect the repository
- Analyze current implementation
- Plan one milestone at a time
- Design database schema
- Recommend APIs
- Recommend folder structures
- Suggest scalable architecture

Claude does NOT implement large features.

---

## Antigravity

Role:
Senior Full Stack Developer

Responsibilities:

- Implement approved milestone
- Modify code
- Fix bugs
- Update documentation
- Generate production-ready code
- Follow approved architecture only

---

# Development Rules

## UI

Never redesign the frontend.

Never replace components unnecessarily.

Never remove animations.

Never remove visual effects.

Always preserve the existing design language.

---

## Development

Implement ONE milestone at a time.

Never implement future milestones.

Never rewrite completed systems unnecessarily.

Every milestone must pass testing before moving forward.

---

## Testing

Every milestone must satisfy:

- Builds successfully
- No TypeScript errors
- No Prisma errors
- No runtime errors
- No console errors
- No broken UI
- Backend healthy
- Database healthy
- Authentication working
- Manual testing completed

---

## Git Workflow

For every milestone:

Create feature branch

↓

Implement

↓

Test

↓

Commit

↓

Push

↓

Review

↓

Merge into main

---

# Technology Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Query
- Framer Motion
- Three.js

---

## Backend

- Node.js
- Express
- TypeScript

---

## Database

- Neon PostgreSQL

- Prisma ORM

---

## Authentication

- Firebase Authentication
- Firebase Admin SDK

Firebase is ONLY used for identity.

PostgreSQL is the source of truth for application data.

---

## Future Integrations

- Google Maps
- Razorpay
- Cloudinary
- Socket.io
- Resend Email
- AI Recommendations

---

# Project Architecture

Frontend

↓

React Query

↓

Axios API Layer

↓

Express Backend

↓

Service Layer

↓

Prisma ORM

↓

Neon PostgreSQL

---

# Current Folder Philosophy

Frontend and backend remain separated.

Backend follows feature-based architecture.

Frontend uses service layer abstraction.

Authentication remains isolated inside AuthContext.

Role management remains inside RoleContext.

Business logic belongs inside services.

Controllers remain thin.

---

# Milestones

## Milestone 1

### Foundation & Authentication

Status:

✅ Completed

Features:

- Express Backend
- TypeScript Backend
- Prisma ORM
- Neon PostgreSQL
- Firebase Authentication
- Google Login
- Email Login
- Protected Routes
- Axios API Layer
- AuthContext
- User Synchronization
- User Model
- Health Endpoint
- CORS Configuration

---

## Milestone 2

### Database & Turf Management

Status:

✅ Completed

Features:

- Production Prisma Schema
- Sport Model
- ProviderProfile Model
- Turf Model
- TurfSport Model
- AvailabilitySlot Model
- Favourite Model
- Placeholder Models for Future Milestones
- Prisma Migration
- Seed Script
- Feature-based Backend Architecture
- Turf CRUD APIs
- Sports APIs
- Provider Profile APIs
- Availability APIs
- Favourite APIs
- Soft Delete Support
- React Query Integration
- Frontend connected to PostgreSQL
- Fake Turf Data replaced with Database

---

## Milestone 3

### Booking System

Status:

⬜ Pending

Goal:

Build a complete production-ready booking system.

Focus Areas:

- Slot Booking
- Booking Validation
- Prevent Double Booking
- Booking History
- Booking Status
- Provider Booking Management
- Transaction-safe Booking Flow

---

## Milestone 4

### Matchmaking

Status:

⬜ Pending

---

## Milestone 5

### Payments

Status:

⬜ Pending

---

## Milestone 6

### Maps

Status:

⬜ Pending

---

## Milestone 7

### Realtime

Status:

⬜ Pending

---

## Milestone 8

### Provider Analytics

Status:

⬜ Pending

---

## Milestone 9

### Production Features

Status:

⬜ Pending

---

## Milestone 10

### Deployment & Polish

Status:

⬜ Pending

---

# Coding Standards

Use TypeScript everywhere.

Use Prisma ORM.

Avoid duplicate logic.

Prefer reusable components.

Prefer service layer abstraction.

Never hardcode secrets.

Always use environment variables.

Write scalable code.

Use meaningful names.

Document major architecture changes.

Keep controllers thin.

Business logic belongs in services.

---

# AI Collaboration Workflow

Step 1

ChatGPT decides the milestone scope.

↓

Step 2

Claude inspects the repository.

↓

Step 3

Claude designs the architecture.

↓

Step 4

ChatGPT reviews and improves the architecture.

↓

Step 5

Antigravity implements ONLY the approved milestone.

↓

Step 6

Manual testing.

↓

Step 7

Bug fixing.

↓

Step 8

Git Commit.

↓

Step 9

Merge into main.

↓

Repeat.

---

# Important Rules

Never skip milestones.

Never implement multiple milestones together.

Never rewrite existing systems without reason.

Always inspect the repository before making implementation decisions.

Always preserve completed functionality.

---

# Current Project State

Milestone 1 has been completed successfully.

Milestone 2 has been completed successfully.

Current System Capabilities:

✅ Firebase Authentication

✅ Google Login

✅ Email Login

✅ User Synchronization

✅ PostgreSQL Integration

✅ Prisma ORM

✅ Sports Management

✅ Turf Management

✅ Provider Profiles

✅ Availability Management

✅ Favourite Infrastructure

✅ REST APIs

✅ React Query Integration

The application now uses PostgreSQL as the source of truth for sports, turfs, provider profiles, and availability data.

The project is now ready to begin **Milestone 3 – Booking System**.

Known Product Improvements (Future Milestones):

- Provider onboarding workflow instead of instant role switching.
- Real reviews and ratings.
- Dynamic slot pricing.
- Production notifications.
- Admin verification workflow.