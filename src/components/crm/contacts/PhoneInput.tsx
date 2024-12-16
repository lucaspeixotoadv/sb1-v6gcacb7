import React from 'react';
import { Flag } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function PhoneInput({ value, onChange, error }: PhoneInputProps) {
  const formatPhone = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = phone.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Formata o número conforme a quantidade de dígitos
    if (limitedNumbers.length <= 2) {
      return `(${limitedNumbers}`;
    }
    
    if (limitedNumbers.length <= 6) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    }
    
    if (limitedNumbers.length <= 10) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
    }
    
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhone(e.target.value);
    onChange(formattedValue);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Telefone
        <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Flag size={16} className="text-gray-400" />
        </div>
        <div className="absolute inset-y-0 left-8 flex items-center px-3 border-l border-gray-300">
          <span className="text-gray-500">+55</span>
        </div>
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          className={`
            w-full pl-24 pr-4 py-2 border rounded-lg
            ${error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}
            focus:outline-none focus:ring-2
          `}
          placeholder="(11) 99999-9999"
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}