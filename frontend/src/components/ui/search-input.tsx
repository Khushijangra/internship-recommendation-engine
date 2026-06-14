import React, { useState } from 'react';
import { Search, Mic, X } from 'lucide-react';
import { Button } from './button';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onVoiceSearch?: () => void;
  className?: string;
}

export function SearchInput({ 
  placeholder = "Search for...", 
  value = "", 
  onChange,
  onVoiceSearch,
  className = ""
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange?.(e.target.value);
  };

  const clearInput = () => {
    setInputValue("");
    onChange?.("");
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className="w-full pl-10 pr-20 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-12 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0 text-muted-foreground hover:text-foreground"
            onClick={clearInput}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {onVoiceSearch && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 text-chart-2 hover:bg-chart-2/10"
          onClick={onVoiceSearch}
        >
          <Mic className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}