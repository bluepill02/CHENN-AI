const fs = require('fs');
const path = require('path');

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const cachePath = path.join(__dirname, '.geocache.json');
const matchesPath = path.join(__dirname, 'geocode_matches.csv');
const outPath = path.join(__dirname, 'filled_nearest_candidates.csv');

const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
const csv = fs.readFileSync(matchesPath, 'utf8').trim().split(/\r?\n/);
const header = csv.shift();

// Build list of our stops with coords from cache
const ourStops = Object.keys(cache).filter(k => cache[k] && typeof cache[k].lat === 'number').map(k => ({name:k,lat:cache[k].lat,lon:cache[k].lon,display:cache[k].display_name||''}));

const unresolved = csv.map(line => {
  const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // split CSV safe
  const pincode = cols[0].replace(/"/g,'');
  const official = cols[1].replace(/"/g,'');
  const status = cols[4].replace(/"/g,'');
  return {pincode,official,status,raw:cols};
}).filter(r => r.status === 'OFF_NO_GEOCODE' || r.status === 'NO_OUR_GEOCODE');

const rows = [];
rows.push('pincode,official,status,candidate_our_stop,candidate_distance_m,our_display_name');

for (const r of unresolved) {
  // try to find geocoded entry in cache for the official name (maybe null)
  const offEntry = cache[r.official];
  if (offEntry && offEntry.lat && offEntry.lon) {
    // compute nearest ourStop
    let best = null;
    for (const s of ourStops) {
      const d = haversine(offEntry.lat, offEntry.lon, s.lat, s.lon);
      if (!best || d < best.d) best = {stop:s,d};
    }
    rows.push(`${r.pincode},"${r.official}","${r.status}","${best.stop.name}","${Math.round(best.d)}","${best.stop.display.replace(/\"/g,'')||''}"`);
    continue;
  }

  // if official not geocoded, do nearest by searching cached places whose name substrings appear in official label
  const candidates = ourStops.map(s => ({s,score: r.official.toLowerCase().includes(s.name.toLowerCase()) ? 0 : 1}));
  candidates.sort((a,b)=>a.score-b.score);
  const top = candidates[0];
  if (top && top.s) {
    rows.push(`${r.pincode},"${r.official}","${r.status}","${top.s.name}","","${top.s.display.replace(/\"/g,'')||''}"`);
  } else {
    rows.push(`${r.pincode},"${r.official}","${r.status}","","",""`);
  }
}

fs.writeFileSync(outPath, rows.join('\n'), 'utf8');
console.log('Wrote', outPath);
