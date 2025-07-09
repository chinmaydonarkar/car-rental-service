import { Router, Request, Response } from 'express';
import { CarServiceClient } from '../services/carService';

const router = Router();
const carService = new CarServiceClient();

// Get car availability
router.get('/availability', async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end query parameters are required' });
    }

    const cars = await carService.getCarAvailability(start as string, end as string);
    res.json(cars);
  } catch (error: any) {
    console.error('Car availability error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 