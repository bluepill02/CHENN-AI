import { ArrowLeft, MapPin, MessageSquare } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import MetricBreakdown from './MetricBreakdown';
import PillBadge from './PillBadge';
import RatingStars from './RatingStars';

// Mock locality data - in real app this would come from API
const mockLocalities = [
  {
    id: 't-nagar',
    nameEn: 'T. Nagar',
    nameTa: 'டி. நகர்',
    metrics: { liveability: 4.6, connectivity: 4.2, foodCulture: 4.9, affordability: 3.8, buzz: 4.5 },
    sources: ['99acres', 'Twitter', 'Local Reviews'],
    score: 4.4,
    description: 'The shopping capital of Chennai with vibrant street life and excellent connectivity.',
    descriptionTa: 'சென்னையின் வணிக மையம், சிறந்த போக்குவரத்து வசதியுடன்.',
    sampleTweets: [
      { id: 1, text: 'T.Nagar-la shopping experience super! எல்லா brands-um இங்க கிடைக்கும் 🛍️', user: '@ChennaiShopper', time: '2h ago' },
      { id: 2, text: 'Traffic congestion major issue in T.Nagar. But food options are amazing! 🍛', user: '@ChennaiLocal', time: '5h ago' },
      { id: 3, text: 'Mami shops in T.Nagar have the best collection. Traditional wear-க்கு perfect place! ✨', user: '@TamilCulture', time: '1d ago' }
    ]
  },
  {
    id: 'mylapore',
    nameEn: 'Mylapore',
    nameTa: 'மயிலாப்பூர்',
    metrics: { liveability: 4.8, connectivity: 4.0, foodCulture: 4.7, affordability: 3.9, buzz: 4.6 },
    sources: ['NoBroker', 'Twitter'],
    score: 4.4,
    description: 'Cultural heart of Chennai with temples, classical music, and traditional food.',
    descriptionTa: 'சென்னையின் கலாச்சார மையம், கோவில்கள் மற்றும் பாரம்பரிய உணவுகளுடன்.',
    sampleTweets: [
      { id: 1, text: 'Mylapore morning walk-அ விட்டா life-ல வேறு என்ன வேணும்? Kapaleeshwarar temple vibes 🕉️', user: '@ChennaiMorning', time: '3h ago' },
      { id: 2, text: 'Filter coffee and traditional breakfast in Mylapore hits different! Cultural richness எங்கே போனாலும் தெரியும் ☕', user: '@FoodieChennai', time: '6h ago' }
    ]
  },
  {
    id: 'besant-nagar',
    nameEn: 'Besant Nagar',
    nameTa: 'பெசன்ட் நகர்',
    metrics: { liveability: 4.3, connectivity: 4.1, foodCulture: 4.2, affordability: 4.0, buzz: 4.0 },
    sources: ['Local Blogs'],
    score: 4.1,
    description: 'Peaceful residential area near the beach with good amenities and cafes.',
    descriptionTa: 'கடற்கரைக்கு அருகில் அமைந்த அமைதியான குடியிருப்பு பகுதி.',
    sampleTweets: [
      { id: 1, text: 'Besant Nagar beach sunset-அ பார்த்தா stress எல்லாம் போயிடும்! Perfect weekend spot 🌅', user: '@ChennaiBeach', time: '4h ago' },
      { id: 2, text: 'Elliot\'s beach morning jog with filter coffee after. Besant Nagar lifestyle at its best! 🏃‍♀️☕', user: '@FitnessChennai', time: '1d ago' }
    ]
  }
];

const LocalityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const locality = mockLocalities.find(l => l.id === id);
  
  if (!locality) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Locality Not Found</h1>
          <p className="text-gray-600 mb-4">பகுதி தகவல் கிடைக்கவில்லை</p>
          <Button onClick={() => navigate('/enga-area')}>Back to Areas</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-6 h-6 text-gray-600" />
              <h1 className="text-3xl font-bold text-gray-900">{locality.nameEn}</h1>
            </div>
            <p className="text-xl text-gray-600">{locality.nameTa}</p>
          </div>
          
          <RatingStars value={locality.score} size="lg" />
        </div>

        {/* Description */}
        <Card className="p-6 mb-6">
          <p className="text-gray-700 mb-2">{locality.description}</p>
          <p className="text-gray-600 text-sm">{locality.descriptionTa}</p>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Metrics Breakdown */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Detailed Metrics
              <span className="text-sm font-normal text-gray-600 ml-2">விரிவான அளவீடுகள்</span>
            </h2>
            <MetricBreakdown metrics={locality.metrics} showBars={true} />
          </Card>

          {/* Sources & Quick Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Data Sources
              <span className="text-sm font-normal text-gray-600 ml-2">தரவு ஆதாரங்கள்</span>
            </h3>
            <div className="space-y-3">
              {locality.sources.map(source => (
                <PillBadge key={source} text={source} variant="source" size="md" />
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {locality.score.toFixed(1)}/5.0
                </div>
                <div className="text-sm text-gray-600">Overall Rating</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Community Buzz - Sample Tweets */}
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Community Buzz
              <span className="text-sm font-normal text-gray-600 ml-2">சமூக கருத்துகள்</span>
            </h2>
          </div>
          
          <div className="space-y-4">
            {locality.sampleTweets?.map(tweet => (
              <div key={tweet.id} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-800 mb-2">{tweet.text}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="font-medium">{tweet.user}</span>
                  <span>{tweet.time}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-sm text-blue-700">
              💡 These are sample community opinions. Real implementation would aggregate from social media and review platforms.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LocalityDetailPage;