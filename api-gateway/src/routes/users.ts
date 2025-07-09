import { Router, Request, Response } from 'express';
import { BookingServiceClient } from '../services/bookingService';

const router = Router();
const bookingService = new BookingServiceClient();

// Create a user
router.post('/', async (req: Request, res: Response) => {
  try {
    const user = await bookingService.createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await bookingService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 