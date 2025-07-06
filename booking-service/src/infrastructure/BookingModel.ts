import mongoose, { Document, Schema } from 'mongoose';
import { Booking } from '../domain/Booking';

interface BookingDocument extends Booking, Document {}

const BookingSchema = new Schema<BookingDocument>({
  userId: { type: String, required: true, index: true },
  carId: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  licenseNumber: { type: String, required: true },
  licenseValidUntil: { type: Date, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
}, {
  timestamps: true
});

// Index for efficient queries (no unique constraint - validation handled in application logic)
BookingSchema.index({ userId: 1, startDate: 1, endDate: 1, status: 1 });

export const BookingModel = mongoose.model<BookingDocument>('Booking', BookingSchema); 