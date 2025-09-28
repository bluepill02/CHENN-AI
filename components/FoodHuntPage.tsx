import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFoodHunt } from '../services/FoodHuntService';
import { formatDistance } from '../utils/foodFormatters';
import DishCard from './foodhunt/DishCard';
import FilterBar from './foodhunt/FilterBar';
import VendorHeader from './foodhunt/VendorHeader';
import { Button } from './ui/button';
import { Card } from './ui/card';

export default function FoodHuntPage() {
  const navigate = useNavigate();
  const {
    vendors,
    loading,
    error,
    isUsingBackend,
    lastSync,
    refresh,
    pendingSubmissions,
  } = useFoodHunt();
  const [query, setQuery] = useState('');
  const [priceLevel, setPriceLevel] = useState<number | null>(null);
  const [vegFilter, setVegFilter] = useState<'all'|'veg'|'non-veg'|'mixed'>('all');
  const [openNow, setOpenNow] = useState(false);

  const filtered = useMemo(() => {
    return vendors.filter(v => {
      if (priceLevel && v.priceLevel !== priceLevel) return false;
      if (vegFilter !== 'all' && v.vegType !== vegFilter) return false;
      if (openNow && !v.openNow) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!v.nameEn.toLowerCase().includes(q) && !v.nameTa.includes(q) && !v.cuisines.join(' ').toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => a.nameEn.localeCompare(b.nameEn));
  }, [vendors, query, priceLevel, vegFilter, openNow]);

  const groupedByArea = useMemo(() => {
    return filtered.reduce<Record<string, typeof vendors>>((acc, vendor) => {
      const key = vendor.areaEn;
      if (!acc[key]) acc[key] = [];
      acc[key].push(vendor);
      return acc;
    }, {});
  }, [filtered]);

  const renderDistance = (distanceKm: number) => {
    if (!distanceKm) return 'Distance updates soon';
    return formatDistance(distanceKm);
  };

  return (
    <div className="min-h-screen p-6 bg-ivory relative silk-weave">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="bilingual-header">
            <div className="eng text-maroon text-2xl">Food Hunt</div>
            <div className="tam text-turmeric text-base">சாப்பாடு தேடு</div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-700">Back</Button>
            <Button size="sm" className="bg-maroon text-white hover:opacity-95" onClick={() => alert('Share Food Hunt')}>Share</Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 bg-white shadow-sm rounded-xl border border-turmeric/30 p-4">
          <div>
            <p className="text-sm font-semibold text-maroon">
              {isUsingBackend ? 'Connected to Chennai Food Hunt network' : 'Community simulation active'}
            </p>
            <p className="text-xs text-slate-600">
              {error
                ? error
                : lastSync
                  ? `Last updated ${lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Preparing delicious discovery feed...'}
            </p>
            {pendingSubmissions.length > 0 && (
              <p className="text-xs text-amber-700 mt-1">
                {pendingSubmissions.length} community submission{pendingSubmissions.length > 1 ? 's' : ''} awaiting sync.
              </p>
            )}
          </div>
          <Button
            onClick={refresh}
            size="sm"
            className="bg-turmeric text-maroon hover:opacity-90 self-start sm:self-auto"
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh spots'}
          </Button>
        </div>

        <FilterBar
          query={query}
          setQuery={setQuery}
          priceLevel={priceLevel}
          setPriceLevel={setPriceLevel}
          vegFilter={vegFilter}
          setVegFilter={setVegFilter}
          openNow={openNow}
          setOpenNow={setOpenNow}
        />

        <div className="mt-6 space-y-6">
          {loading && vendors.length === 0 ? (
            <div className="p-8 bg-white rounded-xl shadow-md">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-100 rounded w-3/5" />
                <div className="h-3 bg-slate-100 rounded w-2/5" />
                <div className="h-3 bg-slate-100 rounded" />
                <div className="h-3 bg-slate-100 rounded" />
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 bg-white rounded-xl shadow-md text-center">
              <div className="mb-4 text-6xl">🍽️</div>
              <h3 className="text-xl font-semibold text-maroon">No food hunts yet</h3>
              <p className="text-sm text-slate-700">இன்னும் இல்லை</p>
              <p className="mt-3 text-slate-600">Hop in for a bite • சாப்பிட வாருங்கள்</p>
            </div>
          ) : (
            Object.entries(groupedByArea).map(([area, areaVendors]) => (
              <div key={area}>
                <div className="mb-3">
                  <h2 className="text-lg font-semibold text-maroon">{area}</h2>
                </div>
                <div className="space-y-4">
                  {areaVendors.map(v => (
                    <Card key={v.id} className="p-4 bg-ivory border-turmeric/60 shadow chennai-md rounded-xl">
                      <VendorHeader vendor={v} />

                      {v.isCommunitySubmission && (
                        <div className="mt-2 text-xs text-amber-700">
                          Community submission awaiting approval • சமூக உணவு பரிந்துரை
                        </div>
                      )}

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {v.dishes.map((d:any) => (
                          <DishCard key={d.id} dish={d} onClick={() => navigate(`/food-hunt/${d.id}`)} />
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-slate-600">
                          {v.features?.length ? v.features.join(' • ') : v.tags?.join(' • ') ?? 'Chennai favourite'}
                        </div>
                        <div className="text-xs text-slate-600">{renderDistance(v.distanceKm)}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floating Add FAB */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button className="rounded-full p-4 bg-maroon text-white shadow-2xl" onClick={() => navigate('/food-hunt/new')}>+</Button>
        </div>

      </div>
    </div>
  );
}
