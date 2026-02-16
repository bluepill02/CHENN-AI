import React from 'react';
import { useLanguage, Language } from '../services/LanguageService';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'ta-rom', label: 'Tamil (Rom)', flag: '🔤' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-8 px-2 bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm rounded-md flex items-center gap-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/40">
        <Globe className="w-4 h-4" />
        <span className="text-sm">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline text-xs">{currentLanguage?.label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${
              language === lang.code ? 'bg-orange-50 text-orange-600' : ''
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            <span className="text-sm">{lang.label}</span>
            {language === lang.code && (
              <span className="ml-auto text-orange-500">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}