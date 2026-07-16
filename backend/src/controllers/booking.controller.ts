import { Response } from 'express';
import { DBAuthenticatedRequest } from '../middleware/role.middleware.js';
import { bookingService } from '../services/booking.service.js';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';

export const createNewBooking = async (req: DBAuthenticatedRequest, res: Response) => {
  try {
    const { slotId } = req.body;
    const userId = req.dbUser!.id; // from attachDBUser middleware

    if (!slotId) {
      return res.status(400).json({ error: 'slotId is required' });
    }

    const booking = await bookingService.createBooking(userId, slotId);
    res.status(201).json(booking);
  } catch (error: any) {
    // Handle Prisma unique constraint violation (P2002) as 409 Conflict
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'This slot was just booked by someone else' });
    }
    
    if (error.message === 'Slot not found' || error.message === 'Slot is not available' || error.message === 'Cannot book a slot in the past' || error.message === 'Slot is already booked') {
      return res.status(400).json({ error: error.message });
    }

    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelExistingBooking = async (req: DBAuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;
    const role = req.dbUser!.role; // 'PLAYER' or 'PROVIDER'

    const cancelledBooking = await bookingService.cancelBooking(id, { userId, role });
    res.status(200).json(cancelledBooking);
  } catch (error: any) {
    if (error.message === 'Booking not found') return res.status(404).json({ error: error.message });
    if (error.message === 'Unauthorized to cancel this booking') return res.status(403).json({ error: error.message });
    if (error.message === 'Only confirmed bookings can be cancelled' || error.message === 'Cannot cancel a past booking') {
       return res.status(400).json({ error: error.message });
    }

    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyBookings = async (req: DBAuthenticatedRequest, res: Response) => {
  try {
    const userId = req.dbUser!.id;
    const statusFilter = req.query.status as any; // Optional filter

    const bookings = await bookingService.getBookingsForUser(userId, statusFilter);
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching player bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProviderBookings = async (req: DBAuthenticatedRequest, res: Response) => {
  try {
    const userId = req.dbUser!.id;
    const providerProfile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!providerProfile) {
      return res.status(403).json({ error: 'Provider profile not found' });
    }

    const turfId = req.query.turfId as string;
    const statusFilter = req.query.status as any;

    const bookings = await bookingService.getBookingsForProvider(providerProfile.id, turfId, statusFilter);
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
