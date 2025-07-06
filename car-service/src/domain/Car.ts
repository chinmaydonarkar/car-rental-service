export type Season = 'peak' | 'mid' | 'off';

export interface Car {
  brand: string;
  carModel: string;
  stock: number;
  prices: {
    peak: number;
    mid: number;
    off: number;
  };
} 