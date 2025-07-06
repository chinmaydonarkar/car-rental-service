import { useState } from 'react';
import type { CarAvailability } from '../types';
import { apiService } from '../services/api';
import './CarAvailability.css';

function CarAvailabilityComponent() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cars, setCars] = useState<CarAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let carData = await apiService.getCarAvailability(startDate, endDate);
      setCars(carData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch car availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="car-availability">
      <h2>🚗 Check Car Availability</h2>
      
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
          {loading ? '🔍 Searching...' : '🚀 Search Available Cars'}
        </button>
      </div>

      {error && <div className="error">⚠️ {error}</div>}

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