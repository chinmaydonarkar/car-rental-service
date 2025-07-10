import { Router, Request, Response, NextFunction } from 'express';
import { BookingServiceClient } from '../services/bookingService';
import { extractToken } from '../middleware/auth';
import { z } from 'zod';
import { validateBody } from '../middleware/validation';

const router = Router();
const bookingService = new BookingServiceClient();

type AuthRequest = Request & { token?: string };

// DRY: Async handler wrapper
function asyncHandler(fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error) => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
  };
}

// DRY: Token check helper
function requireToken(req: AuthRequest, res: Response): string | undefined {
  const token = req.token;
  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return undefined;
  }
  return token;
}

const createBookingSchema = z.object({
  userId: z.string().optional(),
  carId: z.string().min(1, { message: 'Car ID is required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  licenseNumber: z.string().min(5, { message: 'License number is required' }),
  licenseValidUntil: z.string().min(1, { message: 'License valid until is required' }),
  totalPrice: z.number().nonnegative({ message: 'Total price must be non-negative' }),
});

// Create a booking
router.post(
  '/',
  extractToken,
  validateBody(createBookingSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const token = requireToken(req, res);
    if (!token) return;
    const booking = await bookingService.createBooking(req.body, token);
    res.status(201).json(booking);
  })
);

// Get current user's bookings (protected)
router.get('/my-bookings', extractToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = requireToken(req, res);
  if (!token) return;
  const bookings = await bookingService.getMyBookings(token);
  res.json(bookings);
}));

// Get user bookings - MORE SPECIFIC ROUTE FIRST
router.get('/user/:userId', extractToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const token = requireToken(req, res);
  if (!token) return;
  const bookings = await bookingService.getUserBookings(userId);
  res.json(bookings);
}));

// Cancel current user's booking (protected)
router.patch('/:bookingId/cancel', extractToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookingId } = req.params;
  const token = requireToken(req, res);
  if (!token) return;
  const booking = await bookingService.cancelMyBooking(bookingId, token);
  res.json(booking);
}));

export default router; 