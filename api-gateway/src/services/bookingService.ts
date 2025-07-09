import { createAxiosInstance } from '../shared/axiosBase';
import axios from 'axios';

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';
const bookingAxios = createAxiosInstance({
  baseURL: BOOKING_SERVICE_URL,
  timeout: 7000, // Example: custom timeout for booking service
  headers: { 'X-Service': 'Booking' },
  setupInterceptors: (instance) => {
    instance.interceptors.response.use(
      response => response,
      error => {
        // Custom error handling
        return Promise.reject(error);
      }
    );
  }
});

export interface CreateBookingRequest {
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  licenseNumber: string;
  licenseValidUntil: string;
  totalPrice: number;
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

export interface User {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
  licenseValidUntil: string;
  createdAt: string;
  updatedAt: string;
}

function handleAxiosError(error: unknown, defaultMsg: string): never {
  if (axios.isAxiosError(error) && error.response) {
    throw new Error(`${defaultMsg}: ${error.response.data.error || error.message}`);
  }
  throw new Error(defaultMsg);
}

export class BookingServiceClient {
  // Authentication methods
  async register(userData: CreateUserRequest): Promise<AuthUser> {
    try {
      const response = await bookingAxios.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Booking service unavailable');
    }
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await bookingAxios.post('/auth/login', loginData);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Booking service unavailable');
    }
  }

  async getCurrentUser(token: string): Promise<AuthUser> {
    try {
      const response = await bookingAxios.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Booking service unavailable');
    }
  }

  // Customer booking methods (authenticated)
  async createBooking(bookingData: CreateBookingRequest, token: string): Promise<Booking> {
    try {
      const response = await bookingAxios.post('/bookings', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Booking service unavailable');
    }
  }

  async getMyBookings(token: string): Promise<Booking[]> {
    try {
      const response = await bookingAxios.get('/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Booking service unavailable');
    }
  }

  async cancelMyBooking(bookingId: string, token: string): Promise<Booking> {
    try {
      const response = await bookingAxios.patch(`/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Booking service unavailable');
    }
  }

  // Admin methods (for admin panel)
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await bookingAxios.post('/users', userData);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Booking service unavailable');
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await bookingAxios.get('/users');
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Booking service unavailable');
    }
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const response = await bookingAxios.get(`/bookings/user/${userId}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Booking service unavailable');
    }
  }

  async cancelBooking(bookingId: string, userId: string): Promise<Booking> {
    try {
      const response = await bookingAxios.patch(`/bookings/${bookingId}/cancel`, {
        userId
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Booking service unavailable');
    }
  }
} 