import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import carRoutes from './routes/cars';
import bookingRoutes from './routes/bookings';
import userRoutes from './routes/users';
import authRoutes from './routes/auth';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'API Gateway is running' });
});

// API Routes
app.use('/api/cars', carRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error('API Gateway error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`Car Service URL: ${process.env.CAR_SERVICE_URL || 'http://localhost:3001'}`);
    console.log(`Booking Service URL: ${process.env.BOOKING_SERVICE_URL || 'http://localhost:3002'}`);
  });
}

export { app }; 