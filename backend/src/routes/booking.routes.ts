import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePlayer, requireProvider, attachDBUser } from '../middleware/role.middleware.js';
import {
  createNewBooking,
  cancelExistingBooking,
  getMyBookings,
  getProviderBookings
} from '../controllers/booking.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', requirePlayer, createNewBooking);
router.get('/me', requirePlayer, getMyBookings);
router.patch('/:id/cancel', attachDBUser, cancelExistingBooking); // Both PLAYER and PROVIDER can cancel
router.get('/provider', requireProvider, getProviderBookings);

export default router;
