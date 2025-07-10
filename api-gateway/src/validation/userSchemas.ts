import { z } from 'zod';

export const passwordSchema = z.string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(128, { message: 'Password is too long' })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: 'Password must contain uppercase, lowercase & number' });

export const nameSchema = z.string()
  .min(2, { message: 'Name must be at least 2 characters long' })
  .max(100, { message: 'Name is too long' })
  .regex(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters and spaces. Example: "John Smith"' });

export const emailSchema = z.string()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Please enter a valid email address' })
  .max(255, { message: 'Email is too long' });

export const phoneSchema = z.string().optional().refine((val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val), {
  message: 'Please enter a valid phone number. Example: "1234567890" or "+1234567890"'
});

export const addressSchema = z.string().optional().refine((val) => !val || val.length >= 5, {
  message: 'Address must be at least 5 characters long'
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  licenseNumber: z.string().min(5, { message: 'License number is required' }),
  licenseValidUntil: z.string().min(1, { message: 'License valid until is required' }),
  phone: phoneSchema,
  address: addressSchema,
});

export const createUserSchema = registerSchema;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
}); 