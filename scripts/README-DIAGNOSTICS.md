# CHENN-AI Real-Time Data Diagnostics

This directory contains tools to diagnose and fix real-time data connectivity issues in the CHENN-AI application.

## Diagnostic Tools

### 1. API Diagnostics

To diagnose API connectivity issues:

```bash
npx ts-node scripts/api-diagnostics.ts
```

This script will test all API endpoints and report on their status. It will help identify which APIs are failing and why.

### 2. Connectivity Diagnostics

For a more comprehensive diagnosis:

```bash
npx ts-node scripts/api-connector.ts
```

This will:
- Check environment variables
- Test API endpoints
- Analyze Vite configuration
- Provide detailed recommendations

### 3. Interactive Fix Tool

To use the interactive tool for fixing real-time data issues:

```bash
npx ts-node scripts/fix-real-time-data.ts
```

This interactive tool provides a menu-based interface to:
- Run diagnostics
- Test individual API endpoints
- Fix Vite configuration
- Create/update .env file with API keys

## Common Issues and Solutions

### 1. Missing API Keys

Real-time data requires API keys for external services. Add these to your `.env` file:

```
REACT_APP_OPENWEATHER_API_KEY=your_key_here
REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here
REACT_APP_TOMTOM_API_KEY=your_key_here
```

You can get API keys from:
- [OpenWeather](https://openweathermap.org/api)
- [Google Maps](https://developers.google.com/maps/documentation/javascript/get-api-key)
- [TomTom](https://developer.tomtom.com/)

### 2. Missing API Proxy Configuration

The app needs CORS proxying to access external APIs. Fix with:

```bash
npx ts-node scripts/fix-vite-config.ts
```

This adds proper proxy configuration to `vite.config.ts`.

### 3. Network Connectivity

Make sure your development environment has internet access to reach external APIs.

## Manual Testing

To manually test specific APIs:

```bash
# Test all APIs
npx ts-node scripts/test-api.ts all

# Test specific API
npx ts-node scripts/test-api.ts weather
npx ts-node scripts/test-api.ts traffic
npx ts-node scripts/test-api.ts public-services
npx ts-node scripts/test-api.ts bus
```

## After Fixing Issues

1. Restart your development server
2. Run diagnostics again to verify connectivity
3. Check the app to ensure real-time data is flowing

If issues persist, check the console for errors and run the diagnostic tools again.