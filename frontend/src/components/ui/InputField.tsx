import React, { forwardRef } from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'select';
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  className?: string;
}

const InputField = forwardRef<HTMLInputElement | HTMLSelectElement, InputFieldProps>(
  ({ 
    label, 
    name, 
    type = 'text', 
    value, 
    onChange, 
    onBlur,
    error, 
    placeholder, 
    required = false,
    disabled = false,
    options = [],
    className = ''
  }, ref) => {
    
    const inputClassName = `w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;
    
    return (
      <div className={`mb-4 ${className}`}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span style={{ color: '#dc2626', marginLeft: '0.25rem' }}>*</span>}
        </label>
        
        {type === 'select' ? (
          <select
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange as any}
            onBlur={onBlur as any}
            disabled={disabled}
            className={inputClassName}
            ref={ref as any}
          >
            <option value="">Selecciona una opción</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value ?? ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClassName}
            ref={ref as any}
          />
        )}
        
        {error && (
          <p className="error-text">
            ⚠️ {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;

