import { MapPin, Trophy } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Locality } from '../../src/types/locality';
import { Card } from '../ui/card';
import MetricBreakdown from './MetricBreakdown';
import PillBadge from './PillBadge';
import RatingModal from './RatingModal';
import RatingStars from './RatingStars';

interface LocalityCardProps {
  locality: Locality;
  rank: number;
  onClick?: () => void;
  onRate?: (rating: number, comment?: string) => void;
}

const LocalityCard: React.FC<LocalityCardProps> = ({ locality, rank, onClick, onRate }) => {
  const navigate = useNavigate();
  const [showRating, setShowRating] = useState(false);
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/localities/${locality.id}`);
    }
  };

  const isTopRank = rank === 1;

  return (
    <Card 
      className={`
        group relative p-6 cursor-pointer transition-all duration-300 hover:shadow-lg
        ${isTopRank ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200' : 'bg-white border border-gray-200'}
        rounded-xl shadow-sm hover:shadow-md transform hover:-translate-y-1
      `}
      onClick={handleClick}
    >
      {/* Rank Badge */}
      <div className={`
      absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
      ${isTopRank
        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg'
        : 'bg-gray-600 text-white'
      }
    `}>
        {rank === 1 ? <Trophy className="w-4 h-4" /> : `#${rank}`}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-gray-500" />
            <h3 className={`font-bold text-lg ${isTopRank ? 'text-amber-900' : 'text-gray-900'}`}>
              {locality.nameEn}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">{locality.nameTa}</p>
        </div>
        
        <div className="text-right">
          <RatingStars 
            value={locality.score} 
            size="md" 
            showNumeric={true}
          />
          <p className="text-xs text-gray-500 mt-1">Overall Score</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="mb-4">
        <MetricBreakdown metrics={locality.metrics} showBars={false} />
      </div>

      {/* Sources */}
      <div className="flex flex-wrap gap-2">
        {locality.sources.map((source) => (
          <PillBadge 
            key={source} 
            text={source} 
            variant="source" 
            size="sm"
          />
        ))}
      </div>

      {/* Hover Arrow */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <button
          aria-label="Rate locality"
          onClick={(e) => {
            e.stopPropagation();
            setShowRating(true);
          }}
          className="px-2 py-1 rounded-md bg-amber-500 text-white text-xs shadow-sm"
        >
          Rate
        </button>
        {/* Rating Modal */}
        {typeof window !== 'undefined' && (
          <RatingModal
            open={showRating}
            onOpenChange={setShowRating}
            localityName={locality.nameEn}
            onSubmit={(val, comment) => onRate && onRate(val, comment)}
          />
        )}
      </div>
    </Card>
  );
};

export default LocalityCard;
