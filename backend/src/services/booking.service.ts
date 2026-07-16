import { PrismaClient, BookingStatus, CancelledBy } from '@prisma/client';
import { isPastSlot, hasSlotEnded } from '../utils/date.utils.js';

const prisma = new PrismaClient();

export const bookingService = {
  /**
   * Creates a new booking.
   * Ensures the slot is not already booked and is not in the past.
   */
  async createBooking(userId: string, slotId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch the slot and related turf
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: slotId },
        include: { turf: true },
      });

      if (!slot) {
        throw new Error('Slot not found');
      }

      // 2. Validate slot availability (not blocked)
      if (slot.status === 'BLOCKED') {
        throw new Error('Slot is not available');
      }

      // 3. Validate slot is in the future
      if (isPastSlot(slot.date, slot.startTime)) {
        throw new Error('Cannot book a slot in the past');
      }

      // 4. Check for existing active booking (application-level check)
      const existingBooking = await tx.booking.findUnique({
        where: { slotId: slotId },
      });

      if (existingBooking && existingBooking.status !== 'CANCELLED') {
        throw new Error('Slot is already booked');
      }

      // Calculate price (fallback to turf price if slot doesn't specify one)
      const priceToCharge = slot.price ?? slot.turf.pricePerHour;

      // 5. Create the booking. 
      // The DB unique constraint on slotId provides the final race-condition guarantee.
      const booking = await tx.booking.create({
        data: {
          userId,
          turfId: slot.turfId,
          slotId,
          totalPrice: priceToCharge,
          status: 'CONFIRMED',
        },
      });

      return booking;
    });
  },

  /**
   * Cancels a booking.
   * Can be initiated by PLAYER (owner) or PROVIDER (turf owner).
   */
  async cancelBooking(bookingId: string, actor: { userId: string, role: string }) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: true,
        turf: {
          include: { provider: true }
        }
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new Error('Only confirmed bookings can be cancelled');
    }

    // Authorize cancellation
    let cancelledBy: CancelledBy;
    if (actor.role === 'PLAYER' && booking.userId === actor.userId) {
      cancelledBy = 'PLAYER';
      
      // Ensure the slot hasn't already started/ended
      if (isPastSlot(booking.slot.date, booking.slot.startTime)) {
         throw new Error('Cannot cancel a past booking');
      }
    } else if (actor.role === 'PROVIDER' && booking.turf.provider.userId === actor.userId) {
      cancelledBy = 'PROVIDER';
    } else {
      throw new Error('Unauthorized to cancel this booking');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy,
      },
    });

    return updatedBooking;
  },

  /**
   * Gets a player's booking history.
   * Applies the derived 'COMPLETED' status if the slot has ended.
   */
  async getBookingsForUser(userId: string, statusFilter?: BookingStatus) {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        turf: true,
        slot: true,
      },
      orderBy: {
        slot: { date: 'desc' }
      }
    });

    // Compute derived status and filter if necessary
    const mapped = bookings.map(b => {
      let derivedStatus = b.status;
      if (b.status === 'CONFIRMED' && hasSlotEnded(b.slot.date, b.slot.endTime)) {
        derivedStatus = 'COMPLETED';
      }
      return { ...b, derivedStatus };
    });

    if (statusFilter) {
      return mapped.filter(b => b.derivedStatus === statusFilter);
    }
    return mapped;
  },

  /**
   * Gets a provider's bookings across their turfs.
   */
  async getBookingsForProvider(providerProfileId: string, turfId?: string, statusFilter?: BookingStatus) {
    const whereClause: any = {
      turf: { providerId: providerProfileId }
    };
    if (turfId) {
      whereClause.turfId = turfId;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: true,
        slot: true,
        turf: true,
      },
      orderBy: {
        slot: { date: 'desc' }
      }
    });

    const mapped = bookings.map(b => {
      let derivedStatus = b.status;
      if (b.status === 'CONFIRMED' && hasSlotEnded(b.slot.date, b.slot.endTime)) {
        derivedStatus = 'COMPLETED';
      }
      return { ...b, derivedStatus };
    });

    if (statusFilter) {
      return mapped.filter(b => b.derivedStatus === statusFilter);
    }
    return mapped;
  }
};
