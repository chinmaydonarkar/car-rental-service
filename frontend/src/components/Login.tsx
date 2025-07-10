import { useFormValidation } from '../hooks/useFormValidation';
import { loginSchema } from '../utils/validations';
import type { LoginFormData } from '../utils/validations';
import { apiService } from '../services/api';
import FormField from './common/FormField';
import './Auth.css';

interface LoginProps {
  onLogin: () => void;
  onSwitchToRegister: () => void;
}

export default function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const {
    formData,
    errors,
    loading,
    updateField,
    validateField,
    handleSubmit,
    getFieldError,
    clearErrors
  } = useFormValidation<LoginFormData>({
    schema: loginSchema,
    initialData: {
      email: '',
      password: ''
    },
    onSubmit: async (data) => {
      try {
        await apiService.login(data);
        onLogin();
      } catch (error) {
        // Error will be handled by the validation hook
        throw error;
      }
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof LoginFormData, value);
    clearErrors();
  };

  const handleBlur = (fieldName: keyof LoginFormData) => {
    validateField(fieldName);
  };

  const formError = getFieldError('form');

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🚗 Welcome Back!</h1>
          <p>Sign in to your CarRental account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {formError && (
            <div className="error-message">
              {formError.includes('Invalid email or password')
                ? 'Invalid email or password'
                : formError}
            </div>
          )}
          
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
            placeholder="Enter your password"
            required
            error={getFieldError('password')}
          />

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              className="link-button"
              onClick={onSwitchToRegister}
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 