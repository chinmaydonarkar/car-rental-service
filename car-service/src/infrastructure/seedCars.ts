import 'dotenv/config';
import mongoose from 'mongoose';
import { CarModel } from './CarModel';

const cars = [
  {
    brand: 'Toyota',
    carModel: 'Yaris',
    stock: 3,
    prices: { peak: 98.43, mid: 76.89, off: 53.65 },
  },
  {
    brand: 'Seat',
    carModel: 'Ibiza',
    stock: 5,
    prices: { peak: 85.12, mid: 65.73, off: 46.85 },
  },
  {
    brand: 'Nissan',
    carModel: 'Qashqai',
    stock: 2,
    prices: { peak: 101.46, mid: 82.94, off: 59.87 },
  },
  {
    brand: 'Jaguar',
    carModel: 'e-pace',
    stock: 1,
    prices: { peak: 120.54, mid: 91.35, off: 70.27 },
  },
  {
    brand: 'Mercedes',
    carModel: 'Vito',
    stock: 2,
    prices: { peak: 109.16, mid: 89.64, off: 64.97 },
  },
];

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carental';
  await mongoose.connect(MONGODB_URI);
  await CarModel.deleteMany({});
  await CarModel.insertMany(cars);
  console.log('Seeded cars');
  await mongoose.disconnect();
}

seed(); 