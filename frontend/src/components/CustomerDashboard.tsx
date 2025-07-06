import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { CarAvailability, Booking, AuthUser } from '../types';
import './CustomerDashboard.css';

interface CustomerDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function CustomerDashboard({ user, onLogout }: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-bookings'>('browse');
  const [cars, setCars] = useState<CarAvailability[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Booking form state
  const [selectedCar, setSelectedCar] = useState<CarAvailability | null>(null);
  const [bookingForm, setBookingForm] = useState({
    startDate: '',
    endDate: '',
    licenseNumber: user.licenseNumber,
    licenseValidUntil: user.licenseValidUntil
  });

  useEffect(() => {
    if (activeTab === 'my-bookings') {
      loadMyBookings();
    }
  }, [activeTab]);

  const loadMyBookings = async () => {
    try {
      const bookings = await apiService.getMyBookings();
      setMyBookings(bookings);
    } catch (err) {
      setError('Failed to load your bookings');
    }
  };

  const handleSearchCars = async () => {
    if (!bookingForm.startDate || !bookingForm.endDate) {
      setError('Please select start and end dates');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const availableCars = await apiService.getCarAvailability(
        bookingForm.startDate,
        bookingForm.endDate
      );
      setCars(availableCars);
      setActiveTab('browse');
    } catch (err) {
      setError('Failed to fetch available cars');
    } finally {
      setLoading(false);
    }
  };

  const handleBookCar = async (car: CarAvailability) => {
    setSelectedCar(car);
  };

  const handleConfirmBooking = async () => {
    if (!selectedCar) return;

    setLoading(true);
    setError('');

    try {
      const bookingData = {
        carId: selectedCar._id || '',
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
        licenseNumber: bookingForm.licenseNumber,
        licenseValidUntil: bookingForm.licenseValidUntil,
        totalPrice: selectedCar.totalPrice
      };

      await apiService.createBooking(bookingData);
      setSelectedCar(null);
      setCars([]);
      setBookingForm({
        startDate: '',
        endDate: '',
        licenseNumber: user.licenseNumber,
        licenseValidUntil: user.licenseValidUntil
      });
      alert('Booking confirmed successfully! 🎉');
      loadMyBookings();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create booking';
      
      // Show user-friendly alert based on error type
      if (errorMessage.includes('already have a confirmed booking')) {
        alert('⚠️ Booking Conflict!\n\nYou already have a confirmed booking for these dates.\n\nPlease cancel your existing booking first, then try booking again.');
      } else if (errorMessage.includes('already have a booking on these dates')) {
        alert('⚠️ Booking Conflict!\n\nYou already have a booking on these dates.\n\nYou cannot have multiple bookings for the same time period.');
      } else {
        alert(`❌ Booking Error\n\n${errorMessage}`);
      }
      
      setError(errorMessage);
      // Close the modal when there's an error
      setSelectedCar(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await apiService.cancelMyBooking(bookingId);
      loadMyBookings();
      alert('Booking cancelled successfully');
    } catch (err) {
      setError('Failed to cancel booking');
    }
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // If same day booking, return 1 day minimum
    return days === 0 ? 1 : days;
  };

  return (
    <div className="customer-dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          <h1>🚗 Welcome, {user.name}!</h1>
          <p>Ready to find your perfect ride?</p>
        </div>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={`nav-button ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          🚗 Browse Cars
        </button>
        <button 
          className={`nav-button ${activeTab === 'my-bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-bookings')}
        >
          📋 My Bookings
        </button>
      </nav>

      <main className="dashboard-main">
        {error && <div className="error-message">{error}</div>}

        {activeTab === 'browse' && (
          <div className="browse-section">
            <div className="search-form">
              <h2>🔍 Find Available Cars</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={bookingForm.startDate}
                    onChange={(e) => setBookingForm({
                      ...bookingForm,
                      startDate: e.target.value
                    })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={bookingForm.endDate}
                    onChange={(e) => setBookingForm({
                      ...bookingForm,
                      endDate: e.target.value
                    })}
                    min={bookingForm.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <button 
                  onClick={handleSearchCars}
                  disabled={loading}
                  className="search-button"
                >
                  {loading ? 'Searching...' : 'Search Cars'}
                </button>
              </div>
            </div>

            {cars.length > 0 && (
              <div className="cars-grid">
                <h3>Available Cars</h3>
                <div className="cars-list">
                  {cars.map((car, index) => (
                    <div key={index} className="car-card">
                      <div className="car-info">
                        <h4>{car.brand} {car.carModel}</h4>
                        <p>Available: {car.available} cars</p>
                        <p>Price per day: ${car.avgDayPrice}</p>
                        <p className="total-price">Total: ${car.totalPrice}</p>
                      </div>
                      <button 
                        onClick={() => handleBookCar(car)}
                        className="book-button"
                      >
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-bookings' && (
          <div className="bookings-section">
            <h2>📋 My Bookings</h2>
            {myBookings.length === 0 ? (
              <p className="no-bookings">No bookings found. Start by browsing available cars!</p>
            ) : (
              <div className="bookings-list">
                {myBookings.map((booking) => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-info">
                      <h4>Booking #{booking._id.slice(-6)}</h4>
                      <p>Dates: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                      <p>Duration: {calculateDays(booking.startDate, booking.endDate)} days</p>
                      <p>Total Price: ${booking.totalPrice}</p>
                      <p className={`status ${booking.status}`}>
                        Status: {booking.status}
                      </p>
                    </div>
                    {booking.status === 'confirmed' && (
                      <button 
                        onClick={() => handleCancelBooking(booking._id)}
                        className="cancel-button"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {selectedCar && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Booking</h3>
            <div className="booking-details">
              <p><strong>Car:</strong> {selectedCar.brand} {selectedCar.carModel}</p>
              <p><strong>Dates:</strong> {bookingForm.startDate} to {bookingForm.endDate}</p>
              <p><strong>Duration:</strong> {calculateDays(bookingForm.startDate, bookingForm.endDate)} days</p>
              <p><strong>Total Price:</strong> ${selectedCar.totalPrice}</p>
            </div>
            
            {/* Show warning if user has existing bookings for these dates */}
            {myBookings.some(booking => 
              booking.startDate === bookingForm.startDate && 
              booking.endDate === bookingForm.endDate &&
              booking.status === 'confirmed'
            ) && (
              <div className="booking-warning">
                <p>⚠️ You already have a confirmed booking for these dates!</p>
                <p>Please cancel your existing booking first.</p>
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                onClick={handleConfirmBooking}
                disabled={loading}
                className="confirm-button"
              >
                {loading ? 'Confirming...' : 'Confirm Booking'}
              </button>
              <button 
                onClick={() => setSelectedCar(null)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 