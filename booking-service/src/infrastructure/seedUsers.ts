import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { UserModel } from './UserModel';

const users = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    licenseNumber: 'DL123456789',
    licenseValidUntil: new Date('2025-12-31'),
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    licenseNumber: 'DL987654321',
    licenseValidUntil: new Date('2026-06-30'),
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    password: 'password123',
    licenseNumber: 'DL555666777',
    licenseValidUntil: new Date('2024-08-15'), // Expired license for testing
  },
];

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carental';
  await mongoose.connect(MONGODB_URI);
  await UserModel.deleteMany({});
  
  // Hash passwords before inserting
  const hashedUsers = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 10)
    }))
  );
  
  await UserModel.insertMany(hashedUsers);
  console.log('Seeded users');
  await mongoose.disconnect();
}

seed(); 