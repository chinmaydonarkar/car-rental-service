import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { BookingService } from '../application/bookingService';
import { UserService } from '../application/userService';
import { AuthService } from '../application/authService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { BookingValidationError } from '../domain/bookingValidation';

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carental';
const bookingService = new BookingService();
const userService = new UserService();
const authService = new AuthService();

// DRY: Async handler wrapper
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error) => {
      console.error(error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    });
  };
}

// Authentication routes
app.post('/auth/register', asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  res.status(201).json(user);
}));

app.post('/auth/login', asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json(result);
}));

// Protected routes - require authentication
app.get('/auth/me', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await authService.getUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'No token provided')) {
      res.status(401).json({ error: error.message });
    } else {
      throw error;
    }
  }
}));

// Create a user
app.post('/users', asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
}));

// Get all users
app.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.json(users);
}));

// Create a booking (protected)
app.post('/bookings', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { totalPrice, ...bookingData } = req.body;
  if (!totalPrice) {
    res.status(400).json({ error: 'Total price is required' });
    return;
  }
  try {
    const booking = await bookingService.createBooking({ ...bookingData, userId: req.user!.userId }, totalPrice);
    res.status(201).json(booking);
  } catch (error: any) {
    if (error instanceof BookingValidationError) {
      res.status(400).json({ 
        error: error.message,
        type: 'VALIDATION_ERROR',
        details: 'Please cancel your existing booking for these dates first.'
      });
    } else {
      throw error;
    }
  }
}));

// Get user bookings
app.get('/bookings/user/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const bookings = await bookingService.getUserBookings(userId);
  res.json(bookings);
}));

// Get current user's bookings (protected)
app.get('/bookings/my-bookings', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const bookings = await bookingService.getUserBookings(req.user!.userId);
  res.json(bookings);
}));

// Cancel current user's booking (protected)
app.patch('/bookings/:bookingId/cancel', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { bookingId } = req.params;
  try {
    const booking = await bookingService.cancelBooking(bookingId, req.user!.userId);
    res.json(booking);
  } catch (error) {
    if (error instanceof Error && error.message === 'Booking not found') {
      res.status(404).json({ error: 'Booking not found' });
    } else {
      throw error;
    }
  }
}));

// Get confirmed bookings for date range (for car service)
app.get('/bookings/confirmed', asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
  }
  const start = new Date(startDate as string);
  const end = new Date(endDate as string);
  const confirmedBookings = await bookingService.getConfirmedBookingsForDateRange(start, end);
  res.json(confirmedBookings);
}));

// Only start the server if this file is run directly
if (require.main === module) {
  (async () => {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
      // Fix indexes on startup
      try {
        const db = mongoose.connection.db;
        if (db) {
          // Drop old unique indexes if they exist
          try {
            await db.collection('bookings').dropIndex('userId_1_startDate_1_endDate_1');
            console.log('Dropped old unique index');
          } catch (e) {
            console.log('Old index not found or already dropped');
          }
          try {
            await db.collection('bookings').dropIndex('userId_1_startDate_1_endDate_1_status_1');
            console.log('Dropped existing status unique index');
          } catch (e) {
            console.log('Status unique index not found or already dropped');
          }
          // Create new non-unique index with status
          await db.collection('bookings').createIndex(
            { userId: 1, startDate: 1, endDate: 1, status: 1 },
            { name: 'userId_1_startDate_1_endDate_1_status_1' }
          );
          console.log('Created new non-unique index with status');
        }
      } catch (error) {
        console.error('Error fixing indexes:', error);
      }
      const PORT = process.env.PORT || 3002;
      app.listen(PORT, () => console.log(`Booking service running on port ${PORT}`));
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  })();
}

export { app }; 