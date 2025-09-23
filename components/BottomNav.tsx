import React from 'react';
import { Home, Store, MessageCircle, User } from 'lucide-react';
import { IllustratedIcon, ChennaiIcons } from './IllustratedIcon';
import { useLanguage } from '../services/LanguageService';

interface BottomNavProps {
  currentScreen: string;
  onScreenChange: (screen: 'home' | 'services' | 'chat' | 'profile') => void;
}

export function BottomNav({ currentScreen, onScreenChange }: BottomNavProps) {
  const { t } = useLanguage();
  
  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: t('nav.home', 'Home'),
      illustration: ChennaiIcons.community,
      fallbackEmoji: '🏠'
    },
    {
      id: 'services',
      icon: Store,
      label: t('nav.services', 'Services'),
      illustration: ChennaiIcons.market,
      fallbackEmoji: '🏪'
    },
    {
      id: 'chat',
      icon: MessageCircle,
      label: t('nav.chat', 'Chat'),
      illustration: ChennaiIcons.community,
      fallbackEmoji: '💬'
    },
    {
      id: 'profile',
      icon: User,
      label: t('nav.profile', 'Profile'),
      illustration: ChennaiIcons.family,
      fallbackEmoji: '👤'
    }
  ];

  return (
    <div className="bg-white border-t border-orange-100 px-4 py-2 flex items-center justify-around relative">
      {/* Traditional pattern border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400"></div>
      
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = currentScreen === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onScreenChange(item.id as any)}
            className={`flex-1 flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'bg-gradient-to-br from-orange-100 to-yellow-100 text-orange-600' 
                : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'
            }`}
          >
            <div className="relative">
              <IllustratedIcon
                src={item.illustration}
                alt={item.label}
                size="sm"
                className={`transition-all duration-200 ${isActive ? 'scale-110 border-2 border-orange-300' : ''}`}
                fallbackEmoji={item.fallbackEmoji}
              />
              {isActive && (
                <div className="absolute -inset-1 bg-orange-200 rounded-full opacity-20 animate-pulse"></div>
              )}
            </div>
            <span className={`text-xs font-medium ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
      
      {/* Small Chennai pride indicator with illustration */}
      
    </div>
  );
}