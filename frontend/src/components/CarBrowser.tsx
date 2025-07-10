import { useState } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { carSearchSchema, bookingConfirmationSchema } from '../utils/validations';
import type { CarSearchData, BookingConfirmationData } from '../utils/validations';
import type { AuthUser, CarAvailability, CreateBookingRequest } from '../types';
import { apiService } from '../services/api';
import FormField from './common/FormField';
import './CarAvailability.css';

interface CarBrowserProps {
  user: AuthUser;
}

function CarBrowser({ user }: CarBrowserProps) {
  const [cars, setCars] = useState<CarAvailability[]>([]);
  const [success, setSuccess] = useState('');
  const [bookingCar, setBookingCar] = useState<CarAvailability | null>(null);

  const {
    formData: searchData,
    errors: searchErrors,
    loading: searchLoading,
    updateField: updateSearchField,
    validateField: validateSearchField,
    handleSubmit: handleSearchSubmit,
    getFieldError: getSearchFieldError,
    clearErrors: clearSearchErrors
  } = useFormValidation<CarSearchData>({
    schema: carSearchSchema,
    initialData: {
      startDate: '',
      endDate: ''
    },
    onSubmit: async (data) => {
      console.log('Search form submitted with data:', data);
      const carData = await apiService.getCarAvailability(data.startDate, data.endDate);
      setCars(carData);
      setSuccess('Cars found successfully!');
    }
  });



  const {
    formData: bookingData,
    errors: bookingErrors,
    loading: bookingLoading,
    updateField: updateBookingField,
    validateField: validateBookingField,
    handleSubmit: handleBookingSubmit,
    getFieldError: getBookingFieldError
  } = useFormValidation<BookingConfirmationData>({
    schema: bookingConfirmationSchema,
    initialData: {
      carId: '',
      startDate: '',
      endDate: '',
      licenseNumber: user.licenseNumber,
      licenseValidUntil: user.licenseValidUntil,
      totalPrice: 0
    }
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSearchField(name as keyof CarSearchData, value);
    clearSearchErrors();
  };

  const handleSearchBlur = (fieldName: keyof CarSearchData) => {
    validateSearchField(fieldName);
  };

  const handleBook = (car: CarAvailability) => {
    setBookingCar(car);
    setSuccess('');
    updateBookingField('carId', `${car.brand}-${car.carModel}`);
    updateBookingField('startDate', searchData.startDate);
    updateBookingField('endDate', searchData.endDate);
    updateBookingField('totalPrice', car.totalPrice);
  };

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateBookingField(name as keyof BookingConfirmationData, value);
  };

  const handleBookingBlur = (fieldName: keyof BookingConfirmationData) => {
    validateBookingField(fieldName);
  };

  const handleBookingFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingCar) return;

    const bookingReq: CreateBookingRequest = {
      carId: bookingData.carId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      licenseNumber: bookingData.licenseNumber,
      licenseValidUntil: bookingData.licenseValidUntil,
      totalPrice: bookingData.totalPrice,
    };

    try {
      await apiService.createBooking(bookingReq);
      setSuccess('Booking successful! Check your bookings tab.');
      setBookingCar(null);
    } catch (error) {
      // Error will be handled by the validation hook
      throw error;
    }
  };

  const searchFormError = getSearchFieldError('form');
  const bookingFormError = getBookingFieldError('form');

  return (
    <div className="car-availability">
      <h2>🔍 Search & Book Cars</h2>
      
      <form onSubmit={handleSearchSubmit} className="search-form">
        {searchFormError && <div className="error-message">⚠️ {searchFormError}</div>}

        
        <FormField
          label="Start Date"
          id="startDate"
          name="startDate"
          type="date"
          value={searchData.startDate}
          onChange={handleSearchChange}
          onBlur={() => handleSearchBlur('startDate')}
          required
          min={new Date().toISOString().split('T')[0]}
          error={getSearchFieldError('startDate')}
        />

        <FormField
          label="End Date"
          id="endDate"
          name="endDate"
          type="date"
          value={searchData.endDate}
          onChange={handleSearchChange}
          onBlur={() => handleSearchBlur('endDate')}
          required
          min={searchData.startDate || new Date().toISOString().split('T')[0]}
          error={getSearchFieldError('endDate')}
        />

        <button 
          className="search-button" 
          type="submit"
          disabled={searchLoading}
        >
          {searchLoading ? '🔍 Searching...' : '🚀 Search Cars'}
        </button>
        

      </form>

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
            <form onSubmit={handleBookingFormSubmit}>
              {bookingFormError && <div className="error-message">⚠️ {bookingFormError}</div>}
              
              <p><strong>Car:</strong> {bookingCar.brand} {bookingCar.carModel}</p>
              <p><strong>Dates:</strong> {bookingData.startDate} to {bookingData.endDate}</p>
              <p><strong>Total Price:</strong> ${bookingData.totalPrice.toFixed(2)}</p>
              
              <FormField
                label="License Number"
                id="bookingLicenseNumber"
                name="licenseNumber"
                type="text"
                value={bookingData.licenseNumber}
                onChange={handleBookingChange}
                onBlur={() => handleBookingBlur('licenseNumber')}
                required
                pattern="[A-Z0-9]+"
              />

              <FormField
                label="License Valid Until"
                id="bookingLicenseValidUntil"
                name="licenseValidUntil"
                type="date"
                value={bookingData.licenseValidUntil}
                onChange={handleBookingChange}
                onBlur={() => handleBookingBlur('licenseValidUntil')}
                required
                min={new Date().toISOString().split('T')[0]}
              />

              <button type="submit" className="submit-button" disabled={bookingLoading}>
                {bookingLoading ? '⏳ Booking...' : '✅ Confirm Booking'}
              </button>
              <button 
                type="button" 
                className="submit-button" 
                style={{ background: '#eee', color: '#333', marginTop: 8 }} 
                onClick={() => setBookingCar(null)}
              >
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