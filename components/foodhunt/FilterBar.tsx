interface FilterBarProps {
  query: string;
  setQuery: (q: string) => void;
  priceLevel: number | null;
  setPriceLevel: (p: number | null) => void;
  vegFilter: 'veg'|'non-veg'|'mixed'|'all';
  setVegFilter: (v: 'veg'|'non-veg'|'mixed'|'all') => void;
  openNow: boolean;
  setOpenNow: (b: boolean) => void;
}

export function FilterBar({ query, setQuery, priceLevel, setPriceLevel, vegFilter, setVegFilter, openNow, setOpenNow }: FilterBarProps) {
  return (
    <div className="p-4 bg-ivory rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search dishes, vendor or area"
        className="flex-1 border rounded-md px-3 py-2"
      />

      <div className="flex items-center gap-2">
        <button onClick={() => setPriceLevel(null)} className={`px-2 py-1 rounded ${priceLevel===null? 'bg-maroon text-white' : 'bg-white border border-gray-200'}`}>All</button>
        <button onClick={() => setPriceLevel(1)} className={`px-2 py-1 rounded ${priceLevel===1? 'bg-maroon text-white' : 'bg-white border border-gray-200'}`}>₹</button>
        <button onClick={() => setPriceLevel(2)} className={`px-2 py-1 rounded ${priceLevel===2? 'bg-maroon text-white' : 'bg-white border border-gray-200'}`}>₹₹</button>
        <button onClick={() => setPriceLevel(3)} className={`px-2 py-1 rounded ${priceLevel===3? 'bg-maroon text-white' : 'bg-white border border-gray-200'}`}>₹₹₹</button>
      </div>

      <div className="flex items-center gap-2">
        <select value={vegFilter} onChange={(e) => setVegFilter(e.target.value as any)} className="border px-2 py-1 rounded">
          <option value="all">All</option>
          <option value="veg">Veg</option>
          <option value="non-veg">Non-veg</option>
          <option value="mixed">Mixed</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={openNow} onChange={(e) => setOpenNow(e.target.checked)} /> Open Now
        </label>
      </div>
    </div>
  );
}

export default FilterBar;
