import axios from 'axios';

const CAR_SERVICE_URL = process.env.CAR_SERVICE_URL || 'http://localhost:3001';

export interface CarAvailability {
  brand: string;
  carModel: string;
  available: number;
  totalPrice: number;
  avgDayPrice: number;
  dayCounts: Record<string, number>;
}

export class CarServiceClient {
  async getCarAvailability(startDate: string, endDate: string): Promise<CarAvailability[]> {
    try {
      const response = await axios.get(`${CAR_SERVICE_URL}/cars/availability`, {
        params: { start: startDate, end: endDate }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Car service error: ${error.response.data.error || error.message}`);
      }
      throw new Error('Car service unavailable');
    }
  }
} 