
import pincodeStops from './data/pincodeStops.json';

// Mock the maps from TransportService since we can't import TS directly in this simple script context easily without compilation
// I will copy the maps from TransportService.ts manually for this check
const PINCODE_METRO_MAP: Record<string, any> = {
    "600001": { "name": "Mannadi", "line": "Blue Line" },
    "600003": { "name": "Central", "line": "Blue Line" },
    "600005": { "name": "LIC", "line": "Blue Line" },
    "600006": { "name": "Thousand Lights", "line": "Blue Line" },
    "600007": { "name": "LIC", "line": "Blue Line" },
    "600008": { "name": "Egmore", "line": "Green Line" },
    "600009": { "name": "High Court", "line": "Blue Line" },
    "600010": { "name": "Kilpauk", "line": "Green Line" },
    "600014": { "name": "LIC", "line": "Blue Line" },
    "600015": { "name": "Saidapet", "line": "Blue Line" },
    "600016": { "name": "Alandur", "line": "Blue Line" },
    "600018": { "name": "Teynampet", "line": "Blue Line" },
    "600019": { "name": "Wimco Nagar", "line": "Blue Line" },
    "600021": { "name": "Washermanpet", "line": "Blue Line" },
    "600022": { "name": "Guindy", "line": "Blue Line" },
    "600026": { "name": "Vadapalani", "line": "Green Line" },
    "600027": { "name": "Meenambakkam", "line": "Blue Line" },
    "600031": { "name": "Thirumangalam", "line": "Green Line" },
    "600032": { "name": "Guindy", "line": "Blue Line" },
    "600035": { "name": "Nanganallur", "line": "Blue Line" },
    "600036": { "name": "High Court", "line": "Blue Line" },
    "600040": { "name": "Anna Nagar Tower", "line": "Green Line" },
    "600047": { "name": "Meenambakkam", "line": "Blue Line" },
    "600077": { "name": "Koyambedu", "line": "Green Line" },
    "600078": { "name": "Ashok Nagar", "line": "Green Line" },
    "600081": { "name": "Washermanpet", "line": "Blue Line" },
    "600083": { "name": "Ashok Nagar", "line": "Green Line" },
    "600091": { "name": "Saidapet", "line": "Blue Line" },
    "600107": { "name": "Koyambedu", "line": "Green Line" },
    "600131": { "name": "Nanganallur", "line": "Blue Line" },
    "600147": { "name": "Koyambedu", "line": "Green Line" },
    "600148": { "name": "Ashok Nagar", "line": "Green Line" },
    "600161": { "name": "Saidapet", "line": "Blue Line" },
    "600201": { "name": "Nanganallur", "line": "Blue Line" },
    "600217": { "name": "Koyambedu", "line": "Green Line" },
    "600218": { "name": "Ashok Nagar", "line": "Green Line" }
};

const PINCODE_TRAIN_MAP: Record<string, any> = {
    "600002": { "name": "Chintadripet", "line": "MRTS" },
    "600003": { "name": "Park", "line": "South Line" },
    "600004": { "name": "Mylapore", "line": "MRTS" },
    "600005": { "name": "Chepauk", "line": "MRTS" },
    "600007": { "name": "Park", "line": "South Line" },
    "600008": { "name": "Egmore", "line": "South Line" },
    "600009": { "name": "Fort", "line": "South Line" },
    "600010": { "name": "Avadi", "line": "West Line" },
    "600011": { "name": "Perambur", "line": "West Line" },
    "600012": { "name": "Perambur", "line": "West Line" },
    "600014": { "name": "Triplicane", "line": "MRTS" },
    "600015": { "name": "Saidapet", "line": "South Line" },
    "600016": { "name": "St. Thomas Mount", "line": "South Line" },
    "600017": { "name": "Park", "line": "South Line" },
    "600019": { "name": "Tiruvottiyur", "line": "North Line" },
    "600020": { "name": "Thiruvanmiyur", "line": "MRTS" },
    "600022": { "name": "Guindy", "line": "South Line" },
    "600023": { "name": "Perambur", "line": "West Line" },
    "600024": { "name": "Kodambakkam", "line": "South Line" },
    "600025": { "name": "Kasturibai", "line": "MRTS" },
    "600027": { "name": "Meenambakkam", "line": "South Line" },
    "600028": { "name": "Mylapore", "line": "MRTS" },
    "600032": { "name": "Guindy", "line": "South Line" },
    "600033": { "name": "Mambalam", "line": "South Line" },
    "600034": { "name": "Tambaram", "line": "South Line" },
    "600038": { "name": "Villivakkam", "line": "West Line" },
    "600039": { "name": "Ambattur", "line": "West Line" },
    "600044": { "name": "Avadi", "line": "West Line" },
    "600045": { "name": "Pallavaram", "line": "South Line" },
    "600046": { "name": "Perungalathur", "line": "South Line" },
    "600047": { "name": "Meenambakkam", "line": "South Line" },
    "600051": { "name": "Vandalur", "line": "South Line" },
    "600053": { "name": "Chromepet", "line": "South Line" },
    "600056": { "name": "Perungudi", "line": "MRTS" },
    "600061": { "name": "Avadi", "line": "West Line" },
    "600062": { "name": "Thiruninravur", "line": "West Line" },
    "600065": { "name": "Chengalpattu", "line": "South Line" },
    "600076": { "name": "Korattur", "line": "West Line" },
    "600085": { "name": "Kotturpuram", "line": "MRTS" },
    "600091": { "name": "Saidapet", "line": "South Line" },
    "600093": { "name": "Thiruvanmiyur", "line": "MRTS" },
    "600094": { "name": "Perungudi", "line": "MRTS" },
    "600099": { "name": "Ambattur", "line": "West Line" },
    "600102": { "name": "Ambattur", "line": "West Line" },
    "600104": { "name": "Thirumullaivoyal", "line": "West Line" },
    "600105": { "name": "Ennore", "line": "North Line" },
    "600106": { "name": "Thiruvanmiyur", "line": "MRTS" },
    "600107": { "name": "Tirusulam", "line": "South Line" },
    "600111": { "name": "Pallavaram", "line": "South Line" },
    "600112": { "name": "Avadi", "line": "West Line" },
    "600113": { "name": "Vandalur", "line": "South Line" },
    "600114": { "name": "Tambaram", "line": "South Line" },
    "600139": { "name": "Chengalpattu", "line": "South Line" },
    "600142": { "name": "Thiruninravur", "line": "West Line" },
    "600146": { "name": "Korattur", "line": "West Line" },
    "600150": { "name": "Ambattur", "line": "West Line" },
    "600152": { "name": "Perambur", "line": "West Line" },
    "600155": { "name": "Kotturpuram", "line": "MRTS" },
    "600161": { "name": "Saidapet", "line": "South Line" },
    "600163": { "name": "Thiruvanmiyur", "line": "MRTS" },
    "600164": { "name": "Perungudi", "line": "MRTS" },
    "600169": { "name": "Ambattur", "line": "West Line" },
    "600172": { "name": "Ambattur", "line": "West Line" },
    "600174": { "name": "Thirumullaivoyal", "line": "West Line" },
    "600175": { "name": "Ennore", "line": "North Line" },
    "600176": { "name": "Thiruvanmiyur", "line": "MRTS" },
    "600177": { "name": "Tirusulam", "line": "South Line" },
    "600181": { "name": "Pallavaram", "line": "South Line" },
    "600182": { "name": "Avadi", "line": "West Line" },
    "600183": { "name": "Vandalur", "line": "South Line" },
    "600184": { "name": "Tambaram", "line": "South Line" },
    "600209": { "name": "Chengalpattu", "line": "South Line" },
    "600212": { "name": "Thiruninravur", "line": "West Line" },
    "600216": { "name": "Korattur", "line": "West Line" }
};

const busData = pincodeStops as Record<string, any>;

const missingData: string[] = [];
const partialData: string[] = [];
const fullData: string[] = [];

// Check range 600001 to 600130 (common Chennai range)
for (let i = 1; i <= 130; i++) {
    const pincode = `600${i.toString().padStart(3, '0')}`;

    const hasBus = !!busData[pincode];
    const hasMetro = !!PINCODE_METRO_MAP[pincode];
    const hasTrain = !!PINCODE_TRAIN_MAP[pincode];

    if (hasBus && hasMetro && hasTrain) {
        fullData.push(pincode);
    } else if (hasBus || hasMetro || hasTrain) {
        partialData.push(pincode);
    } else {
        missingData.push(pincode);
    }
}

import * as fs from 'fs';

// ... (previous code)

const report = `
Total Pincodes Checked: 130
Full Coverage (Bus + Metro + Train): ${fullData.length}
Partial Coverage: ${partialData.length}
Missing Data: ${missingData.length}
Missing Pincodes: ${missingData.join(', ')}
`;

fs.writeFileSync('coverage_report.txt', report);
console.log('Report written to coverage_report.txt');
