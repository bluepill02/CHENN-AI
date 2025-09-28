import appLogo from 'figma:asset/4ed21f9248d086a0323ac9f747f709b581f13e8e.png';
import image_b8fc04d1057e4c07909ad75c346def9f8f3687d7 from 'figma:asset/b8fc04d1057e4c07909ad75c346def9f8f3687d7.png';
import { useLanguage } from '../services/LanguageService';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChennaiIcons, IllustratedIcon } from './IllustratedIcon';
import { LanguageToggle } from './LanguageToggle';
import { Button } from './ui/button';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative max-w-md mx-auto">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>
      
      {/* Beautiful Chennai cityscape background inspired by the uploaded illustration */}
      <div
        className="absolute inset-0 pointer-events-none bg-center bg-contain bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url(${image_b8fc04d1057e4c07909ad75c346def9f8f3687d7})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
        }}
        aria-hidden={true}
      />
      
      {/* Main content */}
      <div className="relative z-10 text-center max-w-sm text-slate-900">
        {/* App logo */}
        <div className="w-24 h-24 mx-auto mb-8">
          <ImageWithFallback
            src={appLogo}
            alt="Namma Ooru App Logo"
            className="w-24 h-24 rounded-full"
          />
        </div>

        {/* Welcome text */}
        <h1 className="text-4xl text-rose-900 mb-4 font-bold">
          {t('welcome.title', 'நம்ம ஊர்')}
        </h1>
        <p className="text-slate-800 opacity-95 text-lg mb-2">Chennai Community • சென்னை சம���கம்</p>
        
        {/* Subtitle */}
        <p className="text-slate-700 opacity-90 mb-8 leading-relaxed">
          {t('welcome.subtitle', 'Connect with your neighbors, discover local services, and build stronger communities')}
        </p>

        {/* Local pride tagline */}
        <div className="bg-amber-50/80 rounded-2xl p-4 mb-6 backdrop-blur-sm">
          <p className="text-slate-700 text-sm text-center text-[16px]">
            🌴 {t('welcome.tagline', 'Your trusted neighborhood network')} 🌴
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 font-medium py-6 rounded-2xl shadow-2xl border border-white/10 text-center relative z-30 ring-1 ring-white/20"
        >
          {t('welcome.continue', 'Continue')}
        </Button>


        {/* Trust indicators with beautiful illustrations */}
        <div className="mt-6 text-slate-800 opacity-90 text-sm space-y-3">
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
      <div className="absolute top-10 right-10 w-20 h-20 bg-amber-50/60 rounded-full"></div>
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-amber-50/60 rounded-full"></div>
      <div className="absolute top-1/3 left-8 w-12 h-12 bg-amber-50/60 rounded-full"></div>
    </div>
  );
}
