import image_3517c13818645a7fbda74d51f10c38a0291a99d7 from '../assets/3517c13818645a7fbda74d51f10c38a0291a99d7.png';

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
      
    </div>
  );
}

// Pre-defined illustrated icons for common Chennai community elements
export const ChennaiIcons = {
  // Food & Dining
  food: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  mess: "https://images.unsplash.com/photo-1577303935007-0d306ee638cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  restaurant: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  
  // Transportation
  auto: "https://images.unsplash.com/photo-1595227359743-bf5dedeaa5b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  bus: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  transport: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  
  // Services
  repair: "https://images.unsplash.com/photo-1486754735734-325b5831c3ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  medical: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  education: "https://images.unsplash.com/photo-1509062522246-3755977927d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  shop: "https://images.unsplash.com/photo-1555669873-f4b582ba8475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  
  // Community & Culture
  temple: image_3517c13818645a7fbda74d51f10c38a0291a99d7,
  community: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  family: "https://images.unsplash.com/photo-1511895426328-dc8714191300?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  celebration: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  
  // Communication
  chat: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  announcement: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  group: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  
  // Activities
  beach: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  festival: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  market: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  
  // Trust & Safety
  verified: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  trust: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  helper: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"
};