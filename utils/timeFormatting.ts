// Utility functions for time formatting
export function getRelativeTime(timestamp: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function getRelativeTimeTamil(timestamp: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'இப்போது';
  if (diffInMinutes < 60) return `${diffInMinutes} நிமிடங்கள் முன்`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} மணிநேரம் முன்`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} நாட்கள் முன்`;
}

export function formatTimestamp(timestamp: Date, language: 'en' | 'ta' = 'en'): string {
  return language === 'ta' ? getRelativeTimeTamil(timestamp) : getRelativeTime(timestamp);
}