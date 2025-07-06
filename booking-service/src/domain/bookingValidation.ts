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
  
  // if (startDate <= new Date()) {
  //   throw new BookingValidationError('Cannot book for past dates');
  // }
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