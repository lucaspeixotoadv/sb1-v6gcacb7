import React from 'react';
import { Search } from 'lucide-react';

interface ChatbotSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ChatbotSearch({ value, onChange }: ChatbotSearchProps) {
  return (
    <div className="relative">
      <Search 
        size={20}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar chatbots e pastas..."
        className="w-80 pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}