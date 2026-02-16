const fs = require('fs');
const path = require('path');

const pincodeStopsPath = path.join('c:/Users/smvin/Downloads/CHENN-AI/data/pincodeStops.json');

// Known Stations (Simplified list for matching)
const metroStations = [
    { name: 'Wimco Nagar', line: 'Blue Line' },
    { name: 'Tiruvottriyur', line: 'Blue Line' },
    { name: 'Washermanpet', line: 'Blue Line' },
    { name: 'Mannadi', line: 'Blue Line' },
    { name: 'High Court', line: 'Blue Line' },
    { name: 'Central', line: 'Blue Line' }, // Interchange
    { name: 'Government Estate', line: 'Blue Line' },
    { name: 'LIC', line: 'Blue Line' },
    { name: 'Thousand Lights', line: 'Blue Line' },
    { name: 'AG-DMS', line: 'Blue Line' },
    { name: 'Teynampet', line: 'Blue Line' },
    { name: 'Nandanam', line: 'Blue Line' },
    { name: 'Saidapet', line: 'Blue Line' },
    { name: 'Little Mount', line: 'Blue Line' },
    { name: 'Guindy', line: 'Blue Line' },
    { name: 'Alandur', line: 'Blue Line' },
    { name: 'Nanganallur', line: 'Blue Line' },
    { name: 'Meenambakkam', line: 'Blue Line' },
    { name: 'Airport', line: 'Blue Line' },
    { name: 'Egmore', line: 'Green Line' },
    { name: 'Nehru Park', line: 'Green Line' },
    { name: 'Kilpauk', line: 'Green Line' },
    { name: 'Pachaiyappa', line: 'Green Line' },
    { name: 'Shenoy Nagar', line: 'Green Line' },
    { name: 'Anna Nagar East', line: 'Green Line' },
    { name: 'Anna Nagar Tower', line: 'Green Line' },
    { name: 'Thirumangalam', line: 'Green Line' },
    { name: 'Koyambedu', line: 'Green Line' },
    { name: 'CMBT', line: 'Green Line' },
    { name: 'Arumbakkam', line: 'Green Line' },
    { name: 'Vadapalani', line: 'Green Line' },
    { name: 'Ashok Nagar', line: 'Green Line' },
    { name: 'Ekkattuthangal', line: 'Green Line' },
    { name: 'St. Thomas Mount', line: 'Green Line' }
];

const trainStations = [
    { name: 'Beach', line: 'South Line' },
    { name: 'Fort', line: 'South Line' },
    { name: 'Park', line: 'South Line' },
    { name: 'Egmore', line: 'South Line' },
    { name: 'Chetpet', line: 'South Line' },
    { name: 'Nungambakkam', line: 'South Line' },
    { name: 'Kodambakkam', line: 'South Line' },
    { name: 'Mambalam', line: 'South Line' },
    { name: 'Saidapet', line: 'South Line' },
    { name: 'Guindy', line: 'South Line' },
    { name: 'St. Thomas Mount', line: 'South Line' },
    { name: 'Pazhavanthangal', line: 'South Line' },
    { name: 'Meenambakkam', line: 'South Line' },
    { name: 'Tirusulam', line: 'South Line' },
    { name: 'Pallavaram', line: 'South Line' },
    { name: 'Chromepet', line: 'South Line' },
    { name: 'Tambaram', line: 'South Line' },
    { name: 'Perungalathur', line: 'South Line' },
    { name: 'Vandalur', line: 'South Line' },
    { name: 'Guduvancheri', line: 'South Line' },
    { name: 'Chengalpattu', line: 'South Line' },
    { name: 'Perambur', line: 'West Line' },
    { name: 'Villivakkam', line: 'West Line' },
    { name: 'Korattur', line: 'West Line' },
    { name: 'Pattaravakkam', line: 'West Line' },
    { name: 'Ambattur', line: 'West Line' },
    { name: 'Thirumullaivoyal', line: 'West Line' },
    { name: 'Annanur', line: 'West Line' },
    { name: 'Avadi', line: 'West Line' },
    { name: 'Hindu College', line: 'West Line' },
    { name: 'Pattabiram', line: 'West Line' },
    { name: 'Thiruninravur', line: 'West Line' },
    { name: 'Tiruvottiyur', line: 'North Line' },
    { name: 'Wimco Nagar', line: 'North Line' },
    { name: 'Kathivakkam', line: 'North Line' },
    { name: 'Ennore', line: 'North Line' },
    { name: 'Attipattu', line: 'North Line' },
    { name: 'Minjur', line: 'North Line' },
    { name: 'Chintadripet', line: 'MRTS' },
    { name: 'Chepauk', line: 'MRTS' },
    { name: 'Triplicane', line: 'MRTS' },
    { name: 'Light House', line: 'MRTS' },
    { name: 'Mundakanni', line: 'MRTS' },
    { name: 'Mylapore', line: 'MRTS' },
    { name: 'Mandaveli', line: 'MRTS' },
    { name: 'Greenways', line: 'MRTS' },
    { name: 'Kotturpuram', line: 'MRTS' },
    { name: 'Kasturibai', line: 'MRTS' },
    { name: 'Indira Nagar', line: 'MRTS' },
    { name: 'Thiruvanmiyur', line: 'MRTS' },
    { name: 'Taramani', line: 'MRTS' },
    { name: 'Perungudi', line: 'MRTS' },
    { name: 'Velachery', line: 'MRTS' }
];

try {
    const pincodeStops = JSON.parse(fs.readFileSync(pincodeStopsPath, 'utf8'));
    const newMetroMap = {};
    const newTrainMap = {};

    Object.keys(pincodeStops).forEach(pincode => {
        const data = pincodeStops[pincode];
        const stops = data.busStops || [];
        const queries = data.twitterQueries || [];
        const allText = [...stops, ...queries].join(' ').toLowerCase();

        // Find Metro Match
        let bestMetro = null;
        for (const station of metroStations) {
            if (allText.includes(station.name.toLowerCase())) {
                bestMetro = station;
                break; // Take first match
            }
        }
        if (bestMetro) {
            newMetroMap[pincode] = { name: bestMetro.name, line: bestMetro.line };
        }

        // Find Train Match
        let bestTrain = null;
        for (const station of trainStations) {
            if (allText.includes(station.name.toLowerCase())) {
                bestTrain = station;
                break;
            }
        }
        if (bestTrain) {
            newTrainMap[pincode] = { name: bestTrain.name, line: bestTrain.line };
        }
    });

    const output = {
        metro: newMetroMap,
        train: newTrainMap
    };
    fs.writeFileSync('transport_map.json', JSON.stringify(output, null, 2), 'utf8');
    console.log('Successfully wrote transport_map.json');


} catch (err) {
    console.error(err);
}
