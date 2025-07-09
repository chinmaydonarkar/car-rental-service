import { Booking } from './Booking';

export class BookingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingValidationError';
  }
}

export function validateLicenseValidity(licenseValidUntil: Date, startDate: Date, endDate: Date): void {
  if (licenseValidUntil < endDate) {
    throw new BookingValidationError('Driving license must be valid through all booking period');
  }
}

export function validateDateRange(startDate: Date, endDate: Date): void {
  if (startDate > endDate) {
    throw new BookingValidationError('Start date must be before end date');
  }
  
}

export function hasDateOverlap(
  newStart: Date, 
  newEnd: Date, 
  existingBookings: Booking[]
): boolean {
  return existingBookings.some(booking => {
    return (
      (newStart <= booking.endDate && newEnd >= booking.startDate) &&
      booking.status === 'confirmed'
    );
  });
} 

export function validateBookingInput(bookingData: any, totalPrice: any): void {
  if (!bookingData.carId || typeof bookingData.carId !== 'string') {
    throw new BookingValidationError('carId is required and must be a string');
  }
  if (!bookingData.startDate || isNaN(Date.parse(bookingData.startDate))) {
    throw new BookingValidationError('startDate is required and must be a valid date string');
  }
  if (!bookingData.endDate || isNaN(Date.parse(bookingData.endDate))) {
    throw new BookingValidationError('endDate is required and must be a valid date string');
  }
  if (!bookingData.licenseNumber || typeof bookingData.licenseNumber !== 'string') {
    throw new BookingValidationError('licenseNumber is required and must be a string');
  }
  if (!bookingData.licenseValidUntil || isNaN(Date.parse(bookingData.licenseValidUntil))) {
    throw new BookingValidationError('licenseValidUntil is required and must be a valid date string');
  }
  if (typeof totalPrice !== 'number' || isNaN(totalPrice)) {
    throw new BookingValidationError('totalPrice is required and must be a number');
  }
} 