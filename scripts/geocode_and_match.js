const fs = require('fs');
const path = require('path');
const https = require('https');

const ourPath = path.join(__dirname, '..', 'data', 'pincodeStops.json');
const officialPath = path.join(process.env.USERPROFILE || 'C:/Users/smvin', 'Downloads', 'chennai_district_official_pincodes_600001-600130.json');
const cacheFile = path.join(__dirname, '.geocache.json');

function sleep(ms){ return new Promise(res=>setTimeout(res,ms)); }

function loadCache(){ try{ return JSON.parse(fs.readFileSync(cacheFile,'utf8')); }catch(e){ return {}; }}
function saveCache(c){ fs.writeFileSync(cacheFile, JSON.stringify(c,null,2),'utf8'); }

function nominatimSearch(q){
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=3&q=' + encodeURIComponent(q + ', Chennai, India');
  return new Promise((resolve, reject)=>{
    https.get(url, {headers:{'User-Agent':'CHENN-AI/1.0 (contact: local)'}}, res=>{
      let body=''; res.on('data', c=>body+=c); res.on('end', ()=>{
        try{ const j = JSON.parse(body); resolve(j); }catch(e){ reject(e); }
      });
    }).on('error', reject);
  });
}

function bestCandidate(results, prefer){
  if(!results || results.length===0) return null;
  // prefer result whose display_name contains prefer parts
  const p = prefer.toLowerCase();
  for(const r of results){ if(r.display_name.toLowerCase().includes(p)) return r; }
  return results[0];
}

function haversine(a,b){
  const toRad = v=>v*Math.PI/180; const R=6371e3;
  const lat1=toRad(a.lat), lat2=toRad(b.lat); const dlat=lat2-lat1; const dlon=toRad(b.lon)-toRad(a.lon);
  const hav = Math.sin(dlat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dlon/2)**2;
  const c = 2*Math.atan2(Math.sqrt(hav), Math.sqrt(1-hav));
  return R*c; // meters
}

async function geocodeAll(){
  const our = JSON.parse(fs.readFileSync(ourPath,'utf8'));
  const off = JSON.parse(fs.readFileSync(officialPath,'utf8'));
  const cache = loadCache();

  const uniqueNames = new Set();
  for(const pc of Object.keys(off)) (off[pc].major_bus_stops||[]).forEach(s=>uniqueNames.add(s));
  for(const pc of Object.keys(our)) (our[pc]||[]).forEach(s=>uniqueNames.add(s));

  const names = Array.from(uniqueNames).sort();
  const results={};
  let i=0;
  for(const name of names){
    i++; if(cache[name]){ results[name]=cache[name]; continue; }
    console.log(`Geocoding (${i}/${names.length}): ${name}`);
    try{
      const res = await nominatimSearch(name);
      const pick = bestCandidate(res, name);
      if(pick) results[name]={lat: parseFloat(pick.lat), lon: parseFloat(pick.lon), display_name: pick.display_name};
      else results[name]=null;
      cache[name]=results[name];
      saveCache(cache);
    }catch(e){ console.error('geocode error for', name, e.message); cache[name]=null; saveCache(cache); }
    await sleep(1100);
  }

  // Now match official stops to our stops by proximity
  const rows = [];
  for(const pc of Object.keys(off).sort()){
    const offStops = (off[pc].major_bus_stops||[]);
    const ourStops = (our[pc]||[]);
    for(const ofs of offStops){
      const ofsCoord = results[ofs];
      if(!ofsCoord){ rows.push([pc, ofs, '', '', 'OFF_NO_GEOCODE', '']); continue; }
      let best=null; let bestd=1e12; let bestName='';
      for(const ours of ourStops){
        const oursCoord = results[ours];
        if(!oursCoord) continue;
        const d = haversine({lat: ofsCoord.lat, lon: ofsCoord.lon}, {lat: oursCoord.lat, lon: oursCoord.lon});
        if(d < bestd){ bestd=d; best=oursCoord; bestName=ours; }
      }
      if(best){ rows.push([pc, ofs, bestName, bestd.toFixed(1), 'MATCHED', best.display_name]); }
      else { rows.push([pc, ofs, '', '', 'NO_OUR_GEOCODE', '']); }
    }
  }

  // save CSV and report
  const csv = ['pincode,official_stop,our_closest_stop,distance_m,match_status,our_display_name'].concat(rows.map(r=> r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(','))).join('\n');
  fs.writeFileSync(path.join(__dirname,'geocode_matches.csv'), csv, 'utf8');
  fs.writeFileSync(path.join(__dirname,'geocode_summary.json'), JSON.stringify({rowsCount:rows.length},null,2),'utf8');
  console.log('Saved geocode_matches.csv and summary');
}

geocodeAll().catch(e=>{ console.error(e); process.exit(1); });
