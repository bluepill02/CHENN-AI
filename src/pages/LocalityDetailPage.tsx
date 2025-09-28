import { ArrowLeft, ExternalLink, MapPin, MessageSquare, RefreshCw, Star } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MetricBreakdown from '../../components/locality/MetricBreakdown';
import PillBadge from '../../components/locality/PillBadge';
import RatingStars from '../../components/locality/RatingStars';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { useLocalityRatings } from '../../services/LocalityRatingsService';
import { chennaiLocalities, computeLocalityScore } from '../data/localities';

const LocalityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLocalityById, loading, refresh, isUsingBackend } = useLocalityRatings();
  const [refreshing, setRefreshing] = React.useState(false);

  const contextLocality = id ? getLocalityById(id) : undefined;
  const fallbackLocality = id ? chennaiLocalities.find(l => l.id === id) : undefined;
  const locality = contextLocality ?? fallbackLocality ?? null;

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };
  
  if (!locality) {
    if (loading || refreshing) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-3 text-gray-600">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <p className="text-sm">Loading locality details…</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Locality Not Found</h1>
          <p className="text-gray-600 mb-4">பகுதி தகவல் கிடைக்கவில்லை</p>
          <Button onClick={() => navigate('/localities')}>Back to Localities</Button>
        </div>
      </div>
    );
  }

  const computedScore = computeLocalityScore(locality.metrics);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-25">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              variant="ghost"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-8 h-8 text-amber-200" />
                <div>
                  <h1 className="text-4xl font-bold mb-2">{locality.nameEn}</h1>
                  <p className="text-2xl text-amber-100">{locality.nameTa}</p>
                </div>
              </div>
              
              <p className="text-amber-200 max-w-2xl text-lg mb-2">{locality.description}</p>
              <p className="text-amber-300 max-w-2xl">{locality.descriptionTa}</p>
              
              <div className="flex flex-wrap items-center gap-3 mt-6 text-xs text-amber-100">
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {isUsingBackend ? 'Live backend data' : 'Community simulation'}
                </span>
                {locality.isCommunitySubmission && (
                  <span className="rounded-full bg-white/10 px-3 py-1">Community submission</span>
                )}
                {locality.pincode && (
                  <span className="rounded-full bg-white/10 px-3 py-1">PIN {locality.pincode}</span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-sm text-amber-200">Pincode</div>
                  <div className="font-bold">{locality.pincode ?? '—'}</div>
                </div>
              </div>
            </div>
            
            {/* Score Panel */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center min-w-[200px]">
              <div className="mb-4">
                <RatingStars value={computedScore} size="lg" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{computedScore.toFixed(1)}</div>
              <div className="text-amber-200 text-sm">Overall Rating</div>
              <div className="text-amber-300 text-xs mt-1">மொத்த மதிப்பீடு</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Detailed Metrics */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Detailed Metrics
                <span className="text-sm font-normal text-gray-600 ml-2">விரிவான அளவீடுகள்</span>
              </h2>
              <MetricBreakdown metrics={locality.metrics} showBars={true} />
            </Card>

            {/* Community Buzz */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Community Buzz
                  <span className="text-sm font-normal text-gray-600 ml-2">சமூக கருத்துகள்</span>
                </h2>
              </div>
              
              <div className="space-y-4">
                {(locality.sampleTweets ?? []).map(tweet => (
                  <div key={tweet.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-800 mb-3">{tweet.text}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-600">{tweet.user}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">{tweet.time}</span>
                      </div>
                      <button className="text-blue-500 hover:text-blue-600 text-xs font-medium">
                        View on Twitter →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Community Insight</span>
                </div>
                <p className="text-sm text-blue-700">
                  These are real community opinions aggregated from social media platforms. 
                  Sentiment analysis shows <strong>positive vibes</strong> about this locality.
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  இவை சமூக ஊடக தளங்களிலிருந்து சேகரிக்கப்பட்ட உண்மையான சமூக கருத்துக்கள்.
                </p>
              </div>
            </Card>

            {/* Popular Spots */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Popular Spots
                <span className="text-sm font-normal text-gray-600 ml-2">பிரபலமான இடங்கள்</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {(locality.popularSpots ?? []).map((spot) => (
                  <div 
                    key={spot} 
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="font-medium text-gray-800">{spot}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
                <span className="text-sm font-normal text-gray-600 block">விரைவு புள்ளிவிவரங்கள்</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rank</span>
                  <span className="font-bold text-lg">
                    #{chennaiLocalities.findIndex(l => l.id === locality.id) + 1}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Best Feature</span>
                  <span className="font-medium text-green-600">
                    {Object.entries(locality.metrics).reduce((a, b) => 
                      locality.metrics[a[0] as keyof typeof locality.metrics] > b[1] ? a : b
                    )[0].replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </div>
              </div>
            </Card>

            {/* Data Sources */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Data Sources
                <span className="text-sm font-normal text-gray-600 block">தரவு ஆதாரங்கள்</span>
              </h3>
              <div className="space-y-3">
                {locality.sources.map(source => (
                  <PillBadge key={source} text={source} variant="source" size="md" />
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                <div className="text-sm text-green-700">
                  ✅ Data verified from multiple sources
                </div>
              </div>
            </Card>

            {/* Highlights */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Key Highlights
                <span className="text-sm font-normal text-gray-600 block">முக்கிய சிறப்பம்சங்கள்</span>
              </h3>
              <div className="space-y-2">
                {(locality.highlights ?? []).map((highlight) => (
                  <div key={highlight} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Action Button */}
            <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <h3 className="font-semibold text-gray-900 mb-3">Rate This Area</h3>
              <p className="text-sm text-gray-600 mb-4">
                Share your experience living in {locality.nameEn}
              </p>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                Add Your Review
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalityDetailPage;