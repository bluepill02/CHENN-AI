import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFoodHunt } from '../../services/FoodHuntService';
import { formatRupees, spicyToEmoji } from '../../utils/foodFormatters';
import { Button } from '../ui/button';

export default function DishDetail() {
  const { dishId } = useParams();
  const navigate = useNavigate();
  const { getDishById, isUsingBackend, lastSync, refresh, loading } = useFoodHunt();

  const dishEntry = useMemo(() => {
    if (!dishId) return undefined;
    return getDishById(dishId);
  }, [dishId, getDishById]);

  return (
    <div className="min-h-screen p-6 bg-ivory">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-maroon">Dish spotlight</h1>
            <p className="text-xs text-slate-600">
              {isUsingBackend ? 'Live menu from Chennai Food Hunt' : 'Community submission preview'}
              {lastSync && ` • Updated ${lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
            <Button size="sm" onClick={refresh} disabled={loading} className="bg-turmeric text-maroon hover:opacity-90">
              {loading ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-md">
          {!dishEntry ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🍲</div>
              <h2 className="text-lg font-semibold text-maroon">Dish not found</h2>
              <p className="text-sm text-slate-600 mt-1">Maybe it was renamed or still syncing. Try refreshing or head back to Food Hunt.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-maroon">{dishEntry.dish.nameEn}</h2>
                  <span className="text-lg text-turmeric">{dishEntry.dish.nameTa}</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Served at <span className="font-semibold text-maroon">{dishEntry.vendor.nameEn}</span> in {dishEntry.vendor.areaEn}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-ivory rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Price</div>
                  <div className="text-lg font-semibold text-maroon">{formatPriceCopy(dishEntry.dish.price)}</div>
                </div>
                <div className="bg-ivory rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Spice level</div>
                  <div className="text-lg font-semibold text-maroon">{spicyToEmoji(dishEntry.dish.spicyLevel)}</div>
                </div>
                <div className="bg-ivory rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Rating</div>
                  <div className="text-lg font-semibold text-maroon">{dishEntry.dish.rating?.toFixed(1) ?? '—'}</div>
                </div>
              </div>

              {dishEntry.dish.description && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-900">
                  {dishEntry.dish.description}
                </div>
              )}

              <div className="text-sm text-slate-700 space-y-1">
                <div>
                  <span className="font-semibold text-maroon">Cuisines:</span> {dishEntry.vendor.cuisines.join(' • ')}
                </div>
                <div>
                  <span className="font-semibold text-maroon">Availability:</span> {dishEntry.dish.availability ?? 'All day'}
                </div>
                {dishEntry.vendor.features?.length ? (
                  <div>
                    <span className="font-semibold text-maroon">Highlights:</span> {dishEntry.vendor.features.join(' • ')}
                  </div>
                ) : null}
                {dishEntry.vendor.isCommunitySubmission && (
                  <div className="text-xs text-amber-700 mt-2">
                    Community submission awaiting backend sync • சமூக உணவு பரிந்துரை
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button onClick={() => navigate(-1)} className="bg-maroon text-white hover:opacity-95">
                  Back to Food Hunt
                </Button>
                <Button variant="outline" onClick={() => navigate('/food-hunt/new')}>
                  Share a spot
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatPriceCopy(price: number | undefined) {
  if (price === undefined || price === 0) {
    return 'Price on request';
  }
  return formatRupees(Math.round(price));
}
