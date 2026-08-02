import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, MatchStatus, SkillLevel, MatchVisibility } from '@prisma/client';
import { matchService } from './services/match.service.js';

const prisma = new PrismaClient();

async function assertThrows(promise: Promise<any>, expectedMessageSubstring: string) {
  try {
    await promise;
    throw new Error(`Expected error containing "${expectedMessageSubstring}" but command succeeded.`);
  } catch (error: any) {
    if (error.message.includes(expectedMessageSubstring)) {
      console.log(`✅ Correctly threw error: "${error.message}"`);
    } else {
      throw new Error(`Expected error containing "${expectedMessageSubstring}" but got: "${error.message}"`);
    }
  }
}

async function test() {
  console.log('--- Starting Matchmaking Backend Tests ---');

  // Setup pointers so finally block can clean them up even if test fails mid-way
  let createdTurfId: string | null = null;
  let createdMatchIds: string[] = [];
  let createdBookingIds: string[] = [];
  let createdSlotIds: string[] = [];

  const user1 = await prisma.user.upsert({
    where: { email: 'test_host@playmate.com' },
    update: {},
    create: {
      firebaseUid: 'test-host-uid',
      email: 'test_host@playmate.com',
      name: 'Test Host',
      role: 'PLAYER',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'test_player2@playmate.com' },
    update: {},
    create: {
      firebaseUid: 'test-player2-uid',
      email: 'test_player2@playmate.com',
      name: 'Test Player 2',
      role: 'PLAYER',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'test_player3@playmate.com' },
    update: {},
    create: {
      firebaseUid: 'test-player3-uid',
      email: 'test_player3@playmate.com',
      name: 'Test Player 3',
      role: 'PLAYER',
    },
  });

  console.log('✅ Users set up:', { host: user1.email, p2: user2.email, p3: user3.email });

  const sport = await prisma.sport.upsert({
    where: { slug: 'test-football' },
    update: {},
    create: {
      name: 'Test Football',
      slug: 'test-football',
    },
  });
  console.log('✅ Sport set up:', sport.name);

  try {
    // 1. Setup Test Turf
    const provider = await prisma.providerProfile.findFirst();
    if (!provider) {
      throw new Error('Please run migrations / ensure at least one provider exists in DB');
    }

    const turf = await prisma.turf.create({
      data: {
        name: 'Test Arena',
        location: 'Test Location',
        pricePerHour: 100,
        providerId: provider.id,
      },
    });
    createdTurfId = turf.id;
    console.log('✅ Turf set up:', turf.name);

    // 2. Setup Test Slots & Bookings
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const slot1 = await prisma.availabilitySlot.create({
      data: { turfId: turf.id, date: tomorrow, startTime: '08:00 AM', endTime: '09:00 AM', status: 'AVAILABLE' },
    });
    createdSlotIds.push(slot1.id);

    const slot2 = await prisma.availabilitySlot.create({
      data: { turfId: turf.id, date: tomorrow, startTime: '09:00 AM', endTime: '10:00 AM', status: 'AVAILABLE' },
    });
    createdSlotIds.push(slot2.id);

    const slot3 = await prisma.availabilitySlot.create({
      data: { turfId: turf.id, date: tomorrow, startTime: '10:00 AM', endTime: '11:00 AM', status: 'AVAILABLE' },
    });
    createdSlotIds.push(slot3.id);

    const booking1 = await prisma.booking.create({
      data: { userId: user1.id, turfId: turf.id, slotId: slot1.id, status: 'CONFIRMED', totalPrice: 100 },
    });
    createdBookingIds.push(booking1.id);

    const booking2 = await prisma.booking.create({
      data: { userId: user1.id, turfId: turf.id, slotId: slot2.id, status: 'CONFIRMED', totalPrice: 100 },
    });
    createdBookingIds.push(booking2.id);

    const booking3 = await prisma.booking.create({
      data: { userId: user1.id, turfId: turf.id, slotId: slot3.id, status: 'CONFIRMED', totalPrice: 100 },
    });
    createdBookingIds.push(booking3.id);

    console.log('✅ Future bookings created for host');

    // --- TEST SCENARIO 1: Create Match & Duplicate Creation Blocking ---
    console.log('\n--- Scenario 1: Create Match & Duplicate Creation ---');
    const match1 = await matchService.createMatch(user1.id, {
      bookingId: booking1.id,
      sportId: sport.id,
      maxPlayers: 2,
      description: 'Fun 5v5 game',
    });
    createdMatchIds.push(match1.id);
    console.log('✅ Match 1 created:', match1.id);

    // Attempt duplicate match creation on same booking
    await assertThrows(
      matchService.createMatch(user1.id, {
        bookingId: booking1.id,
        sportId: sport.id,
        maxPlayers: 5,
      }),
      'A match already exists for this booking'
    );

    // --- TEST SCENARIO 2: Unauthorized Actions ---
    console.log('\n--- Scenario 2: Unauthorized Actions ---');
    await assertThrows(matchService.startMatch(match1.id, user2.id), 'Unauthorized to start this match');
    await assertThrows(matchService.cancelMatch(match1.id, user2.id), 'Unauthorized to cancel this match');
    await assertThrows(matchService.completeMatch(match1.id, user2.id), 'Unauthorized to complete this match');

    // --- TEST SCENARIO 3: Pagination & Sensitive Fields Check ---
    console.log('\n--- Scenario 3: Pagination & Sensitive Fields Check ---');
    const match2 = await matchService.createMatch(user1.id, {
      bookingId: booking2.id,
      sportId: sport.id,
      maxPlayers: 4,
    });
    createdMatchIds.push(match2.id);

    const match3 = await matchService.createMatch(user1.id, {
      bookingId: booking3.id,
      sportId: sport.id,
      maxPlayers: 4,
    });
    createdMatchIds.push(match3.id);

    const page1 = await matchService.listMatches({ page: 1, limit: 2 });
    console.log(`Page 1 count: ${page1.matches.length}, total: ${page1.total}, totalPages: ${page1.totalPages}`);
    if (page1.matches.length !== 2) throw new Error('Pagination page 1 limit mismatch');
    if (page1.totalPages !== 2) throw new Error('Pagination total pages mismatch');

    // Sensitive fields check: ensure email is undefined for host & participants
    const matchDetails = await matchService.getMatchById(match1.id);
    console.log('Verifying host email is removed from response...');
    if ((matchDetails?.host as any)?.email !== undefined) {
      throw new Error('Sensitive host email field was found in match details');
    }
    console.log('✅ Host email is hidden.');

    // --- TEST SCENARIO 4: Host Rejoin Guard & Transitions ---
    console.log('\n--- Scenario 4: Host Rejoin Guard & Transitions ---');
    // Ensure Host cannot join again
    await assertThrows(
      matchService.joinMatch(match1.id, user1.id),
      'Host is already a participant and cannot rejoin'
    );

    const tempSlot = await prisma.availabilitySlot.create({
      data: { turfId: turf.id, date: tomorrow, startTime: '11:00 AM', endTime: '12:00 PM', status: 'AVAILABLE' },
    });
    createdSlotIds.push(tempSlot.id);

    const tempBooking = await prisma.booking.create({
      data: { userId: user1.id, turfId: turf.id, slotId: tempSlot.id, status: 'CONFIRMED', totalPrice: 100 },
    });
    createdBookingIds.push(tempBooking.id);

    const transitionMatch = await matchService.createMatch(user1.id, {
      bookingId: tempBooking.id,
      sportId: sport.id,
      maxPlayers: 3,
    });
    createdMatchIds.push(transitionMatch.id);

    // Invalid: Start from OPEN -> COMPLETED
    await assertThrows(
      matchService.completeMatch(transitionMatch.id, user1.id),
      'Only matches in progress can be completed'
    );

    // Valid: Start the match (OPEN -> IN_PROGRESS)
    const started = await matchService.startMatch(transitionMatch.id, user1.id);
    console.log(`✅ Transition Match started. Status: ${started.status}`);

    // Valid: Complete the match (IN_PROGRESS -> COMPLETED)
    const completed = await matchService.completeMatch(transitionMatch.id, user1.id);
    console.log(`✅ Transition Match completed. Status: ${completed.status}`);

    // Invalid: Cancel a completed match
    await assertThrows(
      matchService.cancelMatch(transitionMatch.id, user1.id),
      'Cannot cancel a finished match'
    );

    // --- TEST SCENARIO 5: Concurrency & Capacity Enforcement ---
    console.log('\n--- Scenario 5: Concurrency & Capacity Enforcement ---');
    console.log(`Match 1 players limit: ${match1.maxPlayers}, participant count: ${match1.participantCount}`);

    // Trigger concurrent joins for user2 and user3
    console.log('Sending concurrent joins for Player 2 and Player 3...');
    const results = await Promise.allSettled([
      matchService.joinMatch(match1.id, user2.id),
      matchService.joinMatch(match1.id, user3.id),
    ]);

    let successes = 0;
    let failures = 0;

    for (const r of results) {
      if (r.status === 'fulfilled') {
        successes++;
        console.log(`✅ Successful join: Match count updated to ${r.value.participantCount}, status: ${r.value.status}`);
      } else {
        failures++;
        console.log(`❌ Rejected join: "${r.reason.message}"`);
      }
    }

    if (successes !== 1 || failures !== 1) {
      throw new Error(`Concurrency failure! Expected exactly 1 success and 1 failure, but got ${successes} successes and ${failures} failures.`);
    }

    // Fetch final match state
    const finalMatchState = await prisma.match.findUnique({ where: { id: match1.id } });
    console.log('Final Match 1 state:', {
      participantCount: finalMatchState?.participantCount,
      status: finalMatchState?.status,
    });

    if (finalMatchState?.participantCount !== 2 || finalMatchState?.status !== 'FULL') {
      throw new Error('Final participant count or status mismatch on full capacity');
    }

  } finally {
    console.log('\nCleaning up created test records in finally block...');
    if (createdMatchIds.length > 0) {
      await prisma.matchParticipant.deleteMany({ where: { matchId: { in: createdMatchIds } } });
      await prisma.match.deleteMany({ where: { id: { in: createdMatchIds } } });
    }
    if (createdBookingIds.length > 0) {
      await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
    }
    if (createdSlotIds.length > 0) {
      await prisma.availabilitySlot.deleteMany({ where: { id: { in: createdSlotIds } } });
    }
    if (createdTurfId) {
      await prisma.turf.delete({ where: { id: createdTurfId } });
    }
    console.log('✅ Cleanup completed.');
  }

  console.log('\n🎉 ALL BACKEND MATCHMAKING TESTS PASSED SUCCESSFULLY! 🎉');
}

test()
  .catch((err) => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
