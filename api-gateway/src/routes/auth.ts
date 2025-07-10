import { Router, Request, Response } from 'express';
import { BookingServiceClient } from '../services/bookingService';
import { validateBody } from '../middleware/validation';
import { registerSchema, loginSchema } from '../validation/userSchemas';

const router = Router();
const bookingService = new BookingServiceClient();

// Register new user
router.post('/register', validateBody(registerSchema), async (req: Request, res: Response) => {
  try {
    const user = await bookingService.register(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    const result = await bookingService.login(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Get current user info
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    const user = await bookingService.getCurrentUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    res.json(user);
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: error.message || 'Failed to get user' });
  }
});

export default router; 