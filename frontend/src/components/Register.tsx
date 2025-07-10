import { useFormValidation } from '../hooks/useFormValidation';
import { registerSchema } from '../utils/validations';
import type { RegisterFormData } from '../utils/validations';
import { apiService } from '../services/api';
import FormField from './common/FormField';
import './Auth.css';

interface RegisterProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

export default function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const {
    formData,
    errors,
    loading,
    updateField,
    validateField,
    handleSubmit,
    getFieldError,
    clearErrors
  } = useFormValidation<RegisterFormData>({
    schema: registerSchema,
    initialData: {
      name: '',
      email: '',
      password: '',
      licenseNumber: '',
      licenseValidUntil: '',
      phone: '',
      address: ''
    },
    onSubmit: async (data) => {
      try {
        await apiService.register(data);
        alert('✅ Account created successfully! You can now sign in.');
        onRegister();
      } catch (error) {
        // Error will be handled by the validation hook
        throw error;
      }
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof RegisterFormData, value);
    clearErrors();
  };

  const handleBlur = (fieldName: keyof RegisterFormData) => {
    validateField(fieldName);
  };

  const formError = getFieldError('form');

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🚗 Join CarRental!</h1>
          <p>Create your account to start renting cars</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {formError && <div className="error-message">{formError}</div>}
          
          <FormField
            label="Full Name"
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            placeholder="Enter your full name"
            required
            error={getFieldError('name')}
          />

          <FormField
            label="Email Address"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            placeholder="Enter your email"
            required
            error={getFieldError('email')}
          />

          <FormField
            label="Password"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={() => handleBlur('password')}
            placeholder="Create a password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)"
            required
            error={getFieldError('password')}
          />

          <FormField
            label="Driver's License Number"
            id="licenseNumber"
            name="licenseNumber"
            type="text"
            value={formData.licenseNumber}
            onChange={handleChange}
            onBlur={() => handleBlur('licenseNumber')}
            placeholder="Enter your license number (uppercase letters and numbers only)"
            required
            error={getFieldError('licenseNumber')}
          />

          <FormField
            label="License Valid Until"
            id="licenseValidUntil"
            name="licenseValidUntil"
            type="date"
            value={formData.licenseValidUntil}
            onChange={handleChange}
            onBlur={() => handleBlur('licenseValidUntil')}
            required
            min={new Date().toISOString().split('T')[0]}
            error={getFieldError('licenseValidUntil')}
          />

          <FormField
            label="Phone Number (Optional)"
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={handleChange}
            onBlur={() => handleBlur('phone')}
            placeholder="Enter your phone number"
            error={getFieldError('phone')}
          />

          <FormField
            label="Address (Optional)"
            id="address"
            name="address"
            type="text"
            value={formData.address || ''}
            onChange={handleChange}
            onBlur={() => handleBlur('address')}
            placeholder="Enter your address"
            error={getFieldError('address')}
          />

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button 
              type="button" 
              className="link-button"
              onClick={onSwitchToLogin}
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 