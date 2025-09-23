const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'data', 'pincodeStops.json');

function writeReport(name, text){
  const out = path.join(__dirname, name);
  fs.writeFileSync(out, text, 'utf8');
  console.log('Wrote report ->', out);
}

try {
  const s = fs.readFileSync(p,'utf8');
  let data;
  try{ data = JSON.parse(s); console.log('PARSE: OK'); } catch(e){ console.error('PARSE ERROR:', e.message); process.exitCode=2; return; }

  const pincodes = Object.keys(data);
  const report = [];
  report.push('# Pincode Stops Content Validation Report');
  report.push('Generated: ' + new Date().toISOString());
  report.push('');

  // Basic counts
  report.push(`Total pincodes: ${pincodes.length}`);

  const invalidKeyFormat = [];
  const nonArrayValues = [];
  const emptyArrays = [];
  const emptyStrings = [];
  const duplicateStops = [];
  const numericOnlyNames = [];
  const longNames = [];
  const controlCharNames = [];

  // map normalized name -> set of original forms and pincodes seen
  const nameIndex = new Map();

  for(const pc of pincodes){
    if(!/^\d{6}$/.test(pc)) invalidKeyFormat.push(pc);
    const val = data[pc];
    if(!Array.isArray(val)) { nonArrayValues.push(pc); continue; }
    if(val.length === 0) { emptyArrays.push(pc); }

    const seen = new Set();
    for(const rawName of val){
      if(typeof rawName !== 'string') { emptyStrings.push({pincode:pc, value: rawName}); continue; }
      const name = rawName.trim();
      if(name.length === 0) { emptyStrings.push({pincode:pc, value: rawName}); }
      const lower = name.toLowerCase();
      if(seen.has(lower)) duplicateStops.push({pincode:pc, name});
      seen.add(lower);
      if(/^\d+$/.test(name.replace(/\s+/g,''))) numericOnlyNames.push({pincode:pc, name});
      if(name.length > 80) longNames.push({pincode:pc, name});
      if(/[\x00-\x1F\x7F]/.test(name)) controlCharNames.push({pincode:pc, name});

      const norm = lower.replace(/[\W_]+/g,' ').trim();
      if(!nameIndex.has(norm)) nameIndex.set(norm, {forms: new Set(), pincodes: new Set()});
      const entry = nameIndex.get(norm);
      entry.forms.add(name);
      entry.pincodes.add(pc);
    }
  }

  // Inconsistent capitalization or forms
  const capitalizationIssues = [];
  for(const [norm, obj] of nameIndex.entries()){
    if(obj.forms.size > 1) capitalizationIssues.push({name:norm, forms: Array.from(obj.forms).slice(0,10), pincodes: Array.from(obj.pincodes).slice(0,10)});
  }

  report.push('');
  report.push('## Issues Summary');
  report.push('');
  report.push(`- Invalid-format pincode keys: ${invalidKeyFormat.length}`);
  report.push(`- Non-array values: ${nonArrayValues.length}`);
  report.push(`- Empty stop arrays: ${emptyArrays.length}`);
  report.push(`- Empty / non-string stop entries: ${emptyStrings.length}`);
  report.push(`- Duplicate stop names within same pincode: ${duplicateStops.length}`);
  report.push(`- Numeric-only stop names: ${numericOnlyNames.length}`);
  report.push(`- Very long stop names (>80 chars): ${longNames.length}`);
  report.push(`- Control-char containing names: ${controlCharNames.length}`);
  report.push(`- Inconsistent capitalization/forms for same normalized name: ${capitalizationIssues.length}`);

  report.push('');
  report.push('## Samples and Details');
  report.push('');
  if(invalidKeyFormat.length) { report.push('### Invalid-format pincodes'); report.push(JSON.stringify(invalidKeyFormat, null, 2)); report.push(''); }
  if(nonArrayValues.length) { report.push('### Non-array values (pincodes)'); report.push(JSON.stringify(nonArrayValues, null, 2)); report.push(''); }
  if(emptyArrays.length) { report.push('### Empty arrays (pincodes)'); report.push(JSON.stringify(emptyArrays, null, 2)); report.push(''); }
  if(emptyStrings.length){ report.push('### Empty/non-string stop entries'); report.push(JSON.stringify(emptyStrings.slice(0,20), null, 2)); report.push(''); }
  if(duplicateStops.length){ report.push('### Duplicate stops within a pincode'); report.push(JSON.stringify(duplicateStops.slice(0,40), null, 2)); report.push(''); }
  if(numericOnlyNames.length){ report.push('### Numeric-only names'); report.push(JSON.stringify(numericOnlyNames.slice(0,40), null, 2)); report.push(''); }
  if(longNames.length){ report.push('### Very long names'); report.push(JSON.stringify(longNames.slice(0,40), null, 2)); report.push(''); }
  if(controlCharNames.length){ report.push('### Control-char names'); report.push(JSON.stringify(controlCharNames.slice(0,40), null, 2)); report.push(''); }
  if(capitalizationIssues.length){ report.push('### Inconsistent name forms (sample)'); report.push(JSON.stringify(capitalizationIssues.slice(0,50), null, 2)); report.push(''); }

  report.push('## Data Quality Suggestions');
  report.push('- Manually verify a sample of central and outer pincodes, especially keys with many stops or unexpected names.');
  report.push('- Normalize common abbreviations (e.g., "Rd" vs "Road", "St" vs "Street") if desired.');
  report.push('- Optionally align this dataset to an authoritative postal or transit stops dataset for full validation.');

  const reportText = report.join('\n');
  writeReport('pincode_content_report.md', reportText);
  console.log('\nSummary:');
  console.log(`pincodes=${pincodes.length}, invalidKeys=${invalidKeyFormat.length}, emptyArrays=${emptyArrays.length}, duplicateStops=${duplicateStops.length}, capitalizationIssues=${capitalizationIssues.length}`);

} catch(e) {
  console.error('FILE READ ERROR:', e.message);
}
