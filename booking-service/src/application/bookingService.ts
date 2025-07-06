import { BookingModel } from '../infrastructure/BookingModel';
import { UserModel } from '../infrastructure/UserModel';
import { Booking, CreateBookingRequest } from '../domain/Booking';
import { 
  validateLicenseValidity, 
  validateDateRange, 
  hasDateOverlap,
  BookingValidationError 
} from '../domain/bookingValidation';

export class BookingService {
  async createBooking(bookingData: CreateBookingRequest, totalPrice: number): Promise<Booking> {
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);
    const licenseValidUntil = new Date(bookingData.licenseValidUntil);

    // Validate date range
    validateDateRange(startDate, endDate);

    // Validate license validity
    validateLicenseValidity(licenseValidUntil, startDate, endDate);

    // Check if user exists
    const user = await UserModel.findOne({ 
      licenseNumber: bookingData.licenseNumber,
      licenseValidUntil: licenseValidUntil
    });

    if (!user) {
      throw new BookingValidationError('User not found or license information does not match');
    }

    // Check for existing CONFIRMED bookings for the same user on overlapping dates
    const existingConfirmedBookings = await BookingModel.find({
      userId: user.id,
      status: 'confirmed'
    });

    // Check for any existing CONFIRMED booking for exact same dates
    const existingConfirmedBookingForSameDates = await BookingModel.findOne({
      userId: user.id,
      startDate: startDate,
      endDate: endDate,
      status: 'confirmed'
    });

    // Check for any cancelled bookings for same dates
    const existingCancelledBookingsForSameDates = await BookingModel.find({
      userId: user.id,
      startDate: startDate,
      endDate: endDate,
      status: 'cancelled'
    });

    console.log('Existing confirmed bookings for user:', existingConfirmedBookings.length);
    console.log('Existing confirmed booking for same dates:', existingConfirmedBookingForSameDates ? {
      id: existingConfirmedBookingForSameDates._id,
      status: existingConfirmedBookingForSameDates.status,
      startDate: existingConfirmedBookingForSameDates.startDate,
      endDate: existingConfirmedBookingForSameDates.endDate
    } : 'None');
    console.log('Existing cancelled bookings for same dates:', existingCancelledBookingsForSameDates.length);
    console.log('New booking dates:', { startDate, endDate });

    // Block if there's already a CONFIRMED booking for the same dates
    if (existingConfirmedBookingForSameDates) {
      throw new BookingValidationError('You already have a confirmed booking for these dates. Please cancel the existing booking first.');
    }

    // If there are cancelled bookings for same dates, log it but allow the new booking
    if (existingCancelledBookingsForSameDates.length > 0) {
      console.log(`Found ${existingCancelledBookingsForSameDates.length} cancelled booking(s) for same dates - allowing new booking`);
      console.log('Cancelled booking IDs:', existingCancelledBookingsForSameDates.map(b => b._id));
      
      // Optional: Clean up old cancelled bookings for same dates (keep only the most recent one)
      if (existingCancelledBookingsForSameDates.length > 1) {
        console.log('Multiple cancelled bookings found - keeping only the most recent one');
        const sortedCancelledBookings = existingCancelledBookingsForSameDates.sort((a, b) => 
          (b._id as any).toString().localeCompare((a._id as any).toString())
        );
        
        // Keep the most recent cancelled booking, delete the older ones
        const olderCancelledBookings = sortedCancelledBookings.slice(1);
        for (const oldBooking of olderCancelledBookings) {
          await BookingModel.findByIdAndDelete(oldBooking._id);
          console.log(`Deleted old cancelled booking: ${oldBooking._id}`);
        }
      }
    }

    // Only check for confirmed bookings overlapping (for different date ranges)
    if (hasDateOverlap(startDate, endDate, existingConfirmedBookings)) {
      throw new BookingValidationError('You already have a confirmed booking on these dates. You cannot have multiple bookings for the same time period.');
    }

    // Create the booking
    const booking = new BookingModel({
      userId: user.id,
      carId: bookingData.carId,
      startDate,
      endDate,
      totalPrice,
      licenseNumber: bookingData.licenseNumber,
      licenseValidUntil,
      status: 'confirmed'
    });

    return await booking.save();
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return await BookingModel.find({ userId }).sort({ startDate: 1 });
  }

  async cancelBooking(bookingId: string, userId: string): Promise<Booking> {
    const booking = await BookingModel.findOne({ _id: bookingId, userId });
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    console.log('Cancelling booking:', {
      id: booking._id,
      userId: booking.userId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status
    });

    booking.status = 'cancelled';
    const cancelledBooking = await booking.save();
    
    console.log('Booking cancelled successfully. New status:', cancelledBooking.status);
    return cancelledBooking;
  }

  async getConfirmedBookingsForDateRange(startDate: Date, endDate: Date): Promise<Booking[]> {
    // Get all confirmed bookings that overlap with the given date range
    return await BookingModel.find({
      status: 'confirmed',
      $or: [
        // Booking starts within the range
        { startDate: { $gte: startDate, $lte: endDate } },
        // Booking ends within the range
        { endDate: { $gte: startDate, $lte: endDate } },
        // Booking spans the entire range
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
      ]
    }).select('carId startDate endDate status');
  }
} 