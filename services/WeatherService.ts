
export interface WeatherData {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    icon: string;
}

export const WeatherService = {
    /**
     * Fetch current weather for a given location
     */
    async getWeather(lat: number, lon: number): Promise<WeatherData | null> {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
            );

            if (!response.ok) {
                throw new Error('Weather API failed');
            }

            const data = await response.json();
            const current = data.current;

            return {
                temperature: Math.round(current.temperature_2m),
                humidity: current.relative_humidity_2m,
                windSpeed: current.wind_speed_10m,
                condition: getWeatherCondition(current.weather_code),
                icon: getWeatherIcon(current.weather_code)
            };
        } catch (error) {
            console.error('Failed to fetch weather:', error);
            return null;
        }
    }
};

/**
 * Map WMO weather codes to readable conditions
 */
function getWeatherCondition(code: number): string {
    if (code === 0) return 'Clear Sky';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 61 && code <= 65) return 'Rainy';
    if (code >= 71 && code <= 77) return 'Snowy';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Clear';
}

/**
 * Map WMO weather codes to Lucide icon names or custom icon identifiers
 */
function getWeatherIcon(code: number): string {
    if (code === 0) return 'Sun';
    if (code >= 1 && code <= 3) return 'CloudSun';
    if (code >= 45 && code <= 48) return 'CloudFog';
    if (code >= 51 && code <= 65) return 'CloudRain';
    if (code >= 71 && code <= 77) return 'Snowflake';
    if (code >= 80 && code <= 82) return 'CloudRain';
    if (code >= 95 && code <= 99) return 'CloudLightning';
    return 'Sun';
}
