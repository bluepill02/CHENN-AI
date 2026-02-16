import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface IllustratedIconProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackEmoji?: string;
  style?: 'circular' | 'rounded' | 'square';
}

export function IllustratedIcon({
  src,
  alt,
  size = 'md',
  className = '',
  fallbackEmoji = '🏛️',
  style = 'circular'
}: IllustratedIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const styleClasses = {
    circular: 'rounded-full',
    rounded: 'rounded-xl',
    square: 'rounded-lg'
  };

  return (
    <div className={`${sizeClasses[size]} ${styleClasses[style]} overflow-hidden bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center shadow-sm ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
          const span = document.createElement('span');
          span.innerText = fallbackEmoji;
          span.className = 'text-2xl';
          e.currentTarget.parentElement?.appendChild(span);
        }}
      />
    </div>
  );
}

// Pre-defined illustrated icons for common Chennai community elements
export const ChennaiIcons = {
  // Food & Dining
  food: "/assets/icon_food.png",
  mess: "/assets/icon_food.png",
  restaurant: "/assets/icon_food.png",
  coffee: "/assets/icon_coffee.png",

  // Transportation
  auto: "/assets/icon_auto.png",
  bus: "/assets/icon_bus.png",
  transport: "/assets/icon_auto.png",

  // Services
  repair: "/assets/icon_repair.png",
  medical: "/assets/icon_medical.png",
  education: "/assets/icon_education.png",
  shop: "/assets/icon_grocery.png",
  grocery: "/assets/icon_grocery.png",
  salon: "/assets/icon_salon.png",

  // Community & Culture
  temple: "/assets/hero_welcome.png",
  community: "/assets/badge_neighbor.png",
  family: "/assets/avatar_female.png",
  celebration: "/assets/badge_active.png",

  // Communication
  chat: "/assets/badge_neighbor.png",
  announcement: "/assets/badge_active.png",
  group: "/assets/badge_neighbor.png",

  // Activities
  beach: "/assets/weather_sunny.png",
  festival: "/assets/badge_active.png",
  market: "/assets/bg_marketplace.png",
  cinema: "/assets/icon_cinema.png",
  quiz: "/assets/icon_quiz.png",

  // Trust & Safety
  verified: "/assets/badge_trust.png",
  trust: "/assets/badge_trust.png",
  helper: "/assets/badge_neighbor.png",

  // Badges
  badge_neighbor: "/assets/badge_neighbor.png",
  badge_foodie: "/assets/badge_foodie.png",
  badge_trust: "/assets/badge_trust.png",
  badge_active: "/assets/badge_active.png",

  // Mascots
  mascot_auto: "/assets/mascot_auto_anna.png",

  // Weather
  weather_sunny: "/assets/weather_sunny.png",
  weather_rainy: "/assets/weather_rainy.png",

  // Empty States
  empty_posts: "/assets/empty_no_posts.png",
  empty_net: "/assets/empty_no_net.png",
  empty_location: "/assets/empty_no_location.png"
};