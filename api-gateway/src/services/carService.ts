import { createAxiosInstance } from '../shared/axiosBase';
import axios from 'axios';

const CAR_SERVICE_URL = process.env.CAR_SERVICE_URL || 'http://localhost:3001';
const carAxios = createAxiosInstance({
  baseURL: CAR_SERVICE_URL,
  timeout: 3000, // Example: custom timeout for car service
  setupInterceptors: (instance) => {
    // Add custom interceptors if needed
  }
});

export interface CarAvailability {
  brand: string;
  carModel: string;
  available: number;
  totalPrice: number;
  avgDayPrice: number;
  dayCounts: Record<string, number>;
}

function handleAxiosError(error: unknown, defaultMsg: string): never {
  if (axios.isAxiosError(error) && error.response) {
    throw new Error(`${defaultMsg}: ${error.response.data.error || error.message}`);
  }
  throw new Error(defaultMsg);
}

export class CarServiceClient {
  async getCarAvailability(startDate: string, endDate: string): Promise<CarAvailability[]> {
    try {
      const response = await carAxios.get('/cars/availability', {
        params: { start: startDate, end: endDate }
      });
      return response.data;
    } catch (error: unknown) {
      handleAxiosError(error, 'Car service unavailable');
    }
  }
} 