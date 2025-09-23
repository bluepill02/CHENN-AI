import image_b8fc04d1057e4c07909ad75c346def9f8f3687d7 from 'figma:asset/b8fc04d1057e4c07909ad75c346def9f8f3687d7.png';
import React from 'react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { IllustratedIcon, ChennaiIcons } from './IllustratedIcon';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../services/LanguageService';
import chennaiCityscape from 'figma:asset/7d7500ada15d497a9fc07f7ca36038f07b9ff493.png';
import appLogo from 'figma:asset/4ed21f9248d086a0323ac9f747f709b581f13e8e.png';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-300 to-yellow-400 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>
      
      {/* Beautiful Chennai cityscape background inspired by the uploaded illustration */}
      <div className="absolute inset-0 opacity-30">
        <ImageWithFallback
          src={image_b8fc04d1057e4c07909ad75c346def9f8f3687d7}
          alt="Chennai Community Illustration"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 text-center max-w-sm">
        {/* App logo */}
        <div className="w-24 h-24 mx-auto mb-8">
          <ImageWithFallback
            src={appLogo}
            alt="Namma Ooru App Logo"
            className="w-24 h-24 rounded-full"
          />
        </div>

        {/* Welcome text */}
        <h1 className="text-4xl text-white mb-4 font-bold">
          {t('welcome.title', 'நம்ம ஊர்')}
        </h1>
        <p className="text-white/90 text-lg mb-2">Chennai Community • சென்னை சமூகம்</p>
        
        {/* Subtitle */}
        <p className="text-white/80 mb-8 leading-relaxed">
          {t('welcome.subtitle', 'Connect with your neighbors, discover local services, and build stronger communities')}
        </p>

        {/* Local pride tagline */}
        <div className="bg-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm">
          <p className="text-white text-sm text-center text-[16px]">
            🌴 {t('welcome.tagline', 'Your trusted neighborhood network')} 🌴
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onContinue}
          className="w-full bg-white text-orange-600 hover:bg-orange-50 font-medium py-6 rounded-2xl shadow-lg border-0 text-center"
        >
          {t('welcome.continue', 'Continue')}
        </Button>


        {/* Trust indicators with beautiful illustrations */}
        <div className="mt-6 text-white/70 text-sm space-y-3">
          <div className="flex items-center justify-center gap-2">
            <IllustratedIcon src={ChennaiIcons.temple} alt="Temple" size="sm" />
            <p className="font-bold text-[20px]">கம்யூனிட்டி app</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <IllustratedIcon src={ChennaiIcons.community} alt="Community" size="sm" />
            <p className="text-[20px] font-bold italic">Made with ❤️</p>
          </div>
          
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full"></div>
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-white/10 rounded-full"></div>
      <div className="absolute top-1/3 left-8 w-12 h-12 bg-white/10 rounded-full"></div>
    </div>
  );
}