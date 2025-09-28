// Test Chennai Pincode Coverage
import {
  getChennaiCoverageStats,
  listKnownPincodes
} from '../services/PincodeRepository';

console.log('=== CHENNAI PINCODE COVERAGE TEST ===\n');

const allPincodes = listKnownPincodes();
console.log(`Total Pincodes Available: ${allPincodes.length}`);
console.log(`Range: ${allPincodes[0]} to ${allPincodes[allPincodes.length - 1]}\n`);

const stats = getChennaiCoverageStats();
console.log('Coverage Statistics:');
console.log(JSON.stringify(stats, null, 2));

console.log('\n=== SAMPLE PINCODES BY ZONE ===');
Object.entries(stats.zones).forEach(([zone, data]) => {
  console.log(`\n${zone}: ${data.count} pincodes`);
  console.log(`Sample: ${data.pincodes.join(', ')}...`);
});

console.log('\n=== VERIFICATION: Missing Ranges Check ===');
const ranges = [
  { start: 600001, end: 600045, name: 'Core Chennai' },
  { start: 600046, end: 600070, name: 'South Chennai Suburbs' },
  { start: 600071, end: 600095, name: 'West Chennai & IT Areas' },
  { start: 600096, end: 600123, name: 'IT Corridor & Extensions' }
];

ranges.forEach(range => {
  const missing = [];
  for (let i = range.start; i <= range.end; i++) {
    if (!allPincodes.includes(i.toString())) {
      missing.push(i.toString());
    }
  }
  console.log(`${range.name}: ${missing.length === 0 ? 'COMPLETE' : `Missing ${missing.length} pincodes`}`);
  if (missing.length > 0 && missing.length <= 10) {
    console.log(`  Missing: ${missing.join(', ')}`);
  }
});