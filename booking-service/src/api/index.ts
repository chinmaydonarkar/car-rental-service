import 'dotenv/config';
import express from 'express';
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

// Authentication routes
app.post('/auth/register', async (req: any, res: any) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    if (error.message && error.message.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/login', async (req: any, res: any) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Protected routes - require authentication
app.get('/auth/me', authenticateToken, (req: any, res: any) => {
  authService.getUserById(req.user!.userId)
    .then(user => {
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    })
    .catch(error => {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Create a user
app.post('/users', async (req: any, res: any) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    if (error.message && error.message.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
app.get('/users', async (req: any, res: any) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a booking (protected)
app.post('/bookings', authenticateToken, (req: any, res: any) => {
  const { totalPrice, ...bookingData } = req.body;

  if (!totalPrice) {
    res.status(400).json({ error: 'Total price is required' });
    return;
  }

  // Use authenticated user's ID
  bookingService.createBooking({ ...bookingData, userId: req.user!.userId }, totalPrice)
    .then(booking => res.status(201).json(booking))
    .catch(error => {
      if (error instanceof BookingValidationError) {
        res.status(400).json({ 
          error: error.message,
          type: 'VALIDATION_ERROR',
          details: 'Please cancel your existing booking for these dates first.'
        });
      } else {
        console.error('Booking creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
});

// Get user bookings
app.get('/bookings/user/:userId', async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const bookings = await bookingService.getUserBookings(userId);
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user's bookings (protected)
app.get('/bookings/my-bookings', authenticateToken, async (req: any, res: any) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user!.userId);
    res.json(bookings);
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel current user's booking (protected)
app.patch('/bookings/:bookingId/cancel', authenticateToken, async (req: any, res: any) => {
  try {
    const { bookingId } = req.params;
    const booking = await bookingService.cancelBooking(bookingId, req.user!.userId);
    res.json(booking);
  } catch (error: any) {
    if (error.message && error.message === 'Booking not found') {
      return res.status(404).json({ error: 'Booking not found' });
    }
    console.error('Cancel my booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get confirmed bookings for date range (for car service)
app.get('/bookings/confirmed', async (req: any, res: any) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // Get all confirmed bookings that overlap with the date range
    const confirmedBookings = await bookingService.getConfirmedBookingsForDateRange(start, end);
    res.json(confirmedBookings);
  } catch (error) {
    console.error('Get confirmed bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Only start the server if this file is run directly
if (require.main === module) {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
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
    })
    .catch(err => console.error('MongoDB connection error:', err));

  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => console.log(`Booking service running on port ${PORT}`));
}

export { app, mongoose }; 