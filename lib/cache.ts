// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

export function getCachedData(key: string) {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function setCachedData(key: string, data: any) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export function clearCache() {
  cache.clear();
}

// Cache keys for different endpoints
export const CacheKeys = {
  USER: 'user',
  CLIENTS: 'clients',
  PROJECTS: 'projects',
  ANALYTICS: 'analytics',
  EXPENSES: 'expenses',
  REVENUE: 'revenue',
} as const;
