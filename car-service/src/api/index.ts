import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { getAvailableCars } from '../application/getAvailableCars';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carental';

// DRY: Async handler wrapper
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error) => {
      console.error(error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    });
  };
}

app.get('/cars/availability', asyncHandler(async (req: Request, res: Response) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'start and end query params required' });
  }
  const startDate = new Date(start as string);
  const endDate = new Date(end as string);
  const cars = await getAvailableCars(startDate, endDate);
  res.json(cars);
}));

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  (async () => {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
      const PORT = process.env.PORT || 3001;
      app.listen(PORT, () => console.log(`Car service running on port ${PORT}`));
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  })();
}

export { app, mongoose };