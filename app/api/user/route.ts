import { getUser } from '@/lib/db/queries';
import { getCachedData, setCachedData, CacheKeys } from '@/lib/cache';

export async function GET() {
  // Always fetch fresh user data to avoid stale authentication state
  const user = await getUser();
  
  // Only cache if user is authenticated
  if (user) {
    setCachedData(CacheKeys.USER, user);
  } else {
    // Clear cache if user is not authenticated
    const { clearCache } = await import('@/lib/cache');
    clearCache();
  }
  
  return Response.json(user, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}


