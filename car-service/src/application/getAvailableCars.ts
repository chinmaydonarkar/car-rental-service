import { CarModel } from '../infrastructure/CarModel';
import { getSeasonsInRange } from '../domain/seasonUtils';
import axios from 'axios';

interface BookingData {
  carId: string;
  startDate: string;
  endDate: string;
  status: string;
}

export async function getAvailableCars(startDate: Date, endDate: Date) {
  const cars = await CarModel.find();
  const seasons = getSeasonsInRange(startDate, endDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Get all confirmed bookings for the date range from booking service
  let confirmedBookings: BookingData[] = [];
  try {
    const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';
    const response = await axios.get(`${bookingServiceUrl}/bookings/confirmed`, {
      params: { startDate, endDate }
    });
    confirmedBookings = response.data as BookingData[];
  } catch (error) {
    console.error('Failed to fetch bookings from booking service:', error);
    // Fallback to assuming no bookings if service is unavailable
    confirmedBookings = [];
  }

  return cars.map(car => {
    // Calculate total price for the period
    let total = 0;
    let dayCounts: Record<string, number> = { peak: 0, mid: 0, off: 0 };
    let current = new Date(startDate);
    while (current <= endDate) {
      const season = getSeasonsInRange(current, current)[0];
      total += car.prices[season];
      dayCounts[season]++;
      current.setDate(current.getDate() + 1);
    }

    // Calculate actual availability by counting confirmed bookings for this car
    const carBookings = confirmedBookings.filter(booking => 
      booking.carId === (car._id as any).toString() &&
      new Date(booking.startDate) <= endDate &&
      new Date(booking.endDate) >= startDate
    );
    
    const bookedCount = carBookings.length;
    const available = Math.max(0, car.stock - bookedCount);

    return {
      _id: (car._id as any)?.toString() || '',
      brand: car.brand,
      carModel: car.carModel,
      available: available,
      totalStock: car.stock,
      bookedCount: bookedCount,
      totalPrice: total,
      avgDayPrice: total / days,
      dayCounts,
    };
  }).filter(car => car.available > 0); // Only return cars with availability > 0
} 