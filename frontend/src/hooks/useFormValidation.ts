import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateForm as validateFormUtil, validateField as validateFieldUtil } from '../utils/validations';
import type { ValidationError } from '../utils/validations';

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  initialData: T;
  onSubmit?: (data: T) => Promise<void> | void;
}

interface UseFormValidationReturn<T> {
  formData: T;
  errors: ValidationError[];
  loading: boolean;
  setFormData: (data: T) => void;
  updateField: (field: keyof T, value: unknown) => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearErrors: () => void;
  getFieldError: (fieldName: string) => string | undefined;
}

export function useFormValidation<T extends Record<string, unknown>>({
  schema,
  initialData,
  onSubmit
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const updateField = useCallback((field: keyof T, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    setErrors(prev => prev.filter(error => error.field !== field as string));
  }, []);

  const validateField = useCallback((field: keyof T) => {
    const fieldSchema = (schema as z.ZodObject<any>).shape[field as string];
    if (!fieldSchema) return;

    const result = validateFieldUtil(fieldSchema, formData[field]);
    
    if (!result.isValid) {
      setErrors(prev => [
        ...prev.filter(error => error.field !== field as string),
        { field: field as string, message: result.message }
      ]);
    } else {
      setErrors(prev => prev.filter(error => error.field !== field as string));
    }
  }, [schema, formData]);

  const validateForm = useCallback((): boolean => {
    const result = validateFormUtil(schema, formData);
    
    if (result.success) {
      setErrors([]);
      return true;
    } else {
      setErrors(result.errors);
      return false;
    }
  }, [schema, formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!onSubmit) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // Handle submission errors
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setErrors([{ field: 'form', message: errorMessage }]);
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, onSubmit]);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return errors.find(error => error.field === fieldName)?.message;
  }, [errors]);

  return {
    formData,
    errors,
    loading,
    setFormData,
    updateField,
    validateField,
    validateForm,
    handleSubmit,
    clearErrors,
    getFieldError
  };
} 