import React from 'react';
import PillBadge from './PillBadge';

interface MetricBreakdownProps {
  metrics: {
    liveability: number;
    connectivity: number;
    foodCulture: number;
    affordability: number;
    buzz: number;
  };
  showBars?: boolean;
}

const MetricBreakdown: React.FC<MetricBreakdownProps> = ({ metrics, showBars = true }) => {
  const metricLabels = {
    liveability: { en: 'Liveability', ta: 'வாழ்க்கைத்தரம்' },
    connectivity: { en: 'Connectivity', ta: 'இணைப்பு' },
    foodCulture: { en: 'Food Culture', ta: 'உணவு கலாச்சாரம்' },
    affordability: { en: 'Affordability', ta: 'வாங்கும் திறன்' },
    buzz: { en: 'Buzz', ta: 'உற்சாகம்' }
  };

  const getBarColor = (metric: keyof typeof metrics) => {
    switch (metric) {
      case 'liveability': return 'bg-green-500';
      case 'connectivity': return 'bg-blue-500';
      case 'foodCulture': return 'bg-orange-500';
      case 'affordability': return 'bg-purple-500';
      case 'buzz': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  if (!showBars) {
    // Pill format for compact display
    const sortedMetrics = Object.entries(metrics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2); // Top 2 metrics

    return (
      <div className="flex gap-2 flex-wrap">
        {sortedMetrics.map(([metric, value]) => (
          <PillBadge 
            key={metric}
            text={`${metricLabels[metric as keyof typeof metrics].en}: ${value.toFixed(1)}`}
            variant={metric as any}
            size="sm"
          />
        ))}
      </div>
    );
  }

  // Bar chart format for detailed view
  return (
    <div className="space-y-3">
      {Object.entries(metrics).map(([metric, value]) => (
        <div key={metric} className="space-y-1">
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">
                {metricLabels[metric as keyof typeof metrics].en}
              </span>
              <span className="text-xs text-gray-500">
                {metricLabels[metric as keyof typeof metrics].ta}
              </span>
            </div>
            <span className="font-medium text-gray-900">{value.toFixed(1)}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getBarColor(metric as keyof typeof metrics)}`}
              style={{ width: `${(value / 5) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricBreakdown;