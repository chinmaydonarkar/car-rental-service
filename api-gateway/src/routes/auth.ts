import { Router } from 'express';
import { BookingServiceClient } from '../services/bookingService';

const router = Router();
const bookingService = new BookingServiceClient();

// Register new user
router.post('/register', async (req: any, res: any) => {
  try {
    const user = await bookingService.register(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req: any, res: any) => {
  try {
    const result = await bookingService.login(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Get current user (requires token)
router.get('/me', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const user = await bookingService.getCurrentUser(token);
    res.json(user);
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(401).json({ error: error.message });
  }
});

export default router; 