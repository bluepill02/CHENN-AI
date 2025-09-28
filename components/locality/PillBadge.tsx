import React from 'react';

interface PillBadgeProps {
  text: string;
  variant?: 'liveability' | 'connectivity' | 'foodCulture' | 'affordability' | 'buzz' | 'source' | 'default';
  size?: 'sm' | 'md';
}

const PillBadge: React.FC<PillBadgeProps> = ({ text, variant = 'default', size = 'sm' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'liveability':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'connectivity':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'foodCulture':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'affordability':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'buzz':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'source':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSizeStyles = () => {
    return size === 'sm' 
      ? 'px-2 py-1 text-xs' 
      : 'px-3 py-1.5 text-sm';
  };

  return (
    <span className={`
      inline-flex items-center rounded-full border font-medium
      ${getVariantStyles()}
      ${getSizeStyles()}
    `}>
      {text}
    </span>
  );
};

export default PillBadge;