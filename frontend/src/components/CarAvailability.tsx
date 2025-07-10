import { useState } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { carSearchSchema } from '../utils/validations';
import type { CarSearchData } from '../utils/validations';
import type { CarAvailability } from '../types';
import { apiService } from '../services/api';
import FormField from './common/FormField';
import './CarAvailability.css';

function CarAvailabilityComponent() {
  const [cars, setCars] = useState<CarAvailability[]>([]);
  const [error, setError] = useState('');

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
      setError('');
      try {
        let carData = await apiService.getCarAvailability(data.startDate, data.endDate);
        setCars(carData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch car availability');
      }
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

  return (
    <div className="car-availability">
      <h2>🚗 Check Car Availability</h2>
      
      <form onSubmit={handleSearchSubmit} className="search-form">
        {getSearchFieldError('form') && <div className="error-message">⚠️ {getSearchFieldError('form')}</div>}
        
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
          {searchLoading ? '🔍 Searching...' : '🚀 Search Available Cars'}
        </button>
      </form>

      {error && <div className="error-message">⚠️ {error}</div>}

      {cars.length > 0 && (
        <div className="results">
          <h3>✨ Available Cars</h3>
          <div className="cars-grid">
            {cars.map((car, index) => (
              <div key={index} className="car-card">
                <h4>🚙 {car.brand} {car.carModel}</h4>
                <div className="car-details">
                  <p>
                    <strong>Available:</strong>
                    <span className={car.available === 0 ? 'out-of-stock' : 'in-stock'}>
                      {car.available} units
                    </span>
                  </p>
                  {car.totalStock !== undefined && (
                    <p>
                      <strong>Total Stock:</strong>
                      <span>{car.totalStock} units</span>
                    </p>
                  )}
                  {car.bookedCount !== undefined && (
                    <p>
                      <strong>Currently Booked:</strong>
                      <span>{car.bookedCount} units</span>
                    </p>
                  )}
                  <p>
                    <strong>Total Price:</strong>
                    <span>${car.totalPrice.toFixed(2)}</span>
                  </p>
                  <p>
                    <strong>Avg. Daily Price:</strong>
                    <span>${car.avgDayPrice.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CarAvailabilityComponent; 