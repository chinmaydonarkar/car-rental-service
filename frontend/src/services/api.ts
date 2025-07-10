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

  // DRY: Helper for response parsing and error throwing
  private async parseResponse<T>(response: Response, defaultErrorMsg: string): Promise<T> {
    let data: any = null;
    try {
      data = await response.json();
    } catch {
      // ignore if no body
    }
    if (!response.ok) {
      throw new Error((data && data.error) || defaultErrorMsg);
    }
    return data;
  }

  // Authentication methods
  async register(userData: CreateUserRequest): Promise<AuthUser> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    
    try {
      return await this.parseResponse<AuthUser>(response, 'Registration failed');
    } catch (error) {
      // Provide more specific error messages for common registration issues
      if (error instanceof Error) {
        if (error.message.includes('email')) {
          throw new Error('An account with this email already exists. Please use a different email or try logging in.');
        } else if (error.message.includes('license')) {
          throw new Error('Invalid license information. Please check your license number and expiry date.');
        } else if (error.message.includes('password')) {
          throw new Error('Password does not meet requirements. Please ensure it has at least 8 characters, one uppercase letter, one lowercase letter, and one number.');
        }
      }
      throw error;
    }
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(loginData),
    });
    const result = await this.parseResponse<LoginResponse>(response, 'Login failed');
    this.setToken(result.token);
    return result;
  }

  async getCurrentUser(): Promise<AuthUser> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getHeaders(),
    });
    return this.parseResponse<AuthUser>(response, 'Failed to get user');
  }

  logout() {
    this.clearToken();
  }

  // Car availability
  async getCarAvailability(startDate: string, endDate: string): Promise<CarAvailability[]> {
    const response = await fetch(
      `${API_BASE_URL}/cars/availability?start=${startDate}&end=${endDate}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.parseResponse<CarAvailability[]>(response, 'Failed to fetch car availability');
  }

  // Customer booking methods
  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(bookingData),
    });
    const data = await this.parseResponse<any>(response, 'Failed to create booking');
    // Provide more specific error messages
    if (data.error && typeof data.error === 'string') {
      if (data.error.includes('already have a confirmed booking')) {
        throw new Error('You already have a confirmed booking for these dates. Please cancel your existing booking first.');
      } else if (data.error.includes('already have a booking on these dates')) {
        throw new Error('You already have a booking on these dates. You cannot have multiple bookings for the same time period.');
      }
    }
    return data;
  }

  async getMyBookings(): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
      headers: this.getHeaders(),
    });
    return this.parseResponse<Booking[]>(response, 'Failed to fetch bookings');
  }

  async cancelMyBooking(bookingId: string): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.parseResponse<Booking>(response, 'Failed to cancel booking');
  }

  // Admin methods (for admin panel)
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.parseResponse<User>(response, 'Failed to create user');
  }

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getHeaders(),
    });
    return this.parseResponse<User[]>(response, 'Failed to fetch users');
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}`, {
      headers: this.getHeaders(),
    });
    return this.parseResponse<Booking[]>(response, 'Failed to fetch user bookings');
  }

  async cancelBooking(bookingId: string, userId: string): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId }),
    });
    return this.parseResponse<Booking>(response, 'Failed to cancel booking');
  }
}

export const apiService = new ApiService(); 