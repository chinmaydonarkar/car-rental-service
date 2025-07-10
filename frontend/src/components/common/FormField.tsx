import React from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  pattern?: string;
}

export default function FormField({
  label,
  id,
  name,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  disabled = false,
  min,
  max,
  pattern
}: FormFieldProps) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-container">
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          pattern={pattern}
          className={error ? 'form-input error' : 'form-input'}
        />
      </div>
      <div className="field-error-container">
        {error && <div className="field-error">{error}</div>}
      </div>
    </div>
  );
} 