import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { getAvailableCars } from '../application/getAvailableCars';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carental';

app.get('/cars/availability', async (req: any, res: any) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'start and end query params required' });
  }
  try {
    const startDate = new Date(start as string);
    const endDate = new Date(end as string);
    const cars = await getAvailableCars(startDate, endDate);
    res.json(cars);
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Car service running on port ${PORT}`));
}

export { app, mongoose };