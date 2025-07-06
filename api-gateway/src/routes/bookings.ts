import { Router } from 'express';
import { BookingServiceClient } from '../services/bookingService';

const router = Router();
const bookingService = new BookingServiceClient();

// Create a booking
router.post('/', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    const booking = await bookingService.createBooking(req.body, token);
    res.status(201).json(booking);
  } catch (error: any) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user's bookings (protected)
router.get('/my-bookings', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    const bookings = await bookingService.getMyBookings(token);
    res.json(bookings);
  } catch (error: any) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user bookings - MORE SPECIFIC ROUTE FIRST
router.get('/user/:userId', async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const bookings = await bookingService.getUserBookings(userId);
    res.json(bookings);
  } catch (error: any) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel current user's booking (protected)
router.patch('/:bookingId/cancel', async (req: any, res: any) => {
  try {
    const { bookingId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    const booking = await bookingService.cancelMyBooking(bookingId, token);
    res.json(booking);
  } catch (error: any) {
    console.error('Cancel my booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 