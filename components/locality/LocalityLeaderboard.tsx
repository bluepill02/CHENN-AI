import React from 'react';
import type { Locality } from '../../src/types/locality';
import LocalityCard from './LocalityCard';

interface LocalityLeaderboardProps {
  localities: Locality[];
  onLocalityClick?: (locality: Locality) => void;
  onRate?: (id: string, rating: number, comment?: string) => void;
}

const LocalityLeaderboard: React.FC<LocalityLeaderboardProps> = ({
  localities,
  onLocalityClick,
  onRate
}) => {
  // Sort localities by score in descending order
  const sortedLocalities = [...localities].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Chennai Locality Rankings
        </h2>
        <p className="text-lg text-gray-600">
          சென்னை பகுதி தரவரிசை
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Based on liveability, connectivity, food culture, affordability & buzz
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedLocalities.map((locality, index) => (
          <LocalityCard
            key={locality.id}
            locality={locality}
            rank={index + 1}
            onClick={() => onLocalityClick?.(locality)}
            onRate={(rating: number, comment?: string) => onRate?.(locality.id, rating, comment)}
          />
        ))}
      </div>

      {/* Summary Stats */}
      {localities.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">
                {localities.length}
              </div>
              <div>Areas Ranked</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">
                {(localities.reduce((sum, l) => sum + l.score, 0) / localities.length).toFixed(1)}
              </div>
              <div>Average Score</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">
                {Math.max(...localities.map(l => l.score)).toFixed(1)}
              </div>
              <div>Highest Score</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {localities.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No localities to display
          </h3>
          <p className="text-gray-500">
            பகுதி தகவல்கள் கிடைக்கவில்லை
          </p>
        </div>
      )}
    </div>
  );
};

export default LocalityLeaderboard;
