import mongoose, { Document, Schema } from 'mongoose';
import { Car } from '../domain/Car';

interface CarDocument extends Car, Document {}

const CarSchema = new Schema<CarDocument>({
  brand: { type: String, required: true },
  carModel: { type: String, required: true },
  stock: { type: Number, required: true },
  prices: {
    peak: { type: Number, required: true },
    mid: { type: Number, required: true },
    off: { type: Number, required: true },
  },
});

export const CarModel = mongoose.model<CarDocument>('Car', CarSchema); 