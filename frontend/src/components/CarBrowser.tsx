import { useState } from 'react';
import type { AuthUser, CarAvailability, CreateBookingRequest } from '../types';
import { apiService } from '../services/api';
import './CarAvailability.css';

interface CarBrowserProps {
  user: AuthUser;
}

function CarBrowser({ user }: CarBrowserProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cars, setCars] = useState<CarAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookingCar, setBookingCar] = useState<CarAvailability | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const carData = await apiService.getCarAvailability(startDate, endDate);
      setCars(carData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch car availability');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (car: CarAvailability) => {
    setBookingCar(car);
    setSuccess('');
    setError('');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCar) return;
    setBookingLoading(true);
    setError('');
    setSuccess('');
    try {
      const bookingReq: CreateBookingRequest = {
        carId: `${bookingCar.brand}-${bookingCar.carModel}`,
        startDate,
        endDate,
        licenseNumber: user.licenseNumber,
        licenseValidUntil: user.licenseValidUntil,
        totalPrice: bookingCar.totalPrice,
      };
      await apiService.createBooking(bookingReq);
      setSuccess('Booking successful! Check your bookings tab.');
      setBookingCar(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="car-availability">
      <h2>🔍 Search & Book Cars</h2>
      <div className="search-form">
        <div className="form-group">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split('T')[0]}
          />
        </div>
        <button 
          className="search-button" 
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? '🔍 Searching...' : '🚀 Search Cars'}
        </button>
      </div>
      {error && <div className="error">⚠️ {error}</div>}
      {success && <div className="success">✅ {success}</div>}
      {cars.length > 0 && (
        <div className="results">
          <h3>✨ Available Cars</h3>
          <div className="cars-grid">
            {cars.map((car, index) => (
              <div key={index} className="car-card">
                <h4>🚙 {car.brand} {car.carModel}</h4>
                <div className="car-details">
                  <p><strong>Available:</strong> <span>{car.available} units</span></p>
                  <p><strong>Total Price:</strong> <span>${car.totalPrice.toFixed(2)}</span></p>
                  <p><strong>Avg. Daily Price:</strong> <span>${car.avgDayPrice.toFixed(2)}</span></p>
                </div>
                <button 
                  className="search-button"
                  style={{ marginTop: '1rem' }}
                  onClick={() => handleBook(car)}
                  disabled={car.available === 0}
                >
                  {car.available === 0 ? 'Out of Stock' : 'Book Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {bookingCar && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Booking</h3>
            <form onSubmit={handleBookingSubmit}>
              <p><strong>Car:</strong> {bookingCar.brand} {bookingCar.carModel}</p>
              <p><strong>Dates:</strong> {startDate} to {endDate}</p>
              <p><strong>Total Price:</strong> ${bookingCar.totalPrice.toFixed(2)}</p>
              <button type="submit" className="submit-button" disabled={bookingLoading}>
                {bookingLoading ? '⏳ Booking...' : '✅ Confirm Booking'}
              </button>
              <button type="button" className="submit-button" style={{ background: '#eee', color: '#333', marginTop: 8 }} onClick={() => setBookingCar(null)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarBrowser; 