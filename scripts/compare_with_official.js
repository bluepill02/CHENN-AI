const fs = require('fs');
const path = require('path');

const ourPath = path.join(__dirname, '..', 'data', 'pincodeStops.json');
const officialPath = path.join(process.env.USERPROFILE || 'C:/Users/smvin', 'Downloads', 'chennai_district_official_pincodes_600001-600130.json');

function norm(s){
  return s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}

function write(mdName, txt){
  const out = path.join(__dirname, mdName);
  fs.writeFileSync(out, txt, 'utf8');
  console.log('Wrote', out);
}

try{
  const our = JSON.parse(fs.readFileSync(ourPath,'utf8'));
  const off = JSON.parse(fs.readFileSync(officialPath,'utf8'));

  const report = [];
  report.push('# Official Comparison Report');
  report.push('Generated: ' + new Date().toISOString());
  report.push('');

  const pincodesToCheck = Object.keys(off).sort();
  let total=0, matched=0, partial=0, missing=0;

  for(const pc of pincodesToCheck){
    total++;
    const offStops = (off[pc] && off[pc].major_bus_stops) || [];
    const ourStops = our[pc] || [];
    const offNorm = offStops.map(norm);
    const ourNorm = ourStops.map(norm);

    const pcReport = [];
    pcReport.push(`## ${pc}`);
    pcReport.push(`official_stops: ${JSON.stringify(offStops)}`);
    pcReport.push(`our_stops: ${JSON.stringify(ourStops)}`);

    // For each official stop, check if any of our stops contain it (substring) or exact match
    const perOff = offNorm.map((o,idx)=>{
      const foundExact = ourNorm.includes(o);
      const foundContains = ourNorm.some(u=> u.includes(o) || o.includes(u) );
      return {off: offStops[idx], ok: foundExact || foundContains, foundExact, foundContains};
    });

    const okCount = perOff.filter(x=>x.ok).length;
    if(offStops.length === 0){
      pcReport.push('- official has no stops (cannot verify)');
      missing++;
    } else if(okCount === offStops.length){
      pcReport.push('- ALL official stops matched (exact/substring)'); matched++;
    } else if(okCount > 0){
      pcReport.push(`- PARTIAL matches: ${okCount}/${offStops.length}`); partial++;
    } else {
      pcReport.push('- NO matches for official stops'); missing++;
    }

    // show details
    pcReport.push('detailed:');
    pcReport.push(JSON.stringify(perOff, null, 2));
    report.push(pcReport.join('\n'));
  }

  report.unshift(`Total checked: ${total}  Matched: ${matched}  Partial: ${partial}  Missing: ${missing}`);
  const txt = report.join('\n\n');
  write('official_compare_report.md', txt);
  console.log('Summary:', `total=${total}, matched=${matched}, partial=${partial}, missing=${missing}`);

}catch(e){
  console.error('ERROR:', e.message);
}
