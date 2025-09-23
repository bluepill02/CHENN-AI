const fs = require('fs');
const path = require('path');

const ourPath = path.join(__dirname, '..', 'data', 'pincodeStops.json');
const officialPath = path.join(process.env.USERPROFILE || 'C:/Users/smvin', 'Downloads', 'chennai_district_official_pincodes_600001-600130.json');

function norm(s){
  return s.toLowerCase().replace(/[\u2018\u2019\u201C\u201D\'\"().,/&-]+/g,' ').replace(/\s+/g,' ').trim();
}

function levenshtein(a,b){
  if(!a||!b) return Math.max(a? a.length:0, b? b.length:0);
  const m=a.length,n=b.length; const dp=Array(m+1).fill().map(()=>Array(n+1).fill(0));
  for(let i=0;i<=m;i++) dp[i][0]=i; for(let j=0;j<=n;j++) dp[0][j]=j;
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return dp[m][n];
}

function write(mdName, txt){
  const out = path.join(__dirname, mdName);
  fs.writeFileSync(out, txt, 'utf8');
  console.log('Wrote', out);
}

try{
  const our = JSON.parse(fs.readFileSync(ourPath,'utf8'));
  const off = JSON.parse(fs.readFileSync(officialPath,'utf8'));

  const report=[];
  const codes = Object.keys(off).sort();
  let total=0, allMatched=0, partial=0, none=0;

  report.push('# Improved Official Comparison');
  report.push('Generated: '+new Date().toISOString());

  for(const pc of codes){
    total++;
    const offStops = (off[pc] && off[pc].major_bus_stops) || [];
    const ourStops = our[pc] || [];
    const offN = offStops.map(norm);
    const ourN = ourStops.map(norm);

    const detail = [];
    let okCount=0;
    for(let i=0;i<offN.length;i++){
      const o=offN[i];
      let ok=false; let reason='';
      for(const u of ourN){
        if(u===o){ ok=true; reason='exact'; break; }
        if(u.includes(o) || o.includes(u)){ ok=true; reason='substr'; break; }
        const d = levenshtein(u,o);
        const thresh = Math.max(1, Math.floor(Math.min(u.length,o.length)*0.25));
        if(d <= thresh){ ok=true; reason='lev('+d+')'; break; }
      }
      if(ok) okCount++;
      detail.push({official: offStops[i], ok, reason});
    }

    if(offStops.length ===0){ none++; report.push(`## ${pc}\nofficial has no stops (skip)`); continue; }
    if(okCount === offStops.length){ allMatched++; report.push(`## ${pc}\nALL matched (${okCount}/${offStops.length})\n` + JSON.stringify(detail,null,2)); }
    else if(okCount>0){ partial++; report.push(`## ${pc}\nPARTIAL (${okCount}/${offStops.length})\n` + JSON.stringify(detail,null,2)); }
    else { none++; report.push(`## ${pc}\nNONE matched\n` + JSON.stringify(detail,null,2)); }
  }

  report.unshift(`total=${total}, allMatched=${allMatched}, partial=${partial}, none=${none}`);
  write('official_compare_report_improved.md', report.join('\n\n'));
  console.log('Summary:', `total=${total}, allMatched=${allMatched}, partial=${partial}, none=${none}`);

}catch(e){ console.error('ERROR', e.message); }
