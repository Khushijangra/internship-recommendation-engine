import React, { useState } from 'react';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  onLanguageChange?: (language: 'en' | 'hi') => void;
}

export function LanguageToggle({ onLanguageChange }: LanguageToggleProps) {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'hi'>('en');

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    setCurrentLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="bg-white/90 border-white/20 text-gov-blue hover:bg-white hover:text-gov-blue transition-all"
    >
      <Globe className="w-4 h-4 mr-2" />
      {currentLanguage === 'en' ? 'हिंदी' : 'English'}
    </Button>
  );
}