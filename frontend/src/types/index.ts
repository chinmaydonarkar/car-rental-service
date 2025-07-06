export interface Car {
  _id: string;
  brand: string;
  carModel: string;
  stock: number;
  prices: {
    peak: number;
    mid: number;
    off: number;
  };
}

export interface CarAvailability {
  _id: string;
  brand: string;
  carModel: string;
  available: number;
  totalStock?: number;
  bookedCount?: number;
  totalPrice: number;
  avgDayPrice: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
  licenseValidUntil: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
  licenseValidUntil: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  licenseNumber: string;
  licenseValidUntil: string;
  phone?: string;
  address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface Booking {
  _id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  licenseNumber: string;
  licenseValidUntil: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  carId: string;
  startDate: string;
  endDate: string;
  licenseNumber: string;
  licenseValidUntil: string;
  totalPrice: number;
} 