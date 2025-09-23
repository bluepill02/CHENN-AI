const fs = require('fs');
const path = require('path');

// Read the current pincodeStops.json
const pincodeStopsPath = path.join(__dirname, '../data/pincodeStops.json');
const currentData = JSON.parse(fs.readFileSync(pincodeStopsPath, 'utf8'));

// Function to generate Twitter queries based on area names
function generateTwitterQueries(busStops, pincode) {
  const queries = [];
  
  // Add area-specific queries
  busStops.forEach(stop => {
    const cleanStop = stop.replace(/Bus Stand|Bus Stop|Bus Depot|Terminus/gi, '').trim();
    queries.push(`${cleanStop} Chennai`);
    
    // Add traffic-specific query for major stops
    if (stop.includes('Bus Stand') || stop.includes('Station') || stop.includes('Depot')) {
      queries.push(`${cleanStop} traffic`);
    }
  });
  
  // Add common Chennai hashtags and generic queries
  queries.push('#ChennaiTraffic');
  queries.push(`Chennai ${pincode}`);
  
  // Add area-specific hashtags for well-known areas
  const primaryArea = busStops[0] || '';
  if (primaryArea.includes('T. Nagar') || primaryArea.includes('T.Nagar')) {
    queries.push('#TNagarChennai');
  } else if (primaryArea.includes('Mylapore')) {
    queries.push('#MylaporeChennai');
  } else if (primaryArea.includes('Adyar')) {
    queries.push('#AdyarChennai');
  } else if (primaryArea.includes('Anna Nagar')) {
    queries.push('#AnnaNagarChennai');
  } else if (primaryArea.includes('Vadapalani')) {
    queries.push('#VadapalaniChennai');
  } else if (primaryArea.includes('Airport') || primaryArea.includes('Meenambakkam')) {
    queries.push('#ChennaiAirport');
  } else if (primaryArea.includes('Central') || primaryArea.includes('Railway')) {
    queries.push('#ChennaiRailway');
  } else if (primaryArea.includes('Metro')) {
    queries.push('#ChennaiMetro');
  } else if (primaryArea.includes('Hospital') || primaryArea.includes('Medical')) {
    queries.push('#ChennaiMedical');
  } else if (primaryArea.includes('IT') || primaryArea.includes('Sholinganallur') || primaryArea.includes('OMR')) {
    queries.push('#ChennaiIT');
  }
  
  // Remove duplicates and limit to 6 queries per area
  return [...new Set(queries)].slice(0, 6);
}

// Transform the data
const newData = {};

Object.entries(currentData).forEach(([pincode, busStops]) => {
  newData[pincode] = {
    busStops: busStops,
    twitterQueries: generateTwitterQueries(busStops, pincode)
  };
});

// Write the new file
const outputPath = path.join(__dirname, '../data/pincodeStops_with_twitter_complete.json');
fs.writeFileSync(outputPath, JSON.stringify(newData, null, 2));

console.log(`Transformation complete! New file created at: ${outputPath}`);
console.log(`Processed ${Object.keys(newData).length} pincodes`);