import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { UserModel } from '../infrastructure/UserModel';
import { BookingModel } from '../infrastructure/BookingModel';
import { app } from '../api/index';
import { AuthService } from '../application/authService';

describe('Booking Service', () => {
  let testUser: any;
  let testUserToken: string;
  let testCarId = 'car123';
  let authService: AuthService;
  let testUserId: string;
  let testRunId: string;

  beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carental';
    await mongoose.connect(MONGODB_URI);
    
    // Generate unique test run ID to avoid conflicts
    testRunId = Date.now().toString();
    
    // Don't clear production data - just create test user if needed
    authService = new AuthService();
    
    // Create test user with unique data for this test run
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    testUser = await UserModel.create({
      name: `Test User ${testRunId}`,
      email: `test${testRunId}@example.com`,
      password: hashedPassword,
      licenseNumber: `DL${testRunId}`, // Unique license number
      licenseValidUntil: new Date('2025-12-31'),
    });
    
    testUserId = testUser.id;

    // Login to get token
    const loginResult = await authService.login({
      email: `test${testRunId}@example.com`,
      password: 'testpassword123'
    });
    testUserToken = loginResult.token;
  });

  afterAll(async () => {
    // Clean up test data only
    await BookingModel.deleteMany({ userId: testUserId });
    await UserModel.findByIdAndDelete(testUserId);
    await mongoose.disconnect();
  });

  describe('POST /bookings', () => {
    it('should create a booking successfully', async () => {
      const bookingData = {
        userId: testUser.id,
        carId: testCarId,
        startDate: '2024-07-15',
        endDate: '2024-07-17',
        licenseNumber: testUser.licenseNumber,
        licenseValidUntil: '2025-12-31',
        totalPrice: 295.29
      };

      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(bookingData);

      expect(res.status).toBe(201);
      expect(res.body.userId).toBe(testUser.id);
      expect(res.body.carId).toBe(testCarId);
      expect(res.body.status).toBe('confirmed');
    });

    it('should reject booking with expired license', async () => {
      const bookingData = {
        userId: testUser.id,
        carId: testCarId,
        startDate: '2024-07-15',
        endDate: '2024-07-17',
        licenseNumber: testUser.licenseNumber,
        licenseValidUntil: '2024-06-30', // Expired
        totalPrice: 295.29
      };

      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(bookingData);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Driving license must be valid through all booking period');
    });

    it('should reject duplicate booking for same user on overlapping dates', async () => {
      // First booking
      const bookingData1 = {
        userId: testUser.id,
        carId: testCarId,
        startDate: '2024-08-01',
        endDate: '2024-08-03',
        licenseNumber: testUser.licenseNumber,
        licenseValidUntil: '2025-12-31',
        totalPrice: 295.29
      };

      await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(bookingData1);

      // Second booking with overlapping dates
      const bookingData2 = {
        userId: testUser.id,
        carId: 'car456',
        startDate: '2024-08-02', // Overlaps with first booking
        endDate: '2024-08-04',
        licenseNumber: testUser.licenseNumber,
        licenseValidUntil: '2025-12-31',
        totalPrice: 350.00
      };

      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(bookingData2);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('You already have a confirmed booking on these dates');
    });

  });

}); 