import axios, { AxiosInstance } from 'axios';

export interface AxiosConfigOptions {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  setupInterceptors?: (instance: AxiosInstance) => void;
}

export function createAxiosInstance(options: AxiosConfigOptions): AxiosInstance {
  const instance = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeout ?? 5000,
    headers: options.headers,
  });

  if (options.setupInterceptors) {
    options.setupInterceptors(instance);
  }

  return instance;
} 