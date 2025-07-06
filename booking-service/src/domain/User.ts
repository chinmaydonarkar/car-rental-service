export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string; // For authentication
  licenseNumber: string;
  licenseValidUntil: Date;
  phone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  user: Omit<User, 'password'>;
  token: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
  licenseValidUntil: Date;
  phone?: string;
  address?: string;
} 