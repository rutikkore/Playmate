import api from './api';
import { Turf } from './turf.service';

export interface AvailabilitySlot {
  id: string;
  turfId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BLOCKED';
  price: number | null;
  booking?: Booking | null;
}

export interface Booking {
  id: string;
  userId: string;
  turfId: string;
  slotId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  derivedStatus?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'; // Injected by backend
  totalPrice: string | number;
  cancelledAt?: string | null;
  cancelledBy?: 'PLAYER' | 'PROVIDER' | 'SYSTEM' | null;
  createdAt: string;
  updatedAt: string;
  slot?: AvailabilitySlot;
  turf?: Turf;
  user?: any;
}

export const bookingService = {
  /**
   * Create a new booking
   */
  createBooking: async (slotId: string): Promise<Booking> => {
    const response = await api.post('/bookings', { slotId });
    return response.data;
  },

  /**
   * Cancel an existing booking
   */
  cancelBooking: async (bookingId: string): Promise<Booking> => {
    const response = await api.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  /**
   * Get current player's bookings
   */
  getMyBookings: async (statusFilter?: string): Promise<Booking[]> => {
    const params = statusFilter ? { status: statusFilter } : undefined;
    const response = await api.get('/bookings/me', { params });
    return response.data;
  },

  /**
   * Get provider's bookings
   */
  getProviderBookings: async (turfId?: string, statusFilter?: string): Promise<Booking[]> => {
    const params: any = {};
    if (turfId) params.turfId = turfId;
    if (statusFilter) params.status = statusFilter;

    const response = await api.get('/bookings/provider', { params });
    return response.data;
  }
};
