import { useState, useEffect } from 'react';
import type { AuthUser, Booking } from '../types';
import { apiService } from '../services/api';
import './BookingManagement.css';

interface MyBookingsProps {
  user: AuthUser;
}

function MyBookings({ user }: MyBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await apiService.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    setError('');
    setSuccess('');
    try {
      await apiService.cancelMyBooking(bookingId);
      setSuccess('Booking cancelled successfully.');
      loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  };

  return (
    <div className="bookings-list">
      <h3>📋 My Bookings</h3>
      {loading ? (
        <p>🔄 Loading bookings...</p>
      ) : error ? (
        <div className="error-message">⚠️ {error}</div>
      ) : (
        <>
          {success && <div className="success">✅ {success}</div>}
          {bookings.length > 0 ? (
            <div className="bookings-grid">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <h4>📅 Booking #{booking._id.slice(-6)}</h4>
                  <div className="booking-details">
                    <p>
                      <strong>🚗 Car:</strong>
                      <span>{booking.carId}</span>
                    </p>
                    <p>
                      <strong>📅 Dates:</strong>
                      <span>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                    </p>
                    <p>
                      <strong>💰 Total Price:</strong>
                      <span>${booking.totalPrice.toFixed(2)}</span>
                    </p>
                    <p>
                      <strong>📊 Status:</strong>
                      <span className={`status ${booking.status}`}>{booking.status}</span>
                    </p>
                  </div>
                  {booking.status === 'confirmed' && (
                    <button 
                      className="cancel-button"
                      onClick={() => handleCancel(booking._id)}
                    >
                      ❌ Cancel Booking
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>📭 No bookings found.</p>
          )}
        </>
      )}
    </div>
  );
}

export default MyBookings; 