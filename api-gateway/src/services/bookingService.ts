import axios from 'axios';

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';

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

export class BookingServiceClient {
  // Authentication methods
  async register(userData: CreateUserRequest): Promise<AuthUser> {
    try {
      const response = await axios.post(`${BOOKING_SERVICE_URL}/auth/register`, userData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Registration error: ${error.response.data.error || error.message}`);
      }
      throw new Error('Booking service unavailable');
    }
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${BOOKING_SERVICE_URL}/auth/login`, loginData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Login error: ${error.response.data.error || error.message}`);
      }
      throw new Error('Booking service unavailable');
    }
  }

  async getCurrentUser(token: string): Promise<AuthUser> {
    try {
      const response = await axios.get(`${BOOKING_SERVICE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Authentication error: ${error.response.data.error || error.message}`);
      }
      throw new Error('Booking service unavailable');
    }
  }

  // Customer booking methods (authenticated)
  async createBooking(bookingData: CreateBookingRequest, token: string): Promise<Booking> {
    try {
      const response = await axios.post(`${BOOKING_SERVICE_URL}/bookings`, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Booking service error: ${error.response.data.error || error.message}`);
      }
      throw new Error('Booking service unavailable');
    }
  }

  async getMyBookings(token: string): Promise<Booking[]> {
    try {
      const response = await axios.get(`${BOOKING_SERVICE_URL}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Booking service error: ${error.response.data.error || error.message}`);
      }
      throw new Error('Booking service unavailable');
    }
  }

  async cancelMyBooking(bookingId: string, token: string): Promise<Booking> {
    try {
      const response = await axios.patch(`${BOOKING_SERVICE_URL}/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Booking service error: ${error.response.data.error || error.message}`);
      }
      throw new Error('Booking service unavailable');
    }
  }

  // Admin methods (for admin panel)
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await axios.post(`${BOOKING_SERVICE_URL}/users`, userData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Booking service error: ${error.response.data.error || error.message}`);
      }
      throw new Error('Booking service unavailable');
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get(`${BOOKING_SERVICE_URL}/users`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Booking service error: ${error.response.data.error || error.message}`);
      }
      throw new Error('Booking service unavailable');
    }
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const response = await axios.get(`${BOOKING_SERVICE_URL}/bookings/user/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Booking service error: ${error.response.data.error || error.message}`);
      }
      throw new Error('Booking service unavailable');
    }
  }

  async cancelBooking(bookingId: string, userId: string): Promise<Booking> {
    try {
      const response = await axios.patch(`${BOOKING_SERVICE_URL}/bookings/${bookingId}/cancel`, {
        userId
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Booking service error: ${error.response.data.error || error.message}`);
      }
      throw new Error('Booking service unavailable');
    }
  }
} 