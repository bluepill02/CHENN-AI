# Chennai Bus Data Integration

## Overview

The Chennai Community App now includes comprehensive live bus data integration, powered by a custom proxy service that fetches real-time transportation information from Chalo's public dashboard and normalizes it into a Tamil-first, culturally-aware data schema.

## Architecture

### Component Diagram
```
Chalo Public API → ChaloProxyService → API Route (/api/bus) → BusDataService → ExternalDataProvider → UI Components
```

### Data Flow
1. **Data Source**: Chalo's public Chennai transportation dashboard
2. **Proxy Layer**: ChaloProxyService handles fetching, parsing, and normalization
3. **API Endpoint**: `/api/bus` provides cached, normalized data to frontend
4. **React Service**: BusDataService manages client-side state and subscriptions
5. **Context Integration**: ExternalDataService includes bus data alongside weather/traffic
6. **UI Display**: LiveDataWidget shows real-time bus information

## File Structure

```
services/
├── ChaloProxyService.ts          # Core proxy service (343 lines)
├── BusDataService.ts             # React client service (255 lines)
└── ExternalDataService.tsx       # Updated with bus integration

pages/api/
└── bus.ts                        # API endpoint (181 lines)

components/LiveData/
└── LiveDataWidget.tsx            # Updated with bus section
```

## Key Features

### 🌍 Tamil-First Design
- **Route Names**: "Anna Salai Express" → "அண்ணா சாலை எக்ஸ்பிரஸ்"
- **Area Names**: "T.Nagar" → "டி.நகர்"
- **Status Messages**: "Running" → "இயங்கி வருகிறது"
- **Route Numbers**: "21G" → "21ஜி"

### 🚌 Real-Time Data
- Live bus locations and ETAs
- Route status (running/delayed/stopped)
- Bus count per route
- Next arrival predictions
- Chennai area detection

### 🔄 Robust Error Handling
- Multiple Chalo API endpoint fallbacks
- 30-second intelligent caching
- Mock data generation for offline scenarios
- Comprehensive validation and sanitization
- Graceful degradation

### 📍 Chennai Area Coverage
- T.Nagar (டி.நகர்)
- Anna Nagar (அண்ணா நகர்)
- Mylapore (மயிலாப்பூர்)
- Adyar (அடையாறு)
- Velachery (வேளச்சேரி)
- Tambaram (தாம்பரம்)
- Guindy (கிண்டி)
- Egmore (எழும்பூர்)
- Koyambedu (கோயம்பேடு)
- And 6+ more areas

## API Reference

### GET /api/bus

Returns normalized Chennai bus data with Tamil-first schema.

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "routeNumber": "21G",
      "routeName": "Anna Salai Express",
      "routeNameTamil": "அண்ணா சாலை எக்ஸ்பிரஸ்",
      "areaDisplayName": "T.Nagar Central",
      "areaDisplayNameTamil": "டி.நகர் மத்திய",
      "busStatus": "running",
      "busStatusTamil": "இயங்கி வருகிறது",
      "nextArrival": "5 mins",
      "busCount": 3,
      "location": {
        "district": "Chennai",
        "area": "T.Nagar",
        "coordinates": {
          "lat": 13.0431,
          "lng": 80.2338
        }
      },
      "message": {
        "en": "Bus 21G near T.Nagar",
        "ta": "டி.நகர் அருகில் பஸ் 21ஜி"
      },
      "timestamp": "2025-09-22T10:30:00.000Z",
      "source": {
        "provider": "Chalo Proxy",
        "route": "21G",
        "vehicle": "TN01AB1234"
      }
    }
  ],
  "meta": {
    "count": 15,
    "source": "live", // "live" | "cached" | "mock"
    "timestamp": "2025-09-22T10:30:00.000Z",
    "errors": [] // Array of error messages if any
  }
}
```

**Response Sources:**
- `"live"`: Fresh data from Chalo API
- `"cached"`: Served from 30-second cache
- `"mock"`: Fallback Chennai bus data

**Error Handling:**
- 200: Success (may include fallback data)
- 405: Method not allowed (use GET)
- 500: Server error (includes emergency mock data)

## React Integration

### Using the Bus Data Hook

```typescript
import { useBusData } from '../services/BusDataService';

function BusComponent() {
  const { busData, isLoading, error, refreshBusData } = useBusData();
  
  if (isLoading) return <div>பேருந்து தகவல்கள் ஏற்றப்படுகின்றன...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h3>Live Chennai Bus Data</h3>
      {busData.map(bus => (
        <div key={bus.routeNumber}>
          <span className="route-badge">{bus.routeNumber}</span>
          <span>{bus.routeNameTamil}</span>
          <span className="area">{bus.areaDisplayNameTamil}</span>
          <span className="status">{bus.busStatusTamil}</span>
          {bus.nextArrival && <span>Next: {bus.nextArrival}</span>}
        </div>
      ))}
      <button onClick={refreshBusData}>Refresh</button>
    </div>
  );
}
```

### Using with External Data Context

```typescript
import { useExternalData } from '../services/ExternalDataService';

function IntegratedDataComponent() {
  const { 
    busData, 
    weather, 
    traffic, 
    apiStatus,
    getBusDataByArea,
    refreshBusData 
  } = useExternalData();
  
  // Filter buses by area
  const tnBuses = getBusDataByArea('T.Nagar');
  
  return (
    <div>
      <h3>T.Nagar Transportation</h3>
      
      {/* Weather */}
      <div>Weather: {weather?.temperature}°C</div>
      
      {/* Traffic */}
      <div>Traffic: {traffic.length} routes monitored</div>
      
      {/* Buses */}
      <div>
        Buses: {tnBuses.length} routes active
        <div className="bus-list">
          {tnBuses.map(bus => (
            <div key={bus.routeNumber}>
              {bus.routeNumberTamil} - {bus.busStatusTamil}
            </div>
          ))}
        </div>
      </div>
      
      {/* API Status */}
      <div className="api-status">
        Bus API: {apiStatus.bus}
      </div>
    </div>
  );
}
```

## Performance Considerations

### Caching Strategy
- **Client Cache**: 45-second refresh in BusDataService
- **Server Cache**: 30-second cache in API endpoint
- **Efficient Updates**: Only notify subscribers on data changes

### Network Optimization
- **Timeout Handling**: 10-second fetch timeout
- **Retry Logic**: 2 automatic retries with exponential backoff
- **Fallback Chain**: Live → Cached → Mock → Empty

### Memory Management
- **Subscription Cleanup**: Automatic unsubscribe on component unmount
- **Data Pruning**: Old data automatically replaced
- **Efficient Filtering**: Area and route filtering without data duplication

## Configuration

### Chalo API Configuration
```typescript
const CHALO_CONFIG = {
  BASE_URL: 'https://app.chalo.com',
  CHENNAI_ROUTES_API: '/api/v1/chennai/routes',
  LIVE_VEHICLES_API: '/api/v1/chennai/vehicles/live',
  PUBLIC_DASHBOARD: '/chennai/live'
};
```

### Service Configuration
```typescript
const BUS_API_CONFIG = {
  ENDPOINT: '/api/bus',
  REFRESH_INTERVAL: 45000, // 45 seconds
  TIMEOUT: 8000,           // 8 seconds
  MAX_RETRIES: 2
};
```

## Monitoring and Debugging

### Logging
- All services include comprehensive console logging
- Error tracking with context and stack traces
- Performance timing for API calls
- Cache hit/miss statistics

### Error Categories
1. **Network Errors**: Chalo API unreachable
2. **Parse Errors**: Invalid JSON or HTML structure
3. **Validation Errors**: Missing required fields
4. **Transform Errors**: Normalization failures

### Debug Mode
Enable detailed logging:
```typescript
// In browser console
localStorage.setItem('bus-debug', 'true');
```

## Testing

### Manual Testing
1. Open Chennai Community App
2. Expand Live Data Widget
3. Verify "Live Bus Data" section appears
4. Check Tamil text rendering
5. Verify automatic refresh (45 seconds)
6. Test offline behavior (disable network)

### API Testing
```bash
# Test the API endpoint directly
curl http://localhost:3000/api/bus

# Check response structure
curl -s http://localhost:3000/api/bus | jq '.meta.source'
```

## Future Enhancements

### Planned Features
- **Route Planning**: Integration with Chennai Metro data
- **Predictive ETAs**: Machine learning for better arrival times
- **Crowd Sourcing**: User-reported bus delays and issues
- **Push Notifications**: Critical route disruptions
- **Offline Maps**: Cached route information for offline use

### Technical Improvements
- **WebSocket Integration**: Real-time updates without polling
- **Service Worker**: Background data synchronization
- **IndexedDB**: Client-side data persistence
- **Progressive Web App**: Installable mobile experience

## Troubleshooting

### Common Issues

**Bus data not loading:**
1. Check internet connection
2. Verify API endpoint is accessible
3. Check browser console for errors
4. Ensure Tamil fonts are installed

**Tamil text not displaying:**
1. Verify browser supports Unicode Tamil
2. Check font fallbacks in CSS
3. Test with different browsers

**Performance issues:**
1. Check network tab for excessive requests
2. Verify caching is working (meta.source: "cached")
3. Monitor memory usage in DevTools

### Recovery Procedures

**API completely down:**
- Service automatically falls back to mock data
- Users see realistic Chennai bus information
- Error status displayed in UI

**Partial data corruption:**
- Individual record validation prevents bad data
- Service continues with valid records
- Error count logged for monitoring

## Contributing

When contributing to the bus data integration:

1. **Maintain Tamil-first approach**: Always prioritize Tamil localization
2. **Follow error handling patterns**: Use try-catch with detailed logging
3. **Test with mock data**: Ensure fallbacks work correctly
4. **Document changes**: Update this README for any modifications
5. **Consider performance**: Optimize for mobile networks in Chennai

## Contact

For questions about the bus data integration:
- **Technical Issues**: Check GitHub issues
- **Feature Requests**: Create GitHub issue with `enhancement` label
- **Cultural Localization**: Ensure Tamil authenticity in all contributions

---

*This integration brings real-time Chennai public transportation data to the community app, making it easier for residents to navigate their city with pride in their Tamil heritage.*