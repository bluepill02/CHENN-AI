const fs = require('fs');
const path = require('path');

const pincodeStopsPath = path.join('c:/Users/smvin/Downloads/CHENN-AI/data/pincodeStops.json');
const transportServicePath = path.join('c:/Users/smvin/Downloads/CHENN-AI/services/TransportService.ts');

try {
    const pincodeStops = JSON.parse(fs.readFileSync(pincodeStopsPath, 'utf8'));
    const transportServiceContent = fs.readFileSync(transportServicePath, 'utf8');

    const knownPincodes = Object.keys(pincodeStops);
    const missingPincodes = [];
    const missingTransportMap = [];

    // Check for missing pincodes in range 600001 - 600130
    for (let i = 600001; i <= 600130; i++) {
        const pin = i.toString();
        if (!knownPincodes.includes(pin)) {
            missingPincodes.push(pin);
        }
    }

    // Check TransportService mapping
    // Extract keys from PINCODE_METRO_MAP and PINCODE_TRAIN_MAP
    const metroMapMatch = transportServiceContent.match(/const PINCODE_METRO_MAP[^=]*= ({[\s\S]*?});/);
    const trainMapMatch = transportServiceContent.match(/const PINCODE_TRAIN_MAP[^=]*= ({[\s\S]*?});/);

    if (metroMapMatch && trainMapMatch) {
        // This is a rough extraction, might fail if the object literal is complex or has comments inside keys
        // Better to just regex for keys
        const metroKeys = (metroMapMatch[1].match(/'\d{6}':/g) || []).map(k => k.replace(/'|:/g, ''));
        const trainKeys = (trainMapMatch[1].match(/'\d{6}':/g) || []).map(k => k.replace(/'|:/g, ''));

        knownPincodes.forEach(pin => {
            if (!metroKeys.includes(pin) && !trainKeys.includes(pin)) {
                missingTransportMap.push(pin);
            }
        });
    }

    console.log('--- Analysis Result ---');
    console.log(`Total Known Pincodes: ${knownPincodes.length}`);
    console.log(`Missing Pincodes (600001-600130): ${missingPincodes.length}`);
    if (missingPincodes.length > 0) {
        console.log('Example Missing:', missingPincodes.slice(0, 10));
    }
    console.log(`Pincodes missing Transport Mapping: ${missingTransportMap.length}`);
    if (missingTransportMap.length > 0) {
        console.log('Example Missing Transport:', missingTransportMap.slice(0, 10));
    }

} catch (err) {
    console.error('Error:', err);
}
