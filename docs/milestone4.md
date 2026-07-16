# Milestone 4 – Matchmaking System

## Status

⬜ Planned

---

# Objective

Build a complete matchmaking system that allows players to create public games, discover nearby games, join existing matches, manage participants, and automatically close games when full.

The matchmaking system should integrate seamlessly with the existing booking system completed in Milestone 3.

---

# Goals

- Create public games
- Join existing games
- Leave games
- Manage participants
- Auto-close full matches
- Prevent duplicate joins
- Restrict capacity
- Display live participant counts
- Connect matches with booked turfs
- Build production-ready APIs
- Maintain scalable architecture

---

# Scope

## Backend

### Database

Create new models:

- Match
- MatchParticipant

Create enums:

- MatchStatus
  - OPEN
  - FULL
  - IN_PROGRESS
  - COMPLETED
  - CANCELLED

- SkillLevel
  - BEGINNER
  - INTERMEDIATE
  - ADVANCED
  - MIXED

Relationships:

User
↓

MatchParticipant

↓

Match

↓

Booking

A match should always belong to an existing booking.

---

### Services

Create:

match.service.ts

Responsibilities

- Create Match
- Join Match
- Leave Match
- Cancel Match
- Close Match
- Get Match Details
- List Public Matches

---

### Controllers

match.controller.ts

Endpoints

GET /matches

GET /matches/:id

POST /matches

POST /matches/:id/join

DELETE /matches/:id/leave

PATCH /matches/:id/cancel

PATCH /matches/:id/start

PATCH /matches/:id/complete

---

### Validation

Prevent

- Joining own match twice
- Joining cancelled match
- Joining completed match
- Joining full match
- Joining without authentication

Automatically

- Update participant count
- Update status to FULL
- Reopen when someone leaves

---

# Frontend

Player Features

Create Match

Player selects

- Booking
- Sport
- Skill Level
- Number of Players
- Notes

Join Match

Players can

- Browse matches
- Filter by sport
- Filter by skill
- Filter by location
- Join game

Leave Match

Allow leaving before match starts.

Match Details

Display

- Turf
- Date
- Time
- Host
- Participants
- Slots remaining
- Skill Level
- Status

---

# Pages

Update

Matchmaking.tsx

Create

MatchDetails.tsx

CreateMatchDialog.tsx

JoinMatchDialog.tsx

ParticipantList.tsx

MatchCard.tsx

---

# React Query

Queries

useMatches()

useMatch()

Mutations

useCreateMatch()

useJoinMatch()

useLeaveMatch()

useCancelMatch()

---

# Database Changes

New Tables

Match

MatchParticipant

New Enums

MatchStatus

SkillLevel

Indexes

bookingId

hostId

status

sportId

---

# Business Rules

A booking can create only one match.

Host automatically becomes first participant.

Host cannot leave without cancelling.

Maximum participants cannot be exceeded.

Cancelled matches cannot accept joins.

Completed matches become read-only.

---

# Testing Checklist

Backend

□ Create Match

□ Join Match

□ Leave Match

□ Prevent duplicate joins

□ Prevent over-capacity

□ Auto FULL status

□ Auto OPEN status after leave

□ Cancel Match

□ Complete Match

□ Database integrity

Frontend

□ Match list loads

□ Filters work

□ Create dialog works

□ Join dialog works

□ Participant count updates

□ Status badges update

□ Loading states

□ Error messages

Manual Testing

□ Player books a turf

□ Player creates match

□ Second player joins

□ Match reaches capacity

□ Status changes to FULL

□ Player leaves

□ Status becomes OPEN

□ Host cancels match

□ Match disappears from public list

---

# Deliverables

Backend

✅ Match APIs

✅ Match Service

✅ Controllers

✅ Prisma Models

✅ Migrations

Frontend

✅ Matchmaking Page

✅ Match Cards

✅ Create Match Dialog

✅ Join Match Flow

✅ Participant List

Testing

✅ Manual Testing

✅ API Testing

✅ Database Validation

---

Milestone Completion Criteria

- No TypeScript errors
- No Prisma errors
- No runtime errors
- No duplicate participants
- Match capacity enforced
- Booking integration working
- All APIs tested
- Frontend connected to backend
- Git committed and pushed

Status

⬜ Ready for Implementation