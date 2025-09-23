const fs = require('fs');
const path = require('path');
const https = require('https');

const cacheFile = path.join(__dirname, '.geocache.json');
const matchesCsv = path.join(__dirname, 'geocode_matches.csv');
const officialPath = path.join(process.env.USERPROFILE || 'C:/Users/smvin', 'Downloads', 'chennai_district_official_pincodes_600001-600130.json');

function loadCache(){ try{ return JSON.parse(fs.readFileSync(cacheFile,'utf8')); }catch(e){ return {}; }}
function saveCache(c){ fs.writeFileSync(cacheFile, JSON.stringify(c,null,2),'utf8'); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function nominatimSearch(q){
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=3&q=' + encodeURIComponent(q + ', Chennai, India');
  return new Promise((resolve,reject)=>{
    https.get(url, {headers:{'User-Agent':'CHENN-AI/1.0 (contact: local)'}}, res=>{
      let body=''; res.on('data', c=>body+=c); res.on('end', ()=>{
        try{ resolve(JSON.parse(body)); }catch(e){ reject(e); }
      });
    }).on('error', reject);
  });
}

function genVariants(name, area, pincode){
  const v = new Set();
  const base = name.trim();
  v.add(base);
  v.add(base + ' bus stop');
  v.add(base + ' bus stand');
  v.add(base + ' bus terminus');
  v.add(base + ' bus depot');
  v.add(base + ' Chennai');
  v.add(base + ', Chennai');
  v.add(base + ' Chennai India');
  if(area) v.add(base + ' ' + area);
  if(pincode) v.add(base + ' ' + pincode);
  // remove duplicates and return array with base-first
  return Array.from(v);
}

async function retry(){
  const cache = loadCache();
  const off = JSON.parse(fs.readFileSync(officialPath,'utf8'));
  const failedNames = new Set();

  // collect names from CSV where status is OFF_NO_GEOCODE or NO_OUR_GEOCODE
  if(fs.existsSync(matchesCsv)){
    const lines = fs.readFileSync(matchesCsv,'utf8').split(/\r?\n/).slice(1).filter(Boolean);
    for(const line of lines){
      const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // naive CSV split preserving quoted commas
      const status = cols[4] ? cols[4].replace(/^"|"$/g,'') : '';
      const official = cols[1] ? cols[1].replace(/^"|"$/g,'') : '';
      const ourName = cols[2] ? cols[2].replace(/^"|"$/g,'') : '';
      if(status === 'OFF_NO_GEOCODE') failedNames.add(official);
      if(status === 'NO_OUR_GEOCODE' && ourName) failedNames.add(ourName);
    }
  }

  // also include cache keys with null
  for(const k of Object.keys(cache)) if(cache[k] === null) failedNames.add(k);

  console.log('Failed names to retry:', failedNames.size);
  const report = [];
  let resolved=0, tried=0;

  for(const name of Array.from(failedNames)){
    tried++;
    if(cache[name] && cache[name] !== null){ continue; }
    // try variants
    // find area or pincode from official data if present
    let area=null, pincode=null;
    for(const pc of Object.keys(off)){
      const arr = off[pc].major_bus_stops || [];
      if(arr.includes(name)){ area = off[pc].area || null; pincode = pc; break; }
    }
    const variants = genVariants(name, area, pincode);
    console.log(`Trying ${variants.length} variants for: ${name}`);
    let found = null;
    for(const v of variants){
      try{
        const res = await nominatimSearch(v);
        if(res && res.length>0){
          const pick = res[0];
          found = {lat: parseFloat(pick.lat), lon: parseFloat(pick.lon), display_name: pick.display_name, query: v};
          cache[name]=found; saveCache(cache); resolved++; break;
        }
      }catch(e){ console.error('query error', v, e.message); }
      await sleep(1100);
    }
    if(!found){ cache[name]=null; saveCache(cache); report.push({name, triedVariants: variants.length}); }
    else report.push({name, resolvedWith: found.query, display_name: found.display_name});
  }

  saveCache(cache);
  const md = ['# Geocode Retry Report', 'Generated: '+new Date().toISOString(), '', `Failed names attempted: ${tried}`, `Resolved: ${resolved}`, '', 'Details:', '', JSON.stringify(report, null, 2)];
  fs.writeFileSync(path.join(__dirname,'geocode_retry_report.md'), md.join('\n'), 'utf8');
  console.log('Retry complete.', `resolved=${resolved}`, `tried=${tried}`);
}

retry().catch(e=>{ console.error(e); process.exit(1); });
