import { Filter, MapPin, RefreshCw, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LocalityLeaderboard from '../../components/locality/LocalityLeaderboard';
import RatingStars from '../../components/locality/RatingStars';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import insightsGraphic from '../../Figma Exports/05 Bar Chart.png';
import heroTexture from '../../Figma Exports/Frame 5.png';
import shapesBg from '../../Figma Exports/shapes.svg';
import { useLocalityRatings } from '../../services/LocalityRatingsService';
import type { Locality } from '../types/locality';

const LocalityRatingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredLocalities,
    filters,
    loading,
    error,
    isUsingBackend,
    lastSync,
    refresh,
    rateLocality,
    pendingSubmissions,
    analytics,
    setFilters,
    clearFilters,
  } = useLocalityRatings();

  const top3Localities = filteredLocalities.slice(0, 3);
  const allLocalities = filteredLocalities;
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const totalScore = allLocalities.reduce((sum, locality) => sum + locality.score, 0);
  const averageScore = allLocalities.length > 0 ? totalScore / allLocalities.length : 0;
  const highestRated = allLocalities.reduce<Locality | null>((best, locality) => {
    if (!best || locality.score > best.score) {
      return locality;
    }
    return best;
  }, null);
  const bestValue = allLocalities.reduce<Locality | null>((best, locality) => {
    const current = locality.metrics?.affordability ?? 0;
    const bestScore = best?.metrics?.affordability ?? -Infinity;
    if (current > bestScore) {
      return locality;
    }
    return best;
  }, null);
  const bestFood = allLocalities.reduce<Locality | null>((best, locality) => {
    const current = locality.metrics?.foodCulture ?? 0;
    const bestScore = best?.metrics?.foodCulture ?? -Infinity;
    if (current > bestScore) {
      return locality;
    }
    return best;
  }, null);

  const hasFiltersApplied = Boolean(
    filters.query ||
      filters.area ||
      filters.pincode ||
      typeof filters.minScore === 'number'
  );
  const sourceBreakdown = React.useMemo(
    () =>
      Object.entries(analytics.sourcesBreakdown)
        .sort(([, a], [, b]) => b - a),
    [analytics.sourcesBreakdown]
  );
  const primarySource = sourceBreakdown[0];
  const minScoreValue = typeof filters.minScore === 'number' ? filters.minScore.toString() : 'any';

  const pendingCount = pendingSubmissions.length;
  const connectionStatus = isUsingBackend ? 'Live Chennai backend' : 'Community simulation mode';
  const statusAccent = error
    ? 'bg-red-50 border-red-200'
    : isUsingBackend
    ? 'bg-emerald-50 border-emerald-200'
    : 'bg-amber-50 border-amber-200';
  const statusTextColor = error
    ? 'text-red-800'
    : isUsingBackend
    ? 'text-emerald-800'
    : 'text-amber-800';
  const lastSyncLabel = lastSync ? lastSync.toLocaleString() : 'Not synced yet';

  const handleLocalityClick = (locality: Locality) => {
    if (locality.id) {
      navigate(`/localities/${locality.id}`);
    }
  };

  const handleRefreshClick = async () => {
    try {
      setIsRefreshing(true);
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ query: event.target.value });
  };

  const handleAreaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ area: event.target.value });
  };

  const handlePincodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ pincode: event.target.value });
  };

  const handleMinScoreChange = (value: string) => {
    if (value === 'any') {
      setFilters({ minScore: undefined });
      return;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      setFilters({ minScore: undefined });
      return;
    }
    setFilters({ minScore: parsed });
  };

  const handleResetFilters = () => {
    clearFilters();
  };

  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleRateLocality = async (id: string, newRating: number) => {
    try {
      const updated = await rateLocality(id, newRating);
      if (updated) {
        setNotification({ message: `Thanks — updated ${updated.nameEn} to ${updated.score.toFixed(1)}`, type: 'success' });
      } else {
        setNotification({ message: 'Locality not found', type: 'error' });
      }
    } catch (err) {
      console.error('Locality rating failed', err);
      setNotification({ message: 'Failed to submit rating', type: 'error' });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-amber-200 via-orange-200 to-red-200 overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-transparent opacity-60"></div>
        <div className="absolute inset-0 bg-black/5 pointer-events-none" aria-hidden="true" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${shapesBg})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            opacity: 0.16,
          }}
        />
      </div>
      {/* Header with Seasonal Theming */}
      <div className="relative z-10 bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 text-white shadow-xl ring-1 ring-black/10 border-b border-black/5">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-6 right-6 z-50 rounded-md px-4 py-2 shadow-lg ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`} role="status">
            {notification.message}
          </div>
        )}
        <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="text-white hover:bg-white/20"
                >
                  ← Back
                </Button>
                <div className="text-2xl">🎋</div>
              </div>

              <h1 className="text-4xl font-bold mb-3 text-white">Locality Ratings</h1>
              <p className="text-xl text-amber-100 mb-2">பகுதி மதிப்பீடுகள்</p>
              <p className="text-amber-100 max-w-2xl">
                Discover Chennai's finest neighborhoods - from buzzing commercial hubs to serene residential havens
              </p>
              <p className="text-sm text-amber-200 mt-2">
                உய���ருடன் கூடிய வணிக மையங்களிலிருந்து அமைதியான குடியிருப்பு பகுதிகள் வரை
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-amber-100">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  {analytics.total} areas mapped
                </span>
                {primarySource && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                    <TrendingUp className="w-4 h-4 text-amber-200" />
                    Top source: {primarySource[0]}
                  </span>
                )}
                {hasFiltersApplied && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                    <Filter className="w-4 h-4 text-amber-200" />
                    Filters active
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 rounded-[2rem] bg-white/20 blur-2xl" aria-hidden="true" />
                <img
                  src={heroTexture}
                  alt="Chennai services dashboard"
                  className="relative z-10 h-48 w-72 rounded-[2rem] border border-white/30 object-cover shadow-xl"
                />
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 w-full max-w-xs">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{allLocalities.length}</div>
                    <div className="text-sm text-amber-200">Areas Rated</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {allLocalities.length > 0 ? averageScore.toFixed(1) : '—'}
                    </div>
                    <div className="text-sm text-amber-200">Avg Score</div>
                  </div>
                  <div className="col-span-2 border-t border-white/20 pt-3 text-xs text-amber-100">
                    Backend mode: {isUsingBackend ? 'Live' : 'Simulation'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <Card className={`mb-8 border ${statusAccent} ${statusTextColor}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-white/70">
                <RefreshCw className={`w-5 h-5 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <p className="font-semibold">{connectionStatus}</p>
                <p className="text-sm opacity-80">
                  {error ?? `Last sync: ${lastSyncLabel}`}
                </p>
                {pendingCount > 0 && (
                  <p className="text-sm mt-1">
                    Pending submissions waiting for sync: <span className="font-semibold">{pendingCount}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end md:gap-6">
              <div className="grid grid-cols-2 gap-3 text-left text-sm text-slate-700">
                <div className="rounded-lg bg-white/80 px-3 py-2 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Highest rated</div>
                  <div className="text-base font-semibold text-slate-800">
                    {highestRated ? highestRated.nameEn : '—'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {highestRated ? `${highestRated.score.toFixed(1)} score` : 'Awaiting votes'}
                  </div>
                </div>
                <div className="rounded-lg bg-white/80 px-3 py-2 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Primary source</div>
                  <div className="text-base font-semibold text-slate-800">
                    {primarySource ? primarySource[0] : 'Community'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {primarySource ? `${primarySource[1]} data points` : 'Mixed sources'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                {loading && <span className="text-sm italic opacity-80">Refreshing…</span>}
                <Button
                  variant="outline"
                  onClick={handleRefreshClick}
                  disabled={loading || isRefreshing}
                  className="bg-white/80 hover:bg-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh data
                </Button>
              </div>
            </div>
          </div>
        </Card>
        <Card className="mb-10 border border-amber-100 bg-white/90 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Refine your dashboard</h3>
                <p className="text-sm text-gray-500">
                  Focus the leaderboard by neighbourhood, pincode, or minimum score thresholds.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              disabled={!hasFiltersApplied}
              className="w-full sm:w-auto text-orange-600 hover:bg-orange-100 disabled:text-gray-400"
            >
              Clear filters
            </Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="locality-search" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Search locality
              </Label>
              <Input
                id="locality-search"
                value={filters.query ?? ''}
                onChange={handleQueryChange}
                placeholder="Search by name, highlight, or description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locality-area" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Neighbourhood focus
              </Label>
              <Input
                id="locality-area"
                value={filters.area ?? ''}
                onChange={handleAreaChange}
                placeholder="e.g., Adyar, Mylapore"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locality-pincode" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Pincode
              </Label>
              <Input
                id="locality-pincode"
                value={filters.pincode ?? ''}
                onChange={handlePincodeChange}
                placeholder="6000xx"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Minimum score
              </Label>
              <Select value={minScoreValue} onValueChange={handleMinScoreChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Any score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any score</SelectItem>
                  <SelectItem value="4.5">4.5+</SelectItem>
                  <SelectItem value="4.0">4.0+</SelectItem>
                  <SelectItem value="3.5">3.5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Top 3 Spotlight Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">Top 3 Localities</h2>
            <span className="text-lg text-gray-600">சிறந்த 3 பகுதிகள்</span>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {top3Localities.map((locality, index) => (
              <Card 
                key={locality.id}
                className={`
                  relative p-6 cursor-pointer transition-all duration-500 hover:shadow-xl transform hover:-translate-y-2
                  ${index === 0 
                    ? 'bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-400 shadow-lg' 
                    : index === 1 
                    ? 'bg-gradient-to-br from-gray-100 to-blue-100 border-2 border-gray-300'
                    : 'bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-300'
                  }
                `}
                onClick={() => handleLocalityClick(locality)}
              >
                {/* Rank Badge */}
                <div className={`
                  absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg
                  ${index === 0
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                    : index === 1
                    ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                    : 'bg-gradient-to-br from-orange-400 to-red-500 text-white'
                  }
                `} aria-hidden="true">
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{locality.nameEn}</h3>
                  <p className="text-gray-600 mb-3">{locality.nameTa}</p>
                  <RatingStars value={locality.score} size="lg" />
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{locality.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(locality.highlights ?? []).slice(0, 2).map((highlight) => (
                    <span 
                      key={highlight} 
                      className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium text-gray-700"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-gray-500">
                  Sources: {(locality.sources ?? []).join(', ') || 'Community contributors'}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Explore All Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900">Explore All</h2>
            <span className="text-lg text-gray-600">அனைத்தையும் ஆராயுங்கள்</span>
          </div>
          
          {allLocalities.length > 0 ? (
            <LocalityLeaderboard
              localities={allLocalities}
              onLocalityClick={handleLocalityClick}
              onRate={(id, rating) => handleRateLocality(id, rating)}
            />
          ) : hasFiltersApplied ? (
            <Card className="p-12 text-center bg-white border-2 border-dashed border-gray-300">
              <div className="max-w-md mx-auto space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                  <Filter className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">No matches for these filters</h3>
                <p className="text-sm text-gray-600">
                  Try broadening your neighbourhood, clearing the pincode, or lowering the minimum score to see more localities.
                </p>
                <Button
                  variant="outline"
                  className="border-orange-200 text-orange-600"
                  onClick={handleResetFilters}
                >
                  Clear filters
                </Button>
              </div>
            </Card>
          ) : (
            // Empty State
            <Card className="p-12 text-center bg-white border-2 border-dashed border-gray-300">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No ratings yet
                </h3>
                <p className="text-gray-600 mb-2">இன்னு���் மதிப்பீடுகள் இல்லை</p>
                <p className="text-sm text-gray-500 mb-6">
                  Be the first to rate your neighborhood and help the community discover great places to live!
                </p>
                <Button 
                  onClick={() => navigate('/add-locality')}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Add Your Area
                </Button>
              </div>
            </Card>
          )}
        </section>

        {/* Community Insights */}
        <section className="mt-12">
          <Card className="relative overflow-hidden p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="pointer-events-none absolute -right-12 bottom-0 hidden h-48 w-48 rotate-6 opacity-70 lg:block">
              <img src={insightsGraphic} alt="Insights chart" className="h-full w-full object-cover" />
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="p-3 bg-blue-500 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Community Insights
                  <span className="text-sm font-normal text-gray-600 ml-2">சமூக நுண்ணறிவுகள்</span>
                </h3>
                {allLocalities.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {highestRated ? highestRated.score.toFixed(1) : '—'}
                      </div>
                      <div className="text-sm text-gray-600">Highest Rated</div>
                      <div className="text-xs text-blue-500">
                        {highestRated?.nameEn ?? 'Awaiting ratings'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        ₹
                      </div>
                      <div className="text-sm text-gray-600">Best Value</div>
                      <div className="text-xs text-green-500">
                        {bestValue?.nameEn ?? 'Add more locality data'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 mb-1">🍛</div>
                      <div className="text-sm text-gray-600">Food Paradise</div>
                      <div className="text-xs text-orange-500">
                        {bestFood?.nameEn ?? 'Share your foodie spots'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Start rating your neighbourhoods to unlock community insights.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default LocalityRatingsPage;
