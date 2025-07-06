import mongoose, { Document, Schema } from 'mongoose';
import { User } from '../domain/User';

interface UserDocument extends Omit<User, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  licenseValidUntil: { type: Date, required: true },
  phone: { type: String },
  address: { type: String },
}, {
  timestamps: true
});



export const UserModel = mongoose.model<UserDocument>('User', UserSchema); 