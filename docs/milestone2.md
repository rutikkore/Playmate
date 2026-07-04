# Milestone 2 Implementation Summary: Database & Turf Management

This document provides a comprehensive implementation summary for Milestone 2, detailing all file changes, migrations, APIs, integrations, limitations, technical debt, and future improvements.

---

## 📁 1. Files Created

### Database & Seed
- `backend/prisma/migrations/20260704085550_init_milestone_2/migration.sql` (Prisma migration script)
- [seed.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/prisma/seed.ts) (Seeding script for Sports, ProviderProfile, Turfs, and AvailabilitySlots)

### Backend Feature Components
- [role.middleware.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/middleware/role.middleware.ts) (DB Role check middleware)
- [sport.service.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/services/sport.service.ts)
- [sport.controller.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/controllers/sport.controller.ts)
- [sport.routes.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/routes/sport.routes.ts)
- [provider.service.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/services/provider.service.ts)
- [provider.controller.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/controllers/provider.controller.ts)
- [provider.routes.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/routes/provider.routes.ts)
- [turf.service.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/services/turf.service.ts)
- [turf.controller.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/controllers/turf.controller.ts)
- [turf.routes.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/routes/turf.routes.ts)
- [availability.service.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/services/availability.service.ts)
- [availability.controller.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/controllers/availability.controller.ts)
- [availability.routes.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/routes/availability.routes.ts)
- [favourite.service.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/services/favourite.service.ts)
- [favourite.controller.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/controllers/favourite.controller.ts)
- [favourite.routes.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/routes/favourite.routes.ts)

### Frontend Services
- [turf.service.ts](file:///Users/rutikmanishkore/Documents/Playmate/frontend/src/services/turf.service.ts) (Service methods for API calls)

---

## 📝 2. Files Modified

### Database
- [schema.prisma](file:///Users/rutikmanishkore/Documents/Playmate/backend/prisma/schema.prisma) (Added full relational model definitions)
- [package.json](file:///Users/rutikmanishkore/Documents/Playmate/backend/package.json) (Added prisma seed command configuration)

### Backend
- [app.ts](file:///Users/rutikmanishkore/Documents/Playmate/backend/src/app.ts) (Mounted new routes under `/api/*`)

### Frontend
- [utils.ts](file:///Users/rutikmanishkore/Documents/Playmate/frontend/src/lib/utils.ts) (Added helper to resolve image assets dynamically)
- [TurfCard.tsx](file:///Users/rutikmanishkore/Documents/Playmate/frontend/src/components/TurfCard.tsx) (Updated parameters and routing link paths)
- [TurfDiscovery.tsx](file:///Users/rutikmanishkore/Documents/Playmate/frontend/src/pages/TurfDiscovery.tsx) (Replaced mock data with Sports & Turf search/discovery query hook)
- [PlayerDashboard.tsx](file:///Users/rutikmanishkore/Documents/Playmate/frontend/src/pages/PlayerDashboard.tsx) (Fetched recommended turfs dynamically from DB)
- [BookingCalendar.tsx](file:///Users/rutikmanishkore/Documents/Playmate/frontend/src/pages/BookingCalendar.tsx) (Synced calendar availability checks and UI states)
- [ProviderTurfs.tsx](file:///Users/rutikmanishkore/Documents/Playmate/frontend/src/pages/ProviderTurfs.tsx) (Connected provider turfs list, creation, editing and deletion endpoints)
- [ProviderSlots.tsx](file:///Users/rutikmanishkore/Documents/Playmate/frontend/src/pages/ProviderSlots.tsx) (Connected provider slots selection and toggle blocks)

---

## 🗄️ 3. Database Migration Summary

### Migration `20260704085550_init_milestone_2`
- **Enums Created**:
  - `VerificationStatus` (`PENDING`, `APPROVED`, `REJECTED`)
  - `SlotStatus` (`AVAILABLE`, `BLOCKED`)
- **Tables Created**:
  - `Sport` (sports reference metadata)
  - `ProviderProfile` (provider business configuration)
  - `Turf` (venue parameters, images, metadata)
  - `TurfSport` (join table for many-to-many sports associations)
  - `AvailabilitySlot` (specific date calendar hourly records)
  - `Favourite` (player liked venues)
  - *Placeholder Tables (minimal fields, no logic)*: `Booking`, `HostedMatch`, `MatchParticipant`, `Review`
- **Constraints & Indexes**:
  - Cascade delete rules on child records (`TurfSport`, `AvailabilitySlot`, `Favourite`, `ProviderProfile`).
  - Unique composite index on `AvailabilitySlot(turfId, date, startTime)` to prevent scheduling conflicts.
  - Unique composite index on `Favourite(userId, turfId)`.
  - Query indexing on `Turf(isDeleted, providerId)`, `AvailabilitySlot(turfId, date)`, and `Favourite(userId)`.

---

## 🔌 4. API Endpoints Added

| Method | Endpoint | Authentication | Role Enforced | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/sports` | None | None | Get all available sports list |
| `GET` | `/api/providers/profile` | Bearer Token | `PROVIDER` | Get current business profile |
| `POST` | `/api/providers/profile` | Bearer Token | `PROVIDER` | Create business profile |
| `PUT` | `/api/providers/profile` | Bearer Token | `PROVIDER` | Update business profile |
| `GET` | `/api/turfs` | None | None | Find and filter active turfs |
| `GET` | `/api/turfs/:id` | None | None | Retrieve specific turf details |
| `POST` | `/api/turfs` | Bearer Token | `PROVIDER` | Add a new turf |
| `PUT` | `/api/turfs/:id` | Bearer Token | `PROVIDER` | Update turf details |
| `DELETE`| `/api/turfs/:id` | Bearer Token | `PROVIDER` | Soft delete a turf |
| `GET` | `/api/availability` | None | None | Retrieve slots for a date |
| `POST` | `/api/availability` | Bearer Token | `PROVIDER` | Bulk update/block slots |
| `GET` | `/api/favourites` | Bearer Token | `PLAYER` | Fetch favourited turfs |
| `POST` | `/api/favourites` | Bearer Token | `PLAYER` | Add a turf to favourites |
| `DELETE`| `/api/favourites/:turfId`| Bearer Token | `PLAYER` | Remove a turf from favourites |

---

## 🎨 5. Frontend Integration Changes

- **React Query Hook Integration**: Replaced standard React local/mock arrays with React Query `useQuery` hooks. This ensures loading states, cache invalidation, and automatic background refresh when details change.
- **Dynamic Routing**: Refactored the `TurfCard` link parameter so navigating to `/booking` carries the venue query identifier: `/booking?turfId=<turf-id>`.
- **Dynamic Slot Matching**: Combined database-managed unavailable slot definitions (`status === "BLOCKED"`) with the optimistic local player booking state to seamlessly toggle slot layouts without modifying Milestone 3 logic.
- **Auto-Profile Provisioning**: When a Provider enters their turf list, the frontend automatically syncs and provisions a default provider business profile if they haven't explicitly configured one.

---

## ⚠️ 6. Known Limitations

- **Fixed Seeding Range**: Seeded calendar slots are hardcoded for dates between February 10, 2026, and February 16, 2026, to align with the frontend mockup date selector. Real-world slot queries beyond these dates will return empty until new slots are provisioned by providers.
- **Mock Player Ratings**: The Turf card still relies on a static rating fallback (`4.8` / `4.5`), as the `Review` model remains a placeholder for future milestones.
- **Client-Side Booking State**: Confirming a booking inside the calendar performs client-only state modifications without updating database booking records, as requested for Milestone 2.

---

## 🛠️ 7. Technical Debt

- **Uncontrolled Form Inputs fallback**: The turf creation/editing forms in `ProviderTurfs.tsx` use simple state bindings. As fields grow in Milestone 3, a form validation structure (like React Hook Form) may be preferred.
- **Date String Mappings**: To avoid altering existing UI components, UI date displays (e.g. `"Fri 14"`) are translated to ISO dates (`"2026-02-14"`) via client-side string splitting and padding helper functions. This should eventually be replaced with generic moment/date-fns conversions.

---

## 🚀 8. Future Improvements

- **Recurring Slots Generator**: In Milestone 3, build a template slot generator for providers to automatically populate slot dates weekly (e.g. "every Monday 8AM-9PM") rather than having to manually populate slots day-by-day.
- **Dynamic Slot Pricing**: Allow slots to define unique overridden hourly prices (e.g. prime time weekend slots costing more than weekday morning slots). The database schema already supports `price` overrides in `AvailabilitySlot`, but the UI doesn't have fields for it yet.
- **Auto-cleanup Job**: Set up a CRON job or database trigger to clean up past slots that are expired and unbooked, preventing the database from growing indefinitely.
