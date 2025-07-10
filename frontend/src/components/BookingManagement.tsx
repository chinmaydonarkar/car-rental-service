import { useState, useEffect } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { bookingConfirmationSchema } from '../utils/validations';
import type { BookingConfirmationData } from '../utils/validations';
import type { Booking, User, CarAvailability, CreateBookingRequest } from '../types';
import { apiService } from '../services/api';
import FormField from './common/FormField';
import './BookingManagement.css';

function BookingManagementComponent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cars, setCars] = useState<CarAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  
  // Form validation for booking creation
  const {
    formData: bookingData,
    errors: bookingErrors,
    loading: bookingLoading,
    updateField: updateBookingField,
    validateField: validateBookingField,
    handleSubmit: handleBookingSubmit,
    getFieldError: getBookingFieldError,
    clearErrors: clearBookingErrors
  } = useFormValidation<BookingConfirmationData>({
    schema: bookingConfirmationSchema,
    initialData: {
      carId: '',
      startDate: '',
      endDate: '',
      licenseNumber: '',
      licenseValidUntil: '',
      totalPrice: 0
    },
    onSubmit: async (data) => {
      try {
        await apiService.createBooking(data as CreateBookingRequest);
        // Reset form
        updateBookingField('carId', '');
        updateBookingField('startDate', '');
        updateBookingField('endDate', '');
        updateBookingField('licenseNumber', '');
        updateBookingField('licenseValidUntil', '');
        updateBookingField('totalPrice', 0);
        setShowForm(false);
        setCars([]);
        if (selectedUserId) {
          loadUserBookings(selectedUserId);
        }
      } catch (err) {
        throw err;
      }
    }
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadUserBookings(selectedUserId);
    }
  }, [selectedUserId]);

  const loadUsers = async () => {
    try {
      const userData = await apiService.getUsers();
      setUsers(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    }
  };

  const loadUserBookings = async (userId: string) => {
    setLoading(true);
    try {
      const bookingData = await apiService.getUserBookings(userId);
      setBookings(bookingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadCarAvailability = async () => {
    if (!bookingData.startDate || !bookingData.endDate) return;
    
    try {
      const carData = await apiService.getCarAvailability(bookingData.startDate, bookingData.endDate);
      setCars(carData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load car availability');
    }
  };

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Convert string to number for totalPrice field
    const fieldValue = name === 'totalPrice' ? parseFloat(value) || 0 : value;
    updateBookingField(name as keyof BookingConfirmationData, fieldValue);
    clearBookingErrors();

    if (name === 'startDate' || name === 'endDate') {
      setTimeout(loadCarAvailability, 100);
    }
  };

  const handleBookingBlur = (fieldName: keyof BookingConfirmationData) => {
    validateBookingField(fieldName);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!selectedUserId) return;
    
    try {
      await apiService.cancelBooking(bookingId, selectedUserId);
      loadUserBookings(selectedUserId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  };

  const selectedUser = users.find(user => user._id === selectedUserId);

  return (
    <div className="booking-management">
      <h2>📅 Booking Management</h2>
      
      <div className="header-section">
        <h3>Manage Bookings</h3>
        <button 
          className="add-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '❌ Cancel' : '➕ Create New Booking'}
        </button>
      </div>

      <div className="user-selection">
        <label htmlFor="userId">👤 Select User:</label>
        <select
          id="userId"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <option value="">Choose a user...</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <form className="booking-form" onSubmit={handleBookingSubmit}>


          {getBookingFieldError('form') && (
            <div className="error">⚠️ {getBookingFieldError('form')}</div>
          )}

          <div className="form-row">
            <FormField
              label="📅 Start Date"
              id="startDate"
              name="startDate"
              type="date"
              value={bookingData.startDate}
              onChange={handleBookingChange}
              onBlur={() => handleBookingBlur('startDate')}
              required
              min={new Date().toISOString().split('T')[0]}
              error={getBookingFieldError('startDate')}
            />

            <FormField
              label="📅 End Date"
              id="endDate"
              name="endDate"
              type="date"
              value={bookingData.endDate}
              onChange={handleBookingChange}
              onBlur={() => handleBookingBlur('endDate')}
              required
              min={bookingData.startDate || new Date().toISOString().split('T')[0]}
              error={getBookingFieldError('endDate')}
            />
          </div>

          {cars.length > 0 && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="carId">🚗 Select Car:</label>
                <select
                  id="carId"
                  name="carId"
                  value={bookingData.carId}
                  onChange={handleBookingChange}
                  required
                >
                  <option value="">Choose a car...</option>
                  {cars.map((car, index) => (
                    <option key={index} value={`${car.brand}-${car.carModel}`}>
                      {car.brand} {car.carModel} - ${car.totalPrice.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="form-row">
            <FormField
              label="🚗 License Number"
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              value={bookingData.licenseNumber}
              onChange={handleBookingChange}
              onBlur={() => handleBookingBlur('licenseNumber')}
              required
              placeholder="Enter license number"
              error={getBookingFieldError('licenseNumber')}
            />

            <FormField
              label="📅 License Valid Until"
              id="licenseValidUntil"
              name="licenseValidUntil"
              type="date"
              value={bookingData.licenseValidUntil}
              onChange={handleBookingChange}
              onBlur={() => handleBookingBlur('licenseValidUntil')}
              required
              min={new Date().toISOString().split('T')[0]}
              error={getBookingFieldError('licenseValidUntil')}
            />
          </div>

          <div className="form-row">
            <FormField
              label="💰 Total Price"
              id="totalPrice"
              name="totalPrice"
              type="number"
              value={bookingData.totalPrice.toString()}
              onChange={handleBookingChange}
              onBlur={() => handleBookingBlur('totalPrice')}
              required
              placeholder="Enter total price"
              error={getBookingFieldError('totalPrice')}
            />
          </div>

          <button type="submit" className="submit-button" disabled={bookingLoading}>
            {bookingLoading ? '⏳ Creating...' : '✅ Create Booking'}
          </button>
        </form>
      )}

      {error && <div className="error-message">⚠️ {error}</div>}

      {selectedUser && (
        <div className="bookings-list">
          <h3>📋 Bookings for {selectedUser.name}</h3>
          {loading ? (
            <p>🔄 Loading bookings...</p>
          ) : bookings.length > 0 ? (
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
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      ❌ Cancel Booking
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>📭 No bookings found for this user.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default BookingManagementComponent; 