import { Star } from 'lucide-react';

interface RatingStarsProps {
  value: number;
  size?: number;
}

export function RatingStars({ value, size = 14 }: RatingStarsProps) {
  const filled = Math.round(value);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-${Math.max(1, size)} h-${Math.max(1, size)} ${i < filled ? 'text-turmeric' : 'text-gray-300'}`} />
      ))}
      <span className="text-xs text-slate-700 ml-1">{value.toFixed(1)}</span>
    </div>
  );
}

export default RatingStars;
