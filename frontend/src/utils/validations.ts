import { z } from 'zod';

// Shared validation schemas following DRY principles
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email is too long');

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase & number')
  .max(128, 'Password is too long');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters long')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces. Example: "John Smith"');

export const phoneSchema = z
  .string()
  .optional()
  .refine((val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val), {
    message: 'Please enter a valid phone number. Example: "1234567890" or "+1234567890"'
  });

export const addressSchema = z
  .string()
  .optional()
  .refine((val) => !val || val.length >= 5, {
    message: 'Address must be at least 5 characters long'
  });

export const licenseNumberSchema = z
  .string()
  .min(1, 'License number is required')
  .min(5, 'License number must be at least 5 characters long')
  .max(20, 'License number is too long')
  .regex(/^[A-Z0-9]+$/, 'License number can only contain uppercase letters and numbers. Example: "ABC12345"');

export const licenseValidUntilSchema = z
  .string()
  .min(1, 'License expiry date is required')
  .refine((val) => {
    const expiryDate = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiryDate > today;
  }, {
    message: 'License must be valid (not expired)'
  });

export const dateSchema = z
  .string()
  .min(1, 'Date is required')
  .refine((val) => {
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, {
    message: 'Date must be today or in the future'
  });

// Registration form schema
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  licenseNumber: licenseNumberSchema,
  licenseValidUntil: licenseValidUntilSchema,
  phone: phoneSchema,
  address: addressSchema
});

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

// Car search schema
export const carSearchSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate > startDate;
}, {
  message: '❌ End date must be after start date',
  path: ['endDate']
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30;
}, {
  message: '❌ Booking period cannot exceed 30 days',
  path: ['endDate']
});

// Booking confirmation schema
export const bookingConfirmationSchema = z.object({
  carId: z.string().min(1, 'Car ID is required'),
  startDate: dateSchema,
  endDate: dateSchema,
  licenseNumber: licenseNumberSchema,
  licenseValidUntil: licenseValidUntilSchema,
  totalPrice: z.number().positive('Total price must be positive')
});

// Type exports for use in components
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type CarSearchData = z.infer<typeof carSearchSchema>;
export type BookingConfirmationData = z.infer<typeof bookingConfirmationSchema>;

// Validation error handling utility
export interface ValidationError {
  field: string;
  message: string;
}

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: ValidationError[] = result.error.issues.map((error: any) => ({
    field: error.path.join('.'),
    message: error.message
  }));
  
  return { success: false, errors };
}

// Field-specific validation utility
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { isValid: true } | { isValid: false; message: string } {
  const result = schema.safeParse(value);
  
  if (result.success) {
    return { isValid: true };
  }
  
  return { isValid: false, message: result.error.issues[0]?.message || 'Invalid value' };
}

// Real-time validation helper for form fields
export function getFieldError(
  errors: ValidationError[],
  fieldName: string
): string | undefined {
  return errors.find(error => error.field === fieldName)?.message;
} 