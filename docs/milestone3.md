PlayMate — Milestone 3 Architecture Document
Booking System

1. Scope Recap
Milestone 3 replaces the current client-only, optimistic-state booking simulation (BookingCalendar.tsx mutates a local Set of booked slots) with a real, transaction-safe, database-backed booking system built on top of the Milestone 2 Turf / AvailabilitySlot infrastructure.
In scope:

Real booking creation tied to AvailabilitySlot
Double-booking prevention
Booking lifecycle / status model
Player booking history
Provider booking visibility & management
Supporting APIs and service-layer design

Out of scope (explicitly deferred):

Payments (Milestone 5)
Matchmaking / HostedMatch (Milestone 4)
Notifications (Milestone 7)
Reviews (placeholder stays as-is)
Any UI redesign — existing BookingCalendar.tsx / ProviderBookings.tsx visual language is preserved, only wired to real data


2. Current State (as inspected)

Booking model is a placeholder: id, userId, turfId, createdAt — no slot linkage, no status, no price, restrictive (not cascading) FK to User/Turf.
AvailabilitySlot has status: SlotStatus (AVAILABLE | BLOCKED) but nothing that represents "taken by a booking."
BookingCalendar.tsx fetches AvailabilitySlots via turfService.getAvailability, but "booking" is a local Set<string> + setTimeout fake network call — nothing persists.
ProviderBookings.tsx is 100% mock array (allBookings), no service call exists (turfService has no booking methods).
Role middleware (requirePlayer, requireProvider, attachDBUser) already exists and is reusable as-is.
No booking service, controller, or routes exist yet.


3. Booking Lifecycle Design
3.1 Status Enum
enum BookingStatus {
  PENDING     // created, awaiting confirmation (reserved for future payment step)
  CONFIRMED   // actively holds the slot
  CANCELLED   // cancelled by player or provider before slot time
  COMPLETED   // slot time has passed, booking fulfilled
  NO_SHOW     // optional; provider can mark player didn't show (future-friendly, provider-only transition)
}
Milestone 3 policy: Since payments don't exist yet, bookings are created directly as CONFIRMED (no real "pending payment" step is meaningful yet). PENDING is included now so the schema doesn't need another migration when Milestone 5 (Payments) introduces a pending-payment window — but the only state machine transitions actually used in M3 are:
CONFIRMED → CANCELLED   (player or provider initiated)
CONFIRMED → COMPLETED   (system-derived when slot's date/endTime < now; can be computed on read, not necessarily a write)
PENDING and NO_SHOW exist in the enum for forward-compatibility but no M3 code path produces them except optionally exposing the transition scaffold. ChatGPT/architecture review should decide whether to even include NO_SHOW now — flagged as optional.
3.2 Status Transition Rules
FromToAllowed by—CONFIRMEDSystem, on successful booking creationCONFIRMEDCANCELLEDPlayer (own booking, only if slot is in the future) or Provider (owns turf)CONFIRMEDCOMPLETEDDerived/read-time (slot end has passed) — see 3.3CANCELLED*No further transitionsCOMPLETED*No further transitions
3.3 COMPLETED — derived vs. stored
Recommend not running a cron/background job in M3 (no infra for it yet, and it's explicitly a later milestone concern — "Realtime" is M7). Instead:

Store only CONFIRMED / CANCELLED as written states.
Compute "COMPLETED" at read time in the service layer: if status === CONFIRMED and slot.date + slot.endTime < now, present it as COMPLETED in API responses (via a derived field, not a DB write). This avoids needing a scheduler this milestone while still satisfying "booking history shows completed games."
Document this clearly as a deliberate simplification so Milestone 9 (Production Features) can add a real background job to persist COMPLETED if needed.


4. Prisma Schema Changes
4.1 Updated Booking model
Replace the placeholder with:
prismaenum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

model Booking {
  id          String        @id @default(cuid())

  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Restrict)

  turfId      String
  turf        Turf          @relation(fields: [turfId], references: [id], onDelete: Restrict)

  slotId      String        @unique   // <-- enforces 1:1, the core anti-double-booking guarantee
  slot        AvailabilitySlot @relation(fields: [slotId], references: [id], onDelete: Restrict)

  status      BookingStatus @default(CONFIRMED)
  totalPrice  Float
  cancelledAt DateTime?
  cancelledBy String?       // "PLAYER" | "PROVIDER" (simple string tag, not a relation)

  createdAt   DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([userId])
  @@index([turfId])
  @@index([status])
}
Key design decision: slotId is @unique. This is the single most important schema-level guarantee against double-booking — a slot can have at most one Booking row, ever, regardless of race conditions, enforced by the database itself (unique constraint), not just application logic.
4.2 AvailabilitySlot — add a back-reference (optional but useful)
prismamodel AvailabilitySlot {
  ...
  booking   Booking?   // opposite side of the 1:1 relation
}
No new columns needed on AvailabilitySlot itself — SlotStatus (AVAILABLE/BLOCKED) stays exactly as-is and continues to mean "provider-controlled availability," which is a different concept from "has an active booking." A slot's effective bookability = status === AVAILABLE AND booking IS NULL (or booking.status = CANCELLED).
This separation matters: it means providers can still block slots for maintenance independently of the booking system, and cancelling a booking naturally frees the slot back up without needing to touch AvailabilitySlot.status at all.
4.3 Why not add a bookingId FK on AvailabilitySlot instead?
Considered and rejected: putting the FK on Booking→slotId (rather than AvailabilitySlot→bookingId) is cleaner because a Booking cannot exist without a slot, but a slot's existence is independent of any booking. This also makes the unique constraint natural (Booking.slotId @unique reads as "at most one booking per slot").
4.4 Migration Impact

This is a breaking change to the placeholder Booking table. Since it's currently unused (no rows, no reads/writes anywhere in the app), a destructive migration (drop + recreate columns) is safe and preferable to a complex data migration.
User.bookings and Turf.bookings relations already exist and require no change.


5. Backend Architecture
Following the existing feature-based pattern (service → controller → routes, thin controllers, role.middleware.ts reused as-is):
backend/src/
├── services/
│   └── booking.service.ts
├── controllers/
│   └── booking.controller.ts
├── routes/
│   └── booking.routes.ts
5.1 booking.service.ts — responsibilities
createBooking(userId, slotId)
This is the core transaction-safety function. Implementation approach:
prisma.$transaction(async (tx) => {
  const slot = await tx.availabilitySlot.findUnique({ where: { id: slotId }, include: { turf: true } });
  // validate: slot exists, slot.status === AVAILABLE, slot.date/time is in the future
  // attempt to create the Booking row referencing slotId
  // rely on the DB unique constraint on Booking.slotId to reject if a race condition
  // already created a booking for this slot between the read and the write
})
Two layers of protection, deliberately redundant:

Application-level check — read the slot, confirm no existing non-cancelled booking, confirm slot not BLOCKED, confirm date is in the future.
Database-level guarantee — the @unique constraint on slotId means that even under concurrent requests hitting the transaction simultaneously, only one create can succeed; the second will throw a Prisma unique-constraint error (P2002), which the controller catches and translates into a clean 409 Conflict ("This slot was just booked by someone else").

This is the standard "optimistic write + unique constraint as the real lock" pattern — appropriate here since Postgres transactions + a unique index are sufficient without needing explicit row locking (SELECT ... FOR UPDATE), though FOR UPDATE on the slot row inside the transaction can be added as extra defense if load testing reveals contention (flagged as an optional hardening step, not required for M3 correctness).
cancelBooking(bookingId, actor: {dbUserId, role})

Fetch booking + slot + turf.
Authorize: actor must be the booking's player, OR the provider who owns the turf.
Validate: booking status is CONFIRMED (not already cancelled/completed).
Optionally validate a cancellation cutoff (e.g., disallow cancelling within X hours of slot start) — flagged as a product decision, not architecturally required; recommend deferring the cutoff rule to Milestone 9 and allowing free cancellation in M3 unless ChatGPT/product wants it now.
Update status = CANCELLED, cancelledAt = now(), cancelledBy.

getBookingsForUser(userId, filters?: {status})
Returns the player's booking history, joined with Turf (name, location, images) and AvailabilitySlot (date, startTime, endTime), with the derived COMPLETED status applied at the mapping layer (see 3.3).
getBookingsForProvider(providerProfileId, filters?: {status, turfId})
Returns bookings across all turfs owned by that provider (or filtered to one turf), joined with User (player name/email) and slot/turf info — this is what powers ProviderBookings.tsx.
getBookingById(bookingId) — internal helper used by the above.
5.2 booking.controller.ts
Thin, mirrors existing controllers exactly (e.g. turf.controller.ts):

createNewBooking — validates request shape, calls service, maps Prisma P2002 → 409, maps "slot not available" → 400, success → 201.
cancelExistingBooking — validates ownership via service, 403 on unauthorized, 200 on success.
getMyBookings — player-only, calls getBookingsForUser.
getProviderBookings — provider-only, resolves ProviderProfile from dbUser first (same pattern as turf.controller.ts's createNewTurf).

5.3 booking.routes.ts
router.use(requireAuth);

router.post("/",            requirePlayer,   createNewBooking);
router.get("/me",           requirePlayer,   getMyBookings);
router.patch("/:id/cancel", attachDBUser,     cancelExistingBooking); // authorization for player-or-provider happens inside the service, since either role can cancel
router.get("/provider",     requireProvider,  getProviderBookings);
Note: cancel uses attachDBUser (not a strict role gate) because both players and providers can cancel — the fine-grained "is this the right player or the right provider" check has to happen inside the service against the specific booking, not at the route-role level. This mirrors how requirePlayer/requireProvider middleware already delegates ownership checks into services elsewhere (e.g. turf.controller.ts checking providerProfile.id ownership manually rather than at the route).
Mount in app.ts:
app.use("/api/bookings", bookingRoutes);

6. API Design
MethodEndpointAuthRoleDescriptionPOST/api/bookingsBearerPLAYERCreate a booking for a given slotId. Body: { slotId }. Server derives turfId and totalPrice from the slot/turf — client never sends price.GET/api/bookings/meBearerPLAYERList the current player's bookings. Query: ?status=CONFIRMED|CANCELLED|COMPLETED (optional).PATCH/api/bookings/:id/cancelBearerPLAYER or PROVIDERCancel a booking. Authorization resolved inside service against booking's player/turf-provider.GET/api/bookings/providerBearerPROVIDERList bookings across the provider's turfs. Query: ?turfId=&status=.
Design notes:

Price is never trusted from the client. totalPrice is computed server-side from AvailabilitySlot.price ?? Turf.pricePerHour, matching the pattern already used in BookingCalendar.tsx's price-fallback logic, just moved server-side where it belongs.
No PUT/full-update endpoint for bookings — bookings are immutable except for the cancel transition, kept intentionally narrow to avoid arbitrary state edits.
No separate DELETE — cancellation is a soft state transition, not a row deletion, preserving history (needed for "booking history" requirement).


7. Frontend Impact
No visual/design changes — only wiring existing UI to real data, per the "never redesign the frontend" rule.
7.1 frontend/src/services/turf.service.ts (or new booking.service.ts)
Add methods: createBooking(slotId), getMyBookings(status?), cancelBooking(bookingId), getProviderBookings(filters?). Follows the exact Axios + typed-interface pattern already used for turfService.
7.2 BookingCalendar.tsx

Replace the bookedSlots local Set + setTimeout fake confirm with a real useMutation calling bookingService.createBooking(slot.id).
getSlotStatus needs the slot's own booking presence, not just dbSlots BLOCKED status — the GET /availability response should now also reflect "has an active booking" so the calendar can grey it out. This means availability.controller.ts's getAvailability should include the related booking (or at least whether one exists) in its response — a small, additive change to the existing endpoint's include, not a new endpoint.
On success, invalidate the availability query key so the slot immediately shows as unavailable; invalidate my-bookings too if that view is open elsewhere.
On 409 (race lost), show a toast ("This slot was just booked") and refetch availability — the UI already has the scaffolding for this via sonner toasts used elsewhere (ProviderTurfs.tsx).

7.3 MyGames.tsx
Currently fully mock (games array). Wire to getMyBookings(), mapping Booking + Turf + AvailabilitySlot → the existing card shape (sport, venue, location, date, time, status, players, result). result (win/loss score) has no backing data model yet — leave as null/omitted for M3, since match results belong conceptually to Matchmaking (M4), not Booking.
7.4 ProviderBookings.tsx
Currently fully mock (allBookings). Wire to getProviderBookings(), replacing the local array with a useQuery, keeping the existing tab/search/stat-card UI untouched — only the data source changes.
7.5 ProviderSlots.tsx
No change required to its own logic, but should be aware that a slot with an active booking should not be block-able/unblock-able by the provider without first considering the booking (edge case — see §9).

8. Implementation Order

Schema: Update Booking model + AvailabilitySlot back-relation → prisma migrate dev.
Service layer: booking.service.ts (createBooking with transaction + unique-constraint handling first, since it's the highest-risk piece — test double-booking prevention in isolation before building anything on top).
Controller + routes: booking.controller.ts, booking.routes.ts, mount in app.ts.
Availability read-path update: extend getAvailability service/controller to include booking presence, so the frontend calendar can distinguish "blocked by provider" vs "booked by a player" vs "available."
Frontend service methods: add booking calls to the service layer.
Wire BookingCalendar.tsx: real create-booking flow, replacing the fake timeout.
Wire MyGames.tsx: player booking history.
Wire ProviderBookings.tsx: provider booking list.
Manual testing pass: concurrent booking attempts on the same slot (open two tabs, click "Confirm & Pay" near-simultaneously), cancellation as player, cancellation as provider, booking history correctness, derived COMPLETED status on past slots.

This order front-loads the highest-risk, hardest-to-retrofit piece (the transaction/uniqueness guarantee) before any UI work depends on it.

9. Risks & Edge Cases
Risk / Edge CaseMitigationRace condition: two players click "book" on the same slot simultaneouslyDB-level @unique on Booking.slotId guarantees only one write succeeds; controller catches P2002 and returns 409 with a clear message.Provider blocks a slot that already has a confirmed bookingupdateAvailability (existing M2 endpoint) currently has no awareness of bookings. Must add a guard: reject (or warn) setting a slot to BLOCKED if an active Booking exists for it. Flag this as a required small addition to the existing M2 availability.controller.ts, not a new M3 feature, but necessary for correctness.Cancelling a booking should free the slotBecause slot availability is derived (AVAILABLE status AND no non-cancelled booking), no extra write to AvailabilitySlot is needed on cancel — freeing happens automatically via the read-time join logic. Must ensure getAvailability's query excludes CANCELLED bookings when determining "is this slot taken."Booking a slot in the pastReject in createBooking if slot.date combined with startTime is before now().Cancelling a booking after the slot has passedReject cancellation if slot time has passed (arguably moot/COMPLETED bookings shouldn't be cancellable) — service should check this alongside the status check.Price drift: provider changes pricePerHour after a booking is madeNot a concern — totalPrice is captured on the Booking row at creation time, immutable afterward. This is why totalPrice is stored redundantly rather than always computed from the live Turf/Slot.Orphaned bookings if a Turf or Slot is deletedonDelete: Restrict on both Booking.turf and Booking.slot FKs prevents deleting a turf/slot that has bookings — matches the existing pattern already used for Booking.user/Booking.turf in the placeholder schema. Soft-delete (Turf.isDeleted) remains the correct path for turfs with booking history, which turf.service.ts already supports.Multiple bookings for the same player, same turf, different slotsExplicitly allowed — no uniqueness constraint on (userId, turfId), only on slotId.No-show / dispute handlingExplicitly deferred; NO_SHOW enum value included for forward compatibility only, no workflow built around it in M3.Timezone handling for "is this slot in the future"Existing AvailabilitySlot.date is a DateTime and startTime/endTime are strings ("6:00 AM") per M2 design — combining them into a comparable timestamp requires parsing logic already partially present in ProviderSlots.tsx's AM/PM math. This parsing should be centralized into a shared utility (backend) rather than duplicated across createBooking, cancelBooking, and the derived-COMPLETED read logic — flagged as a small but important shared-utility need.

10. Summary of Required Changes (checklist for ChatGPT review)

 Booking model rewritten with slotId @unique, status, totalPrice, cancelledAt, cancelledBy
 BookingStatus enum added
 AvailabilitySlot.booking back-relation added
 New migration
 booking.service.ts, booking.controller.ts, booking.routes.ts
 Mount /api/bookings in app.ts
 Small guard added to existing availability.controller.ts/service: block "set slot to BLOCKED" if an active booking exists
 Small guard/enrichment added to existing getAvailability: expose booking presence per slot
 Frontend: booking service methods
 Frontend: BookingCalendar.tsx real booking flow (no visual change)
 Frontend: MyGames.tsx wired to real data (no visual change)
 Frontend: ProviderBookings.tsx wired to real data (no visual change)

This document is ready for ChatGPT's architecture review before Antigravity begins implementation.