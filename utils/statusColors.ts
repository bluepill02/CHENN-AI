// Utility functions for status colors and styling

export function getTrafficStatusColor(status: string): string {
  switch (status) {
    case 'clear': return 'bg-green-500';
    case 'moderate': return 'bg-yellow-500';
    case 'heavy': return 'bg-orange-500';
    case 'blocked': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

export function getServiceStatusColor(status: string): string {
  switch (status) {
    case 'operational': return 'bg-green-100 text-green-800 border-green-300';
    case 'disrupted': return 'bg-red-100 text-red-800 border-red-300';
    case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'emergency': return 'bg-red-500 text-white border-red-600';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

export function getAlertSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-500 text-white border-red-600';
    case 'high': return 'bg-red-100 text-red-800 border-red-300';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

export function getConnectionStatusColor(status: string): string {
  switch (status) {
    case 'connected': return 'text-green-600';
    case 'loading': return 'text-yellow-600';
    case 'error': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

export function getWeatherConditionIcon(condition: string): string {
  switch (condition) {
    case 'sunny': return '☀️';
    case 'rainy': return '🌧️';
    case 'cloudy': return '☁️';
    case 'partly_cloudy': return '🌤️';
    default: return '🌤️';
  }
}

export function getCategoryIcon(categoryEn: string): string {
  switch (categoryEn) {
    case 'food': return '🍛';
    case 'event': return '🎉';
    case 'festival': return '🎭';
    case 'help': return '🤝';
    case 'alert': return '⚠️';
    case 'list': return '📋';
    default: return '📢';
  }
}

export function getCategoryColor(categoryEn: string): string {
  switch (categoryEn) {
    case 'food': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'event': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'festival': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'help': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'alert': return 'bg-red-100 text-red-700 border-red-200';
    case 'list': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}