import { Star, StarHalf } from 'lucide-react';
import React from 'react';

interface RatingStarsProps {
  value: number;
  maxStars?: number;
  showNumeric?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const RatingStars: React.FC<RatingStarsProps> = ({ 
  value, 
  maxStars = 5, 
  showNumeric = true, 
  size = 'sm' 
}) => {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-5 h-5';
      case 'lg': return 'w-6 h-6';
      default: return 'w-4 h-4';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {Array(fullStars).fill(0).map((_, i) => (
          <Star 
            key={`full-${i}`} 
            className={`${getSizeClass()} fill-amber-400 text-amber-400`} 
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <StarHalf 
            className={`${getSizeClass()} fill-amber-400 text-amber-400`} 
          />
        )}
        
        {/* Empty stars */}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Star 
            key={`empty-${i}`} 
            className={`${getSizeClass()} text-gray-300`} 
          />
        ))}
      </div>
      
      {showNumeric && (
        <span className="text-sm font-medium text-gray-700">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;