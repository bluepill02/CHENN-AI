import { Badge } from './ui/badge';
import { Card } from './ui/card';

export function ChennaiPride() {
  const prideFeatures = [
    {
      title: 'இன்றைய Chennai Weather',
      description: '31°C, Marina-ல நல்ல காற்று',
      icon: '🌤️',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      title: 'Local Festival Alert',
      description: 'கார்த்திகை தீபம் preparations',
      icon: '🪔',
      color: 'from-orange-400 to-yellow-500'
    },
    {
      title: 'Traffic Update',
      description: 'OMR smooth, T.Nagar busy',
      icon: '🚗',
      color: 'from-green-400 to-emerald-500'
    },
    {
      title: 'Today\'s Special',
      description: 'Fresh fish @ Kasimedu market',
      icon: '🐟',
      color: 'from-purple-400 to-pink-500'
    }
  ];

  const culturalHighlights = [
    {
      title: 'இன்றைய ராசி பலன்',
      description: 'Today\'s Tamil horoscope',
      time: 'Daily 6 AM'
    },
    {
      title: 'Kolam of the Day',
      description: 'Traditional patterns shared',
      time: 'நித்தம் வைங்க'
    },
    {
      title: 'சென்னை History Facts',
      description: 'Did you know stories',
      time: 'Weekly'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Daily Chennai Updates */}
      <div>
        <h3 className="mb-4 flex items-center gap-2">
          <span>🏛️</span>
          <span>இன்றைய Chennai Updates</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {prideFeatures.map((feature, index) => (
            <Card key={index} className="p-3 bg-white border-orange-100">
              <div className={`w-8 h-8 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-2`}>
                <span className="text-white">{feature.icon}</span>
              </div>
              <h4 className="text-sm font-medium mb-1">{feature.title}</h4>
              <p className="text-xs text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Cultural Connection */}
      <div>
        <h3 className="mb-4 flex items-center gap-2">
          <span>🎭</span>
          <span>தமிழ் Cultural Connection</span>
        </h3>
        <div className="space-y-3">
          {culturalHighlights.map((highlight, index) => (
            <Card key={index} className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium mb-1">{highlight.title}</h4>
                  <p className="text-sm text-gray-600">{highlight.description}</p>
                </div>
                <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                  {highlight.time}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Local Pride Stats */}
      <Card className="p-4 bg-gradient-to-br from-orange-400 to-red-500 text-white">
        <h3 className="font-bold mb-3">நம்ம ஊர் Pride Stats 🏆</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">50K+</div>
            <div className="text-sm opacity-90">Proud Chennaiites</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">127</div>
            <div className="text-sm opacity-90">Local Areas Covered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">5.8M</div>
            <div className="text-sm opacity-90">நல்ல உதவிகள்</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">95%</div>
            <div className="text-sm opacity-90">Trust Rate</div>
          </div>
        </div>
      </Card>
    </div>
  );
}