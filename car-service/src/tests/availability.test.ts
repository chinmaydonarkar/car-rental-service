import 'dotenv/config';
import request from 'supertest';
import mongoose from 'mongoose';
import { CarModel } from '../infrastructure/CarModel';
import { app } from '../api/index';

describe('GET /cars/availability', () => {
  beforeAll(async () => {
    // Use the same connection string as the main app
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carental';
    await mongoose.connect(MONGODB_URI);
    
    // Check if we have cars data, if not create test data
    const carCount = await CarModel.countDocuments();
    if (carCount === 0) {
      console.log('No cars found, creating test data...');
      await CarModel.insertMany([
        {
          brand: 'Toyota',
          carModel: 'Yaris',
          stock: 3,
          prices: { peak: 98.43, mid: 76.89, off: 53.65 },
        },
      ]);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should return available cars with pricing', async () => {
    const res = await request(app)
      .get('/cars/availability?start=2024-06-10&end=2024-06-12');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('brand');
    expect(res.body[0]).toHaveProperty('totalPrice');
    expect(res.body[0]).toHaveProperty('avgDayPrice');
  });
}); 