import { Router } from 'express';
import { BookingServiceClient } from '../services/bookingService';

const router = Router();
const bookingService = new BookingServiceClient();

// Create a user
router.post('/', async (req: any, res: any) => {
  try {
    const user = await bookingService.createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/', async (req: any, res: any) => {
  try {
    const users = await bookingService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 