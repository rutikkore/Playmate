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
- Review features
- Push code to GitHub
- Manage project direction

---

## ChatGPT

Role:
Technical Lead & Software Architect

Responsibilities:

- Design project architecture
- Review Claude's plans
- Review implementations
- Generate precise Antigravity prompts
- Help debug problems
- Decide milestone completion
- Maintain software quality
- Prevent technical debt

---

## Claude

Role:
Solution Architect

Responsibilities:

- Inspect the repository
- Plan each milestone
- Suggest architecture
- Design database schema
- Recommend APIs
- Recommend folder structures

Claude does NOT implement large features.

---

## Antigravity

Role:
Senior Full Stack Developer

Responsibilities:

- Implement milestones
- Modify code
- Fix bugs
- Update documentation
- Generate production-ready code

---

# Development Rules

These rules apply throughout the entire project.

## UI

Never redesign the frontend.

Never replace components unnecessarily.

Never change animations.

Never remove visual effects.

Always preserve the existing design language.

---

## Development

Implement one milestone at a time.

Never implement future milestones.

Finish one milestone completely before starting another.

Every milestone must pass testing.

---

## Testing

Every milestone must satisfy:

- Builds successfully
- No TypeScript errors
- No console errors
- No runtime errors
- No broken UI
- Backend healthy
- Database working
- Authentication working (where applicable)

---

## Git Workflow

For every milestone:

Create feature branch

Implement

Test

Commit

Push

Review

Merge

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

Firebase Authentication

↓

Axios API Layer

↓

Express Backend

↓

Prisma ORM

↓

Neon PostgreSQL

---

# Current Folder Philosophy

Frontend and backend remain separated.

Backend follows feature-based architecture.

Frontend uses service layer abstraction.

Authentication is isolated inside AuthContext.

Role management remains inside RoleContext.

---

# Milestones

## Milestone 1

Foundation & Authentication

Status:

✅ Completed

Features:

- Express Backend
- TypeScript Backend
- Neon PostgreSQL
- Prisma
- Firebase Authentication
- Google Login
- Email Login
- Protected Routes
- Axios API Layer
- AuthContext
- User synchronization
- User model
- Health endpoint
- CORS configuration

---

## Milestone 2

Database & Turf Management

Status:

⬜ Pending

Goal:

Replace fake turf data with PostgreSQL.

Models:

- Turf
- Sport
- AvailabilitySlot
- ProviderProfile
- Booking (schema only)
- HostedMatch (schema only)
- MatchParticipant (schema only)
- Review (schema only)
- Favourite

---

## Milestone 3

Booking System

Status:

⬜ Pending

---

## Milestone 4

Matchmaking

Status:

⬜ Pending

---

## Milestone 5

Payments

Status:

⬜ Pending

---

## Milestone 6

Maps

Status:

⬜ Pending

---

## Milestone 7

Realtime

Status:

⬜ Pending

---

## Milestone 8

Provider Analytics

Status:

⬜ Pending

---

## Milestone 9

Production Features

Status:

⬜ Pending

---

## Milestone 10

Deployment & Polish

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

---

# AI Collaboration Workflow

Step 1

ChatGPT decides milestone.

↓

Step 2

Claude inspects repository.

↓

Step 3

Claude generates implementation plan.

↓

Step 4

ChatGPT reviews architecture.

↓

Step 5

Antigravity implements only that milestone.

↓

Step 6

Testing.

↓

Step 7

Bug fixing.

↓

Step 8

Git commit.

↓

Step 9

Merge.

↓

Repeat.

---

# Important Rule

Never skip milestones.

Never implement multiple milestones together.

Never rewrite existing systems without reason.

Always inspect the current repository before making implementation decisions.

---

# Current Project State

Authentication system is production-ready.

Backend is connected to Neon PostgreSQL.

Firebase Authentication is working.

Google Login is working.

Email Login is working.

Protected Routes are working.

User synchronization with PostgreSQL is working.

Milestone 1 has been completed successfully.

The project is now ready to begin Milestone 2.