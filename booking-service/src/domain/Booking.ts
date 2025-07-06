export interface Booking {
  userId: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  licenseNumber: string;
  licenseValidUntil: Date;
  status: 'confirmed' | 'cancelled';
}

export interface CreateBookingRequest {
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  licenseNumber: string;
  licenseValidUntil: string;
} 