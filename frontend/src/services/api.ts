import type { 
  CarAvailability, 
  User, 
  Booking, 
  CreateUserRequest, 
  LoginRequest, 
  LoginResponse, 
  AuthUser,
  CreateBookingRequest 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Authentication methods
  async register(userData: CreateUserRequest): Promise<AuthUser> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const result = await response.json();
    this.setToken(result.token);
    return result;
  }

  async getCurrentUser(): Promise<AuthUser> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user');
    }

    return response.json();
  }

  logout() {
    this.clearToken();
  }

  // Car availability
  async getCarAvailability(startDate: string, endDate: string): Promise<CarAvailability[]> {
    let response = await fetch(
      `${API_BASE_URL}/cars/availability?start=${startDate}&end=${endDate}`,
      {
        headers: this.getHeaders(),
      }
    );
     
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch car availability');
    }

    return response.json();
  }

  // Customer booking methods
  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || 'Failed to create booking';
      
      // Provide more specific error messages
      if (errorMessage.includes('already have a confirmed booking')) {
        throw new Error('You already have a confirmed booking for these dates. Please cancel your existing booking first.');
      } else if (errorMessage.includes('already have a booking on these dates')) {
        throw new Error('You already have a booking on these dates. You cannot have multiple bookings for the same time period.');
      } else {
        throw new Error(errorMessage);
      }
    }

    return response.json();
  }

  async getMyBookings(): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch bookings');
    }

    return response.json();
  }

  async cancelMyBooking(bookingId: string): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel booking');
    }

    return response.json();
  }

  // Admin methods (for admin panel)
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }

    return response.json();
  }

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch users');
    }

    return response.json();
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user bookings');
    }

    return response.json();
  }

  async cancelBooking(bookingId: string, userId: string): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel booking');
    }

    return response.json();
  }
}

export const apiService = new ApiService(); 