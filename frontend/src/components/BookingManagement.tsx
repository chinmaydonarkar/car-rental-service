import { useState, useEffect } from 'react';
import type { Booking, User, CarAvailability, CreateBookingRequest } from '../types';
import { apiService } from '../services/api';
import './BookingManagement.css';

function BookingManagementComponent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cars, setCars] = useState<CarAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [formData, setFormData] = useState<CreateBookingRequest>({
    carId: '',
    startDate: '',
    endDate: '',
    licenseNumber: '',
    licenseValidUntil: '',
    totalPrice: 0
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
    if (!formData.startDate || !formData.endDate) return;
    
    try {
      const carData = await apiService.getCarAvailability(formData.startDate, formData.endDate);
      setCars(carData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load car availability');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.createBooking(formData);
      setFormData({
        carId: '',
        startDate: '',
        endDate: '',
        licenseNumber: '',
        licenseValidUntil: '',
        totalPrice: 0
      });
      setShowForm(false);
      setCars([]);
      if (selectedUserId) {
        loadUserBookings(selectedUserId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'startDate' || name === 'endDate') {
      setTimeout(loadCarAvailability, 100);
    }
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
        <form className="booking-form" onSubmit={handleSubmit}>


          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">📅 Start Date:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">📅 End Date:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {cars.length > 0 && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="carId">🚗 Select Car:</label>
                <select
                  id="carId"
                  name="carId"
                  value={formData.carId}
                  onChange={handleInputChange}
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
            <div className="form-group">
              <label htmlFor="licenseNumber">🚗 License Number:</label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                required
                placeholder="Enter license number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="licenseValidUntil">📅 License Valid Until:</label>
              <input
                type="date"
                id="licenseValidUntil"
                name="licenseValidUntil"
                value={formData.licenseValidUntil}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="totalPrice">💰 Total Price:</label>
              <input
                type="number"
                id="totalPrice"
                name="totalPrice"
                value={formData.totalPrice}
                onChange={handleInputChange}
                step="0.01"
                required
                placeholder="Enter total price"
              />
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? '⏳ Creating...' : '✅ Create Booking'}
          </button>
        </form>
      )}

      {error && <div className="error">⚠️ {error}</div>}

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